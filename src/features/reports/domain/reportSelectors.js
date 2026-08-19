const isValidArray = (value) => {
  return Array.isArray(value);
};

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

export const getReportDate = (report) => {
  if (!report || typeof report !== "object") {
    return null;
  }

  return report.report_date ?? report.date ?? report.created_at ?? null;
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
   * Handle tanggal kalender YYYY-MM-DD secara eksplisit.
   * Untuk timestamp penuh, biarkan Date menangani timezone/value.
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

export const getLatestReport = (reports) => {
  if (!isValidArray(reports) || reports.length === 0) {
    return null;
  }

  let latest = null;
  let latestTimestamp = Number.NEGATIVE_INFINITY;

  for (const report of reports) {
    const timestamp = getReportTimestamp(report);

    if (latest === null || timestamp > latestTimestamp) {
      latest = report;
      latestTimestamp = timestamp;
    }
  }

  return latest;
};

export const filterReportsByAccount = (reports, role, accountId) => {
  if (!isValidArray(reports)) {
    return [];
  }

  const normalizedAccountId = normalizeId(accountId);

  if (normalizedAccountId === null) {
    return [];
  }

  let accountField = null;

  switch (role) {
    case "teacher":
      accountField = "teacher_id";
      break;

    case "student":
      accountField = "student_id";
      break;

    default:
      return [];
  }

  return reports.filter(
    (report) => normalizeId(report?.[accountField]) === normalizedAccountId,
  );
};

export const createLookupMap = (items = []) => {
  if (!isValidArray(items)) {
    return new Map();
  }

  const map = new Map();

  for (const item of items) {
    const id = normalizeId(item?.id);

    if (id === null) {
      continue;
    }

    map.set(id, item);
  }

  return map;
};

export const findById = (items, id) => {
  const normalizedId = normalizeId(id);

  if (normalizedId === null || !isValidArray(items)) {
    return null;
  }

  for (const item of items) {
    if (normalizeId(item?.id) === normalizedId) {
      return item;
    }
  }

  return null;
};

export const getEntityName = (entity, fallback = "-") => {
  if (!entity || typeof entity !== "object") {
    return fallback;
  }

  return (
    entity.full_name?.trim?.() ||
    entity.nama_lengkap?.trim?.() ||
    entity.name?.trim?.() ||
    entity.nama?.trim?.() ||
    fallback
  );
};

const getReportName = (
  report,
  directField,
  nestedField,
  map,
  idField,
  fallback,
) => {
  if (!report) {
    return fallback;
  }

  const directValue = report[directField];

  if (typeof directValue === "string" && directValue.trim()) {
    return directValue.trim();
  }

  const nestedEntity = report[nestedField];

  if (nestedEntity) {
    const nestedName = getEntityName(nestedEntity, "");

    if (nestedName) {
      return nestedName;
    }
  }

  const entity = map?.get(normalizeId(report[idField]));

  return getEntityName(entity, fallback);
};

export const getReportStudentName = (report, studentMap) => {
  return getReportName(
    report,
    "student_name",
    "student",
    studentMap,
    "student_id",
    "Siswa",
  );
};

export const getReportTeacherName = (report, teacherMap) => {
  return getReportName(
    report,
    "teacher_name",
    "teacher",
    teacherMap,
    "teacher_id",
    "Pengajar",
  );
};

export const getReportProgramName = (report, programMap) => {
  return getReportName(
    report,
    "program_name",
    "program",
    programMap,
    "program_id",
    "Program",
  );
};

export const getReportClassName = (report, classMap) => {
  return getReportName(
    report,
    "class_name",
    "class",
    classMap,
    "class_id",
    "Kelas",
  );
};

export const getReportAverageRating = (report) => {
  if (!report) {
    return null;
  }

  const values = [
    report.rating_understanding,
    report.rating_activity,
    report.rating_discipline,
    report.rating_communication,
  ];

  let total = 0;
  let count = 0;

  for (const value of values) {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue) && numericValue >= 0) {
      total += numericValue;
      count += 1;
    }
  }

  return count > 0 ? total / count : null;
};

export const sortReportsByDate = (reports, direction = "desc") => {
  if (!isValidArray(reports)) {
    return [];
  }

  const multiplier = direction === "asc" ? 1 : -1;

  return [...reports].sort(
    (first, second) =>
      (getReportTimestamp(first) - getReportTimestamp(second)) * multiplier,
  );
};

export const getReportCollections = ({
  materials = [],
  activities = [],
  photos = [],
} = {}) => {
  return {
    materials: isValidArray(materials)
      ? materials.map((item) => item?.material).filter(Boolean)
      : [],

    activities: isValidArray(activities)
      ? activities.map((item) => item?.activity).filter(Boolean)
      : [],

    photos: isValidArray(photos)
      ? photos.map((item) => item?.photo).filter(Boolean)
      : [],
  };
};
