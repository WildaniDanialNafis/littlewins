import { formatDate } from "@/shared/utils";

import {
  createLookupMap,
  getReportClassName,
  getReportProgramName,
  getReportStudentName,
  getReportTeacherName,
  normalizeId,
} from "../../domain/reportSelectors";

import { normalizeReport } from "../../domain/reportNormalizer";

/* ============================================================
 * BASIC
 * ============================================================ */

export const hasValue = (value) => {
  return value !== null && value !== undefined && value !== "";
};

export { createLookupMap, normalizeId };

/* ============================================================
 * NAME
 * ============================================================ */

export const getName = (item, fallback = "-") => {
  if (!item) {
    return fallback;
  }

  const value =
    item.full_name ?? item.nama_lengkap ?? item.name ?? item.nama ?? "";

  const normalized = String(value).trim();

  return normalized || fallback;
};

/* ============================================================
 * LOOKUPS
 * ============================================================ */

const ensureLookupMap = (items) => {
  return items instanceof Map
    ? items
    : createLookupMap(Array.isArray(items) ? items : []);
};

export const createReportLookupMaps = ({
  students = [],
  teachers = [],
  programs = [],
  classes = [],
} = {}) => ({
  studentMap: ensureLookupMap(students),

  teacherMap: ensureLookupMap(teachers),

  programMap: ensureLookupMap(programs),

  classMap: ensureLookupMap(classes),
});

/* ============================================================
 * REPORT NAMES
 * ============================================================ */

export const getReportNames = ({
  report,

  students = [],
  teachers = [],
  programs = [],
  classes = [],

  studentMap,
  teacherMap,
  programMap,
  classMap,
} = {}) => {
  const maps =
    studentMap && teacherMap && programMap && classMap
      ? {
          studentMap,

          teacherMap,

          programMap,

          classMap,
        }
      : createReportLookupMaps({
          students,

          teachers,

          programs,

          classes,
        });

  return {
    studentName: getReportStudentName(report, maps.studentMap),

    teacherName: getReportTeacherName(report, maps.teacherMap),

    programName: getReportProgramName(report, maps.programMap),

    className: getReportClassName(report, maps.classMap),
  };
};

/* ============================================================
 * SCORE
 * ============================================================ */

export const getNilaiBand = (score) => {
  if (!hasValue(score)) {
    return "empty";
  }

  const numericScore = Number(score);

  if (!Number.isFinite(numericScore)) {
    return "empty";
  }

  if (numericScore >= 90) {
    return "excellent";
  }

  if (numericScore >= 80) {
    return "good";
  }

  if (numericScore >= 70) {
    return "fair";
  }

  return "low";
};

export const getNilaiStyle = (score) => {
  switch (getNilaiBand(score)) {
    case "excellent":
      return {
        text: "text-success",

        background: "bg-success-soft ring-success/20",
      };

    case "good":
      return {
        text: "text-info",

        background: "bg-info-soft ring-info/20",
      };

    case "fair":
      return {
        text: "text-warning",

        background: "bg-warning-soft ring-warning/20",
      };

    case "low":
      return {
        text: "text-danger",

        background: "bg-danger-soft ring-danger/20",
      };

    default:
      return null;
  }
};

/* ============================================================
 * DATE
 * ============================================================ */

export const formatReportDate = (value) => {
  if (!hasValue(value)) {
    return "-";
  }

  return formatDate(value);
};

/* ============================================================
 * RATING
 * ============================================================ */

const getRatingValue = (report, nestedKey, flatKey) => {
  const nested = report?.ratings?.[nestedKey];

  if (nested !== null && nested !== undefined && nested !== "") {
    return Number(nested);
  }

  return Number(report?.[flatKey]);
};

export const getReportRatings = (report) => ({
  understanding: getRatingValue(
    report,
    "understanding",
    "rating_understanding",
  ),

  activity: getRatingValue(report, "activity", "rating_activity"),

  discipline: getRatingValue(report, "discipline", "rating_discipline"),

  communication: getRatingValue(
    report,
    "communication",
    "rating_communication",
  ),
});

export const getReportAverageRating = (report) => {
  if (!report) {
    return null;
  }

  const values = Object.values(getReportRatings(report)).filter(
    (value) => Number.isFinite(value) && value > 0,
  );

  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

/* ============================================================
 * COLLECTIONS
 * ============================================================ */

const getRelationValue = (item, fields) => {
  if (typeof item === "string") {
    return item.trim();
  }

  if (!item || typeof item !== "object") {
    return "";
  }

  for (const field of fields) {
    const value = item[field];

    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value).trim();
    }
  }

  return "";
};

const normalizeRelationList = (items, fields) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => getRelationValue(item, fields)).filter(Boolean);
};

const normalizePhotoList = (photos) => {
  if (!Array.isArray(photos)) {
    return [];
  }

  return photos
    .map((item) =>
      getRelationValue(item, ["photo_url", "url", "image_url", "photo"]),
    )
    .filter(Boolean);
};

export const getReportCollections = ({
  materials = [],
  activities = [],
  photos = [],
} = {}) => ({
  materials: normalizeRelationList(materials, ["material", "value", "name"]),

  activities: normalizeRelationList(activities, ["activity", "value", "name"]),

  photos: normalizePhotoList(photos),
});

/* ============================================================
 * SORT
 * ============================================================ */

const getReportTimestamp = (report) => {
  if (!report) {
    return Number.NEGATIVE_INFINITY;
  }

  const value =
    report.reportDate ?? report.report_date ?? report.date ?? report.created_at;

  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(value));

  const timestamp = dateOnly
    ? new Date(`${value}T00:00:00`).getTime()
    : new Date(value).getTime();

  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
};

export const sortReportsByDate = (reports, direction = "desc") => {
  if (!Array.isArray(reports)) {
    return [];
  }

  const multiplier = direction === "asc" ? 1 : -1;

  return [...reports].sort((first, second) => {
    const result =
      (getReportTimestamp(first) - getReportTimestamp(second)) * multiplier;

    if (result !== 0) {
      return result;
    }

    const firstId = normalizeId(first?.id) ?? 0;

    const secondId = normalizeId(second?.id) ?? 0;

    return (firstId - secondId) * multiplier;
  });
};

/* ============================================================
 * CANONICAL VIEW
 * ============================================================ */

export const normalizeReportView = ({
  report,

  materials = [],
  activities = [],
  photos = [],

  students = [],
  teachers = [],
  programs = [],
  classes = [],
} = {}) => {
  if (!report || typeof report !== "object") {
    return null;
  }

  return normalizeReport(report, {
    students,

    teachers,

    programs,

    classes,

    materials,

    activities,

    photos,
  });
};
