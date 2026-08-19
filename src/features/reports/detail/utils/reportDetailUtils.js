import { formatDate } from "@/shared/utils";

import {
  createLookupMap,
  getReportClassName,
  getReportProgramName,
  getReportStudentName,
  getReportTeacherName,
  normalizeId,
} from "../../domain/reportSelectors";

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
 * LOOKUP
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
} = {}) => {
  return {
    studentMap: ensureLookupMap(students),

    teacherMap: ensureLookupMap(teachers),

    programMap: ensureLookupMap(programs),

    classMap: ensureLookupMap(classes),
  };
};

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
 * RELATION NORMALIZATION
 * ============================================================ */

const normalizeRelationList = (items, field) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => item?.[field]).filter((value) => hasValue(value));
};

const normalizePhotoList = (photos) => {
  if (!Array.isArray(photos)) {
    return [];
  }

  return photos
    .map((item) =>
      typeof item === "string"
        ? item
        : (item?.photo_url ??
          item?.url ??
          item?.image_url ??
          item?.photo ??
          null),
    )
    .filter(Boolean);
};

/* ============================================================
 * VIEW MODEL
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

  lookupMaps,
} = {}) => {
  if (!report) {
    return null;
  }

  const maps =
    lookupMaps ??
    createReportLookupMaps({
      students,
      teachers,
      programs,
      classes,
    });

  const names = getReportNames({
    report,

    studentMap: maps.studentMap,

    teacherMap: maps.teacherMap,

    programMap: maps.programMap,

    classMap: maps.classMap,
  });

  return {
    id: report.id,

    studentId: normalizeId(report.student_id),

    teacherId: normalizeId(report.teacher_id),

    programId: normalizeId(report.program_id),

    classId: normalizeId(report.class_id),

    ...names,

    reportDate: report.report_date ?? report.date ?? report.created_at ?? null,

    status: report.status ?? null,

    duration: report.duration ?? null,

    score: report.score ?? null,

    ratings: {
      understanding: Number(report.rating_understanding) || 0,

      activity: Number(report.rating_activity) || 0,

      discipline: Number(report.rating_discipline) || 0,

      communication: Number(report.rating_communication) || 0,
    },

    homework: report.homework ?? "",

    teacherNote: report.teacher_note ?? "",

    recommendation: report.recommendation ?? "",

    materials: normalizeRelationList(materials, "material"),

    activities: normalizeRelationList(activities, "activity"),

    photos: normalizePhotoList(photos),
  };
};
