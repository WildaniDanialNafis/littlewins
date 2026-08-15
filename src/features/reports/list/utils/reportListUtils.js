import { REPORT } from "@/shared/constants";

import { formatDate } from "@/shared/utils";

export const hasValue = (value) => {
  return value !== null && value !== undefined && value !== "";
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

export const getScoreColor = (score) => {
  if (!hasValue(score)) {
    return "text-muted";
  }

  const value = Number(score);

  if (value >= 90) {
    return "text-success";
  }

  if (value >= 80) {
    return "text-info";
  }

  if (value >= 70) {
    return "text-warning";
  }

  return "text-danger";
};

export const getScoreBackground = (score) => {
  if (!hasValue(score)) {
    return "bg-surface-muted ring-border";
  }

  const value = Number(score);

  if (value >= 90) {
    return "bg-success-soft ring-success/20";
  }

  if (value >= 80) {
    return "bg-info-soft ring-info/20";
  }

  if (value >= 70) {
    return "bg-warning-soft ring-warning/20";
  }

  return "bg-danger-soft ring-danger/20";
};

export const getAverageRating = (report) => {
  const ratings = [
    report?.rating_understanding,
    report?.rating_activity,
    report?.rating_discipline,
    report?.rating_communication,
  ]
    .map(Number)
    .filter((rating) => Number.isFinite(rating) && rating > 0);

  if (ratings.length === 0) {
    return "0.0";
  }

  const total = ratings.reduce((sum, rating) => sum + rating, 0);

  return (total / ratings.length).toFixed(1);
};

export const filterReportsBySearch = (reports, query, role) => {
  if (!Array.isArray(reports) || !query?.trim()) {
    return reports;
  }

  const search = query.trim().toLowerCase();

  const personField = role === "teacher" ? "student_name" : "teacher_name";

  return reports.filter((report) => {
    const programName = String(report?.program_name ?? "").toLowerCase();

    const personName = String(report?.[personField] ?? "").toLowerCase();

    return programName.includes(search) || personName.includes(search);
  });
};

export const sortReports = (reports, sortKey, sortDirection) => {
  if (!Array.isArray(reports)) {
    return [];
  }

  const direction = sortDirection === "asc" ? 1 : -1;

  return [...reports].sort((a, b) => {
    let aValue = a?.[sortKey];
    let bValue = b?.[sortKey];

    switch (sortKey) {
      case "report_date":
        aValue = new Date(aValue).getTime() || 0;
        bValue = new Date(bValue).getTime() || 0;
        break;

      case "program_name":
        aValue = String(aValue ?? "").toLowerCase();

        bValue = String(bValue ?? "").toLowerCase();
        break;

      case "score":
      case "rating_understanding":
      default:
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
        break;
    }

    if (aValue < bValue) {
      return -1 * direction;
    }

    if (aValue > bValue) {
      return 1 * direction;
    }

    return 0;
  });
};

export const paginateReports = (reports, page, pageSize) => {
  const safeReports = Array.isArray(reports) ? reports : [];

  const safePage = Math.max(1, Number(page) || 1);

  const safePageSize = Math.max(1, Number(pageSize) || 1);

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
