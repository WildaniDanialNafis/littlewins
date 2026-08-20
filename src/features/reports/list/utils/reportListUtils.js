const toFiniteNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const normalizeText = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const getRatingValue = (report, nestedKey, flatKey) => {
  const ratings = report?.ratings;

  return ratings?.[nestedKey] ?? report?.[flatKey] ?? null;
};

const createSearchableFieldsCache = new WeakMap();

export const createSearchableFields = (report, role) => {
  if (!report || typeof report !== "object") {
    return [];
  }

  if (createSearchableFieldsCache.has(report)) {
    return createSearchableFieldsCache.get(report);
  }

  const personField = role === "teacher" ? "student_name" : "teacher_name";

  const fields = [
    report?.[personField],
    report?.program_name,
    report?.status,
    report?.report_date,
    report?.score,
  ]
    .map(normalizeText)
    .filter(Boolean);

  createSearchableFieldsCache.set(report, fields);

  return fields;
};

export const hasValue = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim() !== "";
};

export const getStatusLabel = (status) => {
  switch (
    String(status ?? "")
      .trim()
      .toLowerCase()
  ) {
    case "completed":
      return "Selesai";

    case "draft":
      return "Draft";

    case "cancelled":
      return "Dibatalkan";

    default:
      return "Status";
  }
};

export const getStatusBadgeClass = (status) => {
  switch (
    String(status ?? "")
      .trim()
      .toLowerCase()
  ) {
    case "completed":
      return "bg-success-soft text-success";

    case "draft":
      return "bg-warning-soft text-warning";

    case "cancelled":
      return "bg-danger-soft text-danger";

    default:
      return "bg-surface-muted text-muted";
  }
};

export const getScoreColor = (score) => {
  const number = toFiniteNumber(score);

  if (number === null) {
    return "text-muted";
  }

  if (number >= 85) {
    return "text-success";
  }

  if (number >= 70) {
    return "text-primary";
  }

  if (number >= 55) {
    return "text-warning";
  }

  return "text-danger";
};

export const getScoreBackground = (score) => {
  const number = toFiniteNumber(score);

  if (number === null) {
    return "bg-surface-muted";
  }

  if (number >= 85) {
    return "bg-success-soft";
  }

  if (number >= 70) {
    return "bg-primary-soft";
  }

  if (number >= 55) {
    return "bg-warning-soft";
  }

  return "bg-danger-soft";
};

const getRatingList = (report) => {
  return [
    getRatingValue(report, "understanding", "rating_understanding"),

    getRatingValue(report, "activity", "rating_activity"),

    getRatingValue(report, "discipline", "rating_discipline"),

    getRatingValue(report, "communication", "rating_communication"),
  ]
    .map(toFiniteNumber)
    .filter((value) => value !== null && value > 0);
};

export const getAverageRating = (report) => {
  const ratings = getRatingList(report);

  if (ratings.length === 0) {
    return "0.0";
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0);

  return (total / ratings.length).toFixed(1);
};

export const getRatingValues = (report) => {
  return {
    understanding:
      toFiniteNumber(
        getRatingValue(report, "understanding", "rating_understanding"),
      ) ?? 0,

    activity:
      toFiniteNumber(getRatingValue(report, "activity", "rating_activity")) ??
      0,

    discipline:
      toFiniteNumber(
        getRatingValue(report, "discipline", "rating_discipline"),
      ) ?? 0,

    communication:
      toFiniteNumber(
        getRatingValue(report, "communication", "rating_communication"),
      ) ?? 0,
  };
};

export const filterReportsBySearch = (reports, query, role) => {
  if (!Array.isArray(reports)) {
    return [];
  }

  const search = normalizeText(query);

  if (!search) {
    return reports;
  }

  const personField = role === "teacher" ? "student_name" : "teacher_name";

  return reports.filter((report) => {
    if (!report || typeof report !== "object") {
      return false;
    }

    const searchable = [
      report?.[personField],
      report?.program_name,
      report?.programName,
      report?.class_name,
      report?.className,
      report?.status,
      getStatusLabel(report?.status),
      report?.report_date,
      report?.reportDate,
      report?.date,
      report?.created_at,
      report?.score,
    ];

    return searchable.some((value) => normalizeText(value).includes(search));
  });
};

const compareNullable = (first, second, direction) => {
  if (first === second) {
    return 0;
  }

  if (first === null) {
    return 1 * direction;
  }

  if (second === null) {
    return -1 * direction;
  }

  if (first < second) {
    return -1 * direction;
  }

  if (first > second) {
    return 1 * direction;
  }

  return 0;
};

const compareText = (first, second, direction) => {
  const firstValue = normalizeText(first);

  const secondValue = normalizeText(second);

  if (firstValue === secondValue) {
    return 0;
  }

  return (
    firstValue.localeCompare(secondValue, undefined, {
      sensitivity: "base",

      numeric: true,
    }) * direction
  );
};

const getSortableRating = (report, nestedKey, flatKey) => {
  return toFiniteNumber(getRatingValue(report, nestedKey, flatKey));
};

export const sortReports = (reports, sortKey, sortDirection) => {
  if (!Array.isArray(reports)) {
    return [];
  }

  const direction = sortDirection === "asc" ? 1 : -1;

  return [...reports].sort((first, second) => {
    let comparison;

    switch (sortKey) {
      case "report_date":
        comparison = compareText(
          first?.report_date ?? first?.reportDate ?? first?.date,
          second?.report_date ?? second?.reportDate ?? second?.date,
          direction,
        );
        break;

      case "program_name":
        comparison = compareText(
          first?.program_name ?? first?.programName,
          second?.program_name ?? second?.programName,
          direction,
        );
        break;

      case "score":
        comparison = compareNullable(
          toFiniteNumber(first?.score),
          toFiniteNumber(second?.score),
          direction,
        );
        break;

      case "rating_understanding":
        comparison = compareNullable(
          getSortableRating(first, "understanding", "rating_understanding"),
          getSortableRating(second, "understanding", "rating_understanding"),
          direction,
        );
        break;

      default:
        comparison = compareText(
          first?.student_name ??
            first?.studentName ??
            first?.teacher_name ??
            first?.teacherName,
          second?.student_name ??
            second?.studentName ??
            second?.teacher_name ??
            second?.teacherName,
          direction,
        );
        break;
    }

    if (comparison !== 0) {
      return comparison;
    }

    return compareText(first?.id, second?.id, 1);
  });
};

export const paginateReports = (reports, page, pageSize) => {
  const safeReports = Array.isArray(reports) ? reports : [];

  const size = Math.max(1, Number(pageSize) || 1);

  const totalItems = safeReports.length;

  const totalPages = Math.max(1, Math.ceil(totalItems / size));

  const normalizedPage = Math.min(Math.max(1, Number(page) || 1), totalPages);

  const startOffset = (normalizedPage - 1) * size;

  const endOffset = Math.min(startOffset + size, totalItems);

  return {
    items: safeReports.slice(startOffset, endOffset),

    page: normalizedPage,

    pageSize: size,

    totalItems,

    totalPages,

    startItem: totalItems === 0 ? 0 : startOffset + 1,

    endItem: endOffset,

    hasPreviousPage: normalizedPage > 1,

    hasNextPage: normalizedPage < totalPages,
  };
};

export const formatReportDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};
