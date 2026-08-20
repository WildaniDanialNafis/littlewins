import {
  createLookupMap,
  getReportClassName,
  getReportProgramName,
  getReportStudentName,
  getReportTeacherName,
  normalizeId,
} from "./reportSelectors";

/* ============================================================
 * BASIC
 * ============================================================ */

const normalizeString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const normalizeNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

/* ============================================================
 * RATING
 * ============================================================ */

const normalizeRating = (value, fallback = 0) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(5, Math.max(0, Math.round(number)));
};

const readRating = (report, nestedKey, flatKey) => {
  const nestedValue = report?.ratings?.[nestedKey];

  /*
   * Nested API shape adalah source
   * yang lebih prioritas.
   */
  if (nestedValue !== null && nestedValue !== undefined && nestedValue !== "") {
    return normalizeRating(nestedValue, 0);
  }

  /*
   * Backward compatibility dengan
   * response flat lama.
   */
  return normalizeRating(report?.[flatKey], 0);
};

export const normalizeRatings = (report) => {
  return {
    understanding: readRating(report, "understanding", "rating_understanding"),

    activity: readRating(report, "activity", "rating_activity"),

    discipline: readRating(report, "discipline", "rating_discipline"),

    communication: readRating(report, "communication", "rating_communication"),
  };
};

/* ============================================================
 * RELATIONS
 * ============================================================ */

const normalizeRelationValues = (items, fields) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (!item || typeof item !== "object") {
        return "";
      }

      for (const field of fields) {
        const value = item?.[field];

        const normalized = normalizeString(value);

        if (normalized) {
          return normalized;
        }
      }

      return "";
    })
    .filter(Boolean);
};

/* ============================================================
 * PHOTOS
 * ============================================================ */

const normalizePhotos = (photos) => {
  if (!Array.isArray(photos)) {
    return [];
  }

  return photos
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (!item || typeof item !== "object") {
        return "";
      }

      return normalizeString(
        item?.photo_url ?? item?.url ?? item?.image_url ?? item?.photo ?? "",
      );
    })
    .filter(Boolean);
};

/* ============================================================
 * MAP
 * ============================================================ */

const normalizeMap = (value) => {
  if (value instanceof Map) {
    return value;
  }

  return createLookupMap(Array.isArray(value) ? value : []);
};

/* ============================================================
 * IDENTITY
 * ============================================================ */

const getStudentId = (report) => {
  return normalizeId(
    report?.student_id ?? report?.studentId ?? report?.student?.id,
  );
};

const getTeacherId = (report) => {
  return normalizeId(
    report?.teacher_id ?? report?.teacherId ?? report?.teacher?.id,
  );
};

const getProgramId = (report) => {
  return normalizeId(
    report?.program_id ?? report?.programId ?? report?.program?.id,
  );
};

const getClassId = (report) => {
  return normalizeId(report?.class_id ?? report?.classId ?? report?.class?.id);
};

/* ============================================================
 * CANONICAL REPORT
 *
 * IMPORTANT:
 * normalizeReport harus tetap diexport karena
 * dipakai oleh reportDetailUtils dan consumer lain.
 * ============================================================ */

export const normalizeReport = (
  report,
  {
    students = [],
    teachers = [],
    programs = [],
    classes = [],
    materials = [],
    activities = [],
    photos = [],
  } = {},
) => {
  if (!report || typeof report !== "object") {
    return null;
  }

  const studentMap = normalizeMap(students);

  const teacherMap = normalizeMap(teachers);

  const programMap = normalizeMap(programs);

  const classMap = normalizeMap(classes);

  const ratings = normalizeRatings(report);

  const studentId = getStudentId(report);

  const teacherId = getTeacherId(report);

  const programId = getProgramId(report);

  const classId = getClassId(report);

  return {
    /* ========================================================
     * IDENTITY
     * ======================================================== */

    id: normalizeId(report.id),

    studentId,

    teacherId,

    programId,

    classId,

    /* ========================================================
     * NAMES
     * ======================================================== */

    studentName: getReportStudentName(report, studentMap),

    teacherName: getReportTeacherName(report, teacherMap),

    programName: getReportProgramName(report, programMap),

    className: getReportClassName(report, classMap),

    /* ========================================================
     * DATE / SESSION
     * ======================================================== */

    reportDate:
      report.report_date ??
      report.reportDate ??
      report.date ??
      report.created_at ??
      null,

    status: normalizeString(report.status) || null,

    duration: normalizeNumber(report.duration),

    score: normalizeNumber(report.score),

    /* ========================================================
     * RATINGS
     * ======================================================== */

    ratings,

    /* ========================================================
     * TEXT
     * ======================================================== */

    homework: normalizeString(report.homework),

    teacherNote: normalizeString(report.teacher_note ?? report.teacherNote),

    recommendation: normalizeString(report.recommendation),

    /* ========================================================
     * RELATIONS
     * ======================================================== */

    materials: normalizeRelationValues(materials, [
      "material",
      "value",
      "name",
    ]),

    activities: normalizeRelationValues(activities, [
      "activity",
      "value",
      "name",
    ]),

    /* ========================================================
     * PHOTOS
     * ======================================================== */

    photos: normalizePhotos(photos),

    /* ========================================================
     * RAW
     * ======================================================== */

    raw: report,
  };
};

/* ============================================================
 * LIST COMPATIBILITY MODEL
 *
 * UI existing tetap memakai field snake_case.
 * Jangan pindahkan consumer UI ke model canonical
 * hanya karena canonical model baru tersedia.
 * ============================================================ */

export const normalizeReportListItem = (
  report,
  { students = [], teachers = [], programs = [], classes = [] } = {},
) => {
  if (!report || typeof report !== "object") {
    return null;
  }

  const studentMap = normalizeMap(students);

  const teacherMap = normalizeMap(teachers);

  const programMap = normalizeMap(programs);

  const classMap = normalizeMap(classes);

  const normalized = normalizeReport(report, {
    students: studentMap,

    teachers: teacherMap,

    programs: programMap,

    classes: classMap,
  });

  if (!normalized) {
    return null;
  }

  return {
    ...report,

    id: normalized.id,

    student_id: normalized.studentId,

    teacher_id: normalized.teacherId,

    program_id: normalized.programId,

    class_id: normalized.classId,

    student_name: normalized.studentName,

    teacher_name: normalized.teacherName,

    program_name: normalized.programName,

    class_name: normalized.className,

    /*
     * Compatibility fields untuk UI existing.
     */
    rating_understanding: normalized.ratings.understanding,

    rating_activity: normalized.ratings.activity,

    rating_discipline: normalized.ratings.discipline,

    rating_communication: normalized.ratings.communication,

    /*
     * Tambahkan canonical ratings juga,
     * tanpa menghapus field lama.
     */
    ratings: normalized.ratings,
  };
};

/* ============================================================
 * OPTIONS
 * ============================================================ */

export const normalizeReportOptions = (items, fallback = "Item") => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const id = normalizeId(item?.id);

      if (id === null) {
        return null;
      }

      const label =
        item?.full_name ??
        item?.nama_lengkap ??
        item?.name ??
        item?.nama ??
        item?.title ??
        item?.label ??
        `${fallback} ${id}`;

      return {
        value: String(id),

        label: normalizeString(label) || `${fallback} ${id}`,
      };
    })
    .filter(Boolean);
};

/* ============================================================
 * SCORE
 * ============================================================ */

export const normalizeReportScore = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const score = Number(value);

  if (!Number.isFinite(score)) {
    return null;
  }

  return Math.min(100, Math.max(0, score));
};

/* ============================================================
 * DURATION
 * ============================================================ */

export const normalizeReportDuration = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const duration = Number(value);

  if (!Number.isInteger(duration) || duration < 0) {
    return null;
  }

  return duration;
};

/* ============================================================
 * DEFAULT EXPORT
 * ============================================================ */

export default {
  normalizeReport,

  normalizeRatings,

  normalizeReportListItem,

  normalizeReportOptions,

  normalizeReportScore,

  normalizeReportDuration,
};
