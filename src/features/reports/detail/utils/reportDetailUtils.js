import { formatDate } from "@/shared/utils";

export const hasValue = (value) => {
  return value !== null && value !== undefined && value !== "";
};

export const createLookupMap = (items = []) => {
  if (!Array.isArray(items)) {
    return new Map();
  }

  return new Map(items.map((item) => [Number(item.id), item]));
};

export const getName = (item, fallback = "-") => {
  if (!item) {
    return fallback;
  }

  return item.full_name || item.name || fallback;
};

export const getNilaiStyle = (score) => {
  const numericScore = Number(score);

  if (numericScore >= 90) {
    return {
      text: "text-success",
      background: "bg-success-soft ring-success/20",
    };
  }

  if (numericScore >= 80) {
    return {
      text: "text-info",
      background: "bg-info-soft ring-info/20",
    };
  }

  if (numericScore >= 70) {
    return {
      text: "text-warning",
      background: "bg-warning-soft ring-warning/20",
    };
  }

  return {
    text: "text-danger",
    background: "bg-danger-soft ring-danger/20",
  };
};

export const formatReportDate = (value) => {
  if (!hasValue(value)) {
    return "-";
  }

  return formatDate(value);
};
