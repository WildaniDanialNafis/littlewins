/**
 * Converts an input into a valid Date instance.
 *
 * @param {string|Date|number|null|undefined} value
 * @returns {Date|null}
 */
const toDate = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Formats a date using the Indonesian locale.
 *
 * @param {string|Date|number|null|undefined} date
 * @param {string} fallback
 * @returns {string}
 */
export const formatDate = (date, fallback = "-") => {
  const value = toDate(date);

  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(value);
};

/**
 * Formats a date as DD/MM/YYYY.
 *
 * @param {string|Date|number|null|undefined} date
 * @param {string} fallback
 * @returns {string}
 */
export const formatDateShort = (date, fallback = "-") => {
  const value = toDate(date);

  if (!value) {
    return fallback;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
};

/**
 * Formats a date as YYYY-MM-DD using local date parts.
 *
 * @param {string|Date|number|null|undefined} date
 * @param {string} fallback
 * @returns {string}
 */
export const formatDateISO = (date, fallback = "") => {
  const value = toDate(date);

  if (!value) {
    return fallback;
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Formats a number as currency.
 *
 * @param {number|string|null|undefined} amount
 * @param {string} locale
 * @param {string} currency
 * @returns {string}
 */
export const formatCurrency = (amount, locale = "id-ID", currency = "IDR") => {
  if (amount === null || amount === undefined || amount === "") {
    return "-";
  }

  const value = typeof amount === "string" ? Number(amount) : amount;

  if (!Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formats a number using locale-specific separators.
 *
 * @param {number|string|null|undefined} number
 * @param {string} locale
 * @returns {string}
 */
export const formatNumber = (number, locale = "id-ID") => {
  if (number === null || number === undefined || number === "") {
    return "-";
  }

  const value = typeof number === "string" ? Number(number) : number;

  if (!Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat(locale).format(value);
};

/**
 * Formats duration in minutes as hours and minutes.
 *
 * @param {number|string|null|undefined} minutes
 * @param {string} fallback
 * @returns {string}
 */
export const formatDuration = (minutes, fallback = "-") => {
  if (minutes === null || minutes === undefined || minutes === "") {
    return fallback;
  }

  const value = typeof minutes === "string" ? Number(minutes) : minutes;

  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  const totalMinutes = Math.floor(value);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} jam ${remainingMinutes} menit`;
  }

  if (hours > 0) {
    return `${hours} jam`;
  }

  return `${remainingMinutes} menit`;
};

/**
 * Formats a score and returns its semantic status.
 *
 * @param {number|string|null|undefined} score
 * @returns {{
 *   value: number,
 *   color: string,
 *   label: string
 * }}
 */
export const formatScore = (score) => {
  const value = Number(score);

  if (!Number.isFinite(value)) {
    return {
      value: 0,
      color: "text-danger",
      label: "Perlu Perhatian",
    };
  }

  if (value >= 90) {
    return {
      value,
      color: "text-success",
      label: "Sangat Baik",
    };
  }

  if (value >= 80) {
    return {
      value,
      color: "text-info",
      label: "Baik",
    };
  }

  if (value >= 70) {
    return {
      value,
      color: "text-warning",
      label: "Cukup",
    };
  }

  if (value >= 60) {
    return {
      value,
      color: "text-warning",
      label: "Kurang",
    };
  }

  return {
    value,
    color: "text-danger",
    label: "Perlu Perhatian",
  };
};
