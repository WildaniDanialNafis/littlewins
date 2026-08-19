import { REPORT } from "@/shared/constants";
import { formatDate } from "@/shared/utils";

import { getReportTimestamp, normalizeId } from "../../domain/reportSelectors";

export const hasValue = (value) => {
  return value !== null && value !== undefined && value !== "";
};

const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

export const getStatusLabel = (status) => {
  switch (status) {
    case REPORT.status.COMPLETED:
      return "Selesai";

    case REPORT.status.DRAFT:
      return "Draft";

    case REPORT.status.CANCELLED:
      return "Dibatalkan";

    default:
      return "Draft";
  }
};

export const getStatusBadgeClass = (status) => {
  const baseClass =
    "inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold";

  switch (status) {
    case REPORT.status.COMPLETED:
      return `${baseClass} bg-success-soft text-success`;

    case REPORT.status.CANCELLED:
      return `${baseClass} bg-danger-soft text-danger`;

    default:
      return `${baseClass} bg-warning-soft text-warning`;
  }
};

const getScoreBand = (score) => {
  const value = toFiniteNumber(score);

  if (value === null) {
    return "empty";
  }

  if (value >= 90) {
    return "excellent";
  }

  if (value >= 80) {
    return "good";
  }

  if (value >= 70) {
    return "fair";
  }

  return "low";
};

export const getScoreColor = (score) => {
  switch (getScoreBand(score)) {
    case "excellent":
      return "text-success";

    case "good":
      return "text-info";

    case "fair":
      return "text-warning";

    case "low":
      return "text-danger";

    default:
      return "text-muted";
  }
};

export const getScoreBackground = (score) => {
  switch (getScoreBand(score)) {
    case "excellent":
      return "bg-success-soft ring-success/20";

    case "good":
      return "bg-info-soft ring-info/20";

    case "fair":
      return "bg-warning-soft ring-warning/20";

    case "low":
      return "bg-danger-soft ring-danger/20";

    default:
      return "bg-surface-muted ring-border";
  }
};

export const getAverageRating = (report) => {
  if (!report) {
    return "0.0";
  }

  const ratings = [
    report.rating_understanding,
    report.rating_activity,
    report.rating_discipline,
    report.rating_communication,
  ]
    .map(toFiniteNumber)
    .filter((rating) => rating !== null && rating > 0);

  if (ratings.length === 0) {
    return "0.0";
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0);

  return (total / ratings.length).toFixed(1);
};

export const filterReportsBySearch = (reports, query, role) => {
  if (!Array.isArray(reports)) {
    return [];
  }

  const search = String(query ?? "")
    .trim()
    .toLowerCase();

  if (!search) {
    return reports;
  }

  const personField = role === "teacher" ? "student_name" : "teacher_name";

  return reports.filter((report) => {
    const programName = String(report?.program_name ?? "").toLowerCase();

    const personName = String(report?.[personField] ?? "").toLowerCase();

    return programName.includes(search) || personName.includes(search);
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

export const sortReports = (reports, sortKey, sortDirection) => {
  if (!Array.isArray(reports)) {
    return [];
  }

  const direction = sortDirection === "asc" ? 1 : -1;

  return [...reports].sort((first, second) => {
    let firstValue;
    let secondValue;

    switch (sortKey) {
      case "report_date":
        firstValue = getReportTimestamp(first);

        secondValue = getReportTimestamp(second);

        break;

      case "program_name":
        firstValue = String(first?.program_name ?? "")
          .trim()
          .toLowerCase();

        secondValue = String(second?.program_name ?? "")
          .trim()
          .toLowerCase();

        break;

      case "score":
      case "rating_understanding":
      default:
        firstValue = toFiniteNumber(first?.[sortKey]);

        secondValue = toFiniteNumber(second?.[sortKey]);

        break;
    }

    return compareNullable(firstValue, secondValue, direction);
  });
};

export const paginateReports = (reports, page, pageSize) => {
  const safeReports = Array.isArray(reports) ? reports : [];

  const numericPage = Number(page);
  const numericPageSize = Number(pageSize);

  const safePage =
    Number.isInteger(numericPage) && numericPage > 0 ? numericPage : 1;

  const safePageSize =
    Number.isInteger(numericPageSize) && numericPageSize > 0
      ? numericPageSize
      : 1;

  const start = (safePage - 1) * safePageSize;

  const visibleReports = safeReports.slice(start, start + safePageSize);

  return {
    visibleReports,

    hasNextPage: start + safePageSize < safeReports.length,

    hasPreviousPage: safePage > 1,

    startItem: safeReports.length === 0 ? 0 : start + 1,

    endItem: safeReports.length === 0 ? 0 : start + visibleReports.length,
  };
};

export const formatReportDate = (value) => {
  if (!hasValue(value)) {
    return "-";
  }

  return formatDate(value);
};

export const isOwnedByAccount = (report, role, accountId) => {
  const normalizedAccountId = normalizeId(accountId);

  if (normalizedAccountId === null) {
    return false;
  }

  const field = role === "teacher" ? "teacher_id" : "student_id";

  return normalizeId(report?.[field]) === normalizedAccountId;
};
