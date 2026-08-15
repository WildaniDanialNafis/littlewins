/**
 * Validates an email address.
 *
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (typeof email !== "string") {
    return false;
  }

  const value = email.trim();

  if (!value) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

/**
 * Validates an Indonesian phone number.
 *
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  if (typeof phone !== "string") {
    return false;
  }

  const cleaned = phone.replace(/\s+/g, "");

  return /^(\+62|0)[0-9]{9,12}$/.test(cleaned);
};

/**
 * Validates a password with a minimum of 8 characters,
 * at least one letter, and at least one number.
 *
 * @param {string} password
 * @returns {boolean}
 */
export const isStrongPassword = (password) => {
  if (typeof password !== "string") {
    return false;
  }

  if (password.length < 8) {
    return false;
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasLetter && hasNumber;
};

/**
 * Validates string length.
 *
 * @param {string} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export const isLengthValid = (value, min = 0, max = Infinity) => {
  if (typeof value !== "string") {
    return false;
  }

  const length = value.trim().length;

  return length >= min && length <= max;
};

/**
 * Checks whether a value is a positive number.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const isPositiveNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  const number = typeof value === "string" ? Number(value) : value;

  return Number.isFinite(number) && number > 0;
};

/**
 * Checks whether a value is a positive integer.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const isPositiveInteger = (value) => {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  const number = typeof value === "string" ? Number(value) : value;

  return Number.isInteger(number) && number > 0;
};

/**
 * Validates an absolute URL.
 *
 * @param {string} url
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
  if (typeof url !== "string" || !url.trim()) {
    return false;
  }

  try {
    const value = new URL(url);

    return Boolean(value.protocol && value.hostname);
  } catch {
    return false;
  }
};

/**
 * Checks whether a value contains meaningful content.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const isFilled = (value) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
};
