const isValidArray = (value) => {
  return Array.isArray(value);
};

/* ============================================================
 * ID
 * ============================================================ */

export const normalizeId = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = String(value).trim();

  if (!normalized || normalized === "null" || normalized === "undefined") {
    return null;
  }

  const number = Number(normalized);

  if (!Number.isInteger(number) || number <= 0) {
    return null;
  }

  return number;
};

/* ============================================================
 * ENTITY ID
 * ============================================================ */

const getEntityId = (entity) => {
  if (!entity || typeof entity !== "object") {
    return null;
  }

  return normalizeId(entity.id ?? entity.value ?? entity.entity_id);
};

/* ============================================================
 * DATE
 * ============================================================ */

export const getReportDate = (report) => {
  if (!report || typeof report !== "object") {
    return null;
  }

  return (
    report.report_date ??
    report.reportDate ??
    report.date ??
    report.created_at ??
    null
  );
};

const parseReportTimestamp = (value) => {
  if (value === null || value === undefined || value === "") {
    return Number.NEGATIVE_INFINITY;
  }

  const normalized = String(value).trim();

  if (!normalized) {
    return Number.NEGATIVE_INFINITY;
  }

  /*
   * Calendar-only date.
   *
   * Use local midnight rather than depending
   * on browser interpretation of YYYY-MM-DD.
   */
  const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

  const timestamp = dateOnlyPattern.test(normalized)
    ? new Date(`${normalized}T00:00:00`).getTime()
    : new Date(normalized).getTime();

  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
};

export const getReportTimestamp = (report) => {
  return parseReportTimestamp(getReportDate(report));
};

/* ============================================================
 * LATEST
 * ============================================================ */

export const getLatestReport = (reports) => {
  if (!isValidArray(reports) || reports.length === 0) {
    return null;
  }

  let latest = null;

  let latestTimestamp = Number.NEGATIVE_INFINITY;

  let latestId = 0;

  for (const report of reports) {
    const timestamp = getReportTimestamp(report);

    const id = normalizeId(report?.id) ?? 0;

    if (
      latest === null ||
      timestamp > latestTimestamp ||
      (timestamp === latestTimestamp && id > latestId)
    ) {
      latest = report;

      latestTimestamp = timestamp;

      latestId = id;
    }
  }

  return latest;
};

/* ============================================================
 * REPORT OWNER
 * ============================================================ */

export const getReportTeacherId = (report) => {
  if (!report) {
    return null;
  }

  return normalizeId(
    report.teacher_id ?? report.teacherId ?? report.teacher?.id,
  );
};

export const getReportStudentId = (report) => {
  if (!report) {
    return null;
  }

  return normalizeId(
    report.student_id ?? report.studentId ?? report.student?.id,
  );
};

export const getReportProgramId = (report) => {
  if (!report) {
    return null;
  }

  return normalizeId(
    report.program_id ?? report.programId ?? report.program?.id,
  );
};

export const getReportClassId = (report) => {
  if (!report) {
    return null;
  }

  return normalizeId(report.class_id ?? report.classId ?? report.class?.id);
};

/* ============================================================
 * ACCOUNT FILTER
 * ============================================================ */

export const filterReportsByAccount = (reports, role, accountId) => {
  if (!isValidArray(reports)) {
    return [];
  }

  const normalizedAccountId = normalizeId(accountId);

  if (normalizedAccountId === null) {
    return [];
  }

  switch (role) {
    case "teacher":
      return reports.filter(
        (report) => getReportTeacherId(report) === normalizedAccountId,
      );

    case "student":
      return reports.filter(
        (report) => getReportStudentId(report) === normalizedAccountId,
      );

    default:
      return [];
  }
};

/* ============================================================
 * LOOKUP MAP
 * ============================================================ */

export const createLookupMap = (items = []) => {
  if (!isValidArray(items)) {
    return new Map();
  }

  const map = new Map();

  for (const item of items) {
    const id = getEntityId(item);

    if (id === null) {
      continue;
    }

    map.set(id, item);
  }

  return map;
};

/* ============================================================
 * ENTITY NAME
 * ============================================================ */

export const getEntityName = (entity, fallback = "-") => {
  if (!entity || typeof entity !== "object") {
    return fallback;
  }

  const candidates = [
    entity.full_name,
    entity.nama_lengkap,
    entity.name,
    entity.nama,
    entity.title,
    entity.label,
  ];

  for (const value of candidates) {
    if (typeof value === "string") {
      const normalized = value.trim();

      if (normalized) {
        return normalized;
      }
    }
  }

  return fallback;
};

/* ============================================================
 * GENERIC REPORT NAME
 * ============================================================ */

const getReportName = (
  report,
  directFields,
  nestedFields,
  map,
  id,
  fallback,
) => {
  if (!report) {
    return fallback;
  }

  for (const field of directFields) {
    const directValue = report[field];

    if (typeof directValue === "string" && directValue.trim()) {
      return directValue.trim();
    }
  }

  for (const field of nestedFields) {
    const nestedEntity = report[field];

    if (nestedEntity && typeof nestedEntity === "object") {
      const nestedName = getEntityName(nestedEntity, "");

      if (nestedName) {
        return nestedName;
      }
    }
  }

  const normalizedId = normalizeId(id);

  if (normalizedId !== null && map instanceof Map) {
    return getEntityName(map.get(normalizedId), fallback);
  }

  return fallback;
};

/* ============================================================
 * STUDENT
 * ============================================================ */

export const getReportStudentName = (report, studentMap) => {
  return getReportName(
    report,

    ["student_name", "studentName"],

    ["student"],

    studentMap,

    getReportStudentId(report),

    "Siswa",
  );
};

/* ============================================================
 * TEACHER
 * ============================================================ */

export const getReportTeacherName = (report, teacherMap) => {
  return getReportName(
    report,

    ["teacher_name", "teacherName"],

    ["teacher"],

    teacherMap,

    getReportTeacherId(report),

    "Pengajar",
  );
};

/* ============================================================
 * PROGRAM
 * ============================================================ */

export const getReportProgramName = (report, programMap) => {
  return getReportName(
    report,

    ["program_name", "programName"],

    ["program"],

    programMap,

    getReportProgramId(report),

    "Program",
  );
};

/* ============================================================
 * CLASS
 * ============================================================ */

export const getReportClassName = (report, classMap) => {
  return getReportName(
    report,

    ["class_name", "className"],

    ["class", "classroom"],

    classMap,

    getReportClassId(report),

    "Kelas",
  );
};

/* ============================================================
 * AVERAGE RATING
 * ============================================================ */

const getRatingValue = (report, nestedKey, flatKey) => {
  const nested = report?.ratings?.[nestedKey];

  if (nested !== null && nested !== undefined && nested !== "") {
    return nested;
  }

  return report?.[flatKey];
};

export const getReportAverageRating = (report) => {
  if (!report) {
    return null;
  }

  const values = [
    getRatingValue(report, "understanding", "rating_understanding"),

    getRatingValue(report, "activity", "rating_activity"),

    getRatingValue(report, "discipline", "rating_discipline"),

    getRatingValue(report, "communication", "rating_communication"),
  ]
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);

  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

/* ============================================================
 * COLLECTIONS
 * ============================================================ */

export const getReportCollections = ({
  materials = [],
  activities = [],
  photos = [],
} = {}) => {
  return {
    materials: isValidArray(materials)
      ? materials
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }

            return item?.material ?? item?.name ?? "";
          })
          .filter(Boolean)
      : [],

    activities: isValidArray(activities)
      ? activities
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }

            return item?.activity ?? item?.name ?? "";
          })
          .filter(Boolean)
      : [],

    photos: isValidArray(photos)
      ? photos
          .map((item) => {
            if (typeof item === "string") {
              return item;
            }

            return (
              item?.photo_url ??
              item?.url ??
              item?.image_url ??
              item?.photo ??
              ""
            );
          })
          .filter(Boolean)
      : [],
  };
};

/* ============================================================
 * DATE SORT
 * ============================================================ */

export const sortReportsByDate = (reports, direction = "desc") => {
  if (!isValidArray(reports)) {
    return [];
  }

  const multiplier = direction === "asc" ? 1 : -1;

  return [...reports].sort((first, second) => {
    const firstTimestamp = getReportTimestamp(first);

    const secondTimestamp = getReportTimestamp(second);

    if (firstTimestamp !== secondTimestamp) {
      return (firstTimestamp - secondTimestamp) * multiplier;
    }

    const firstId = normalizeId(first?.id) ?? 0;

    const secondId = normalizeId(second?.id) ?? 0;

    return (firstId - secondId) * multiplier;
  });
};
