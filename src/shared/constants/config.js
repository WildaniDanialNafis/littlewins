/**
 * Global application configuration.
 *
 * Berisi konfigurasi umum aplikasi:
 * - App metadata
 * - API configuration
 * - Default values
 * - Theme
 * - Toast
 * - Report configuration
 * - Environment helpers
 * - Storage keys
 */

// ============================================================
// APP INFO
// ============================================================

export const APP_NAME = "LittleWins";

export const APP_DESCRIPTION =
  "Platform untuk memantau dan mencatat kemajuan akademik siswa secara digital.";

export const APP_VERSION = "1.0.0";

export const APP_TAGLINE = "Small steps, big wins.";

// ============================================================
// API
// ============================================================

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://noisy-recipe-2083.daomine602.workers.dev";

export const API_TIMEOUT = 30_000;

// ============================================================
// DEFAULTS
// ============================================================

export const DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_SORT_KEY = "report_date";

export const DEFAULT_SORT_DIRECTION = "desc";

// ============================================================
// PAGINATION
// ============================================================

export const PAGINATION = Object.freeze({
  pageSize: DEFAULT_PAGE_SIZE,
  maxVisiblePages: 5,
  siblingCount: 1,
});

// ============================================================
// DATE & TIME
// ============================================================

export const DATE_FORMAT = "dd/MM/yyyy";

export const DATE_FORMAT_LONG = "EEEE, dd MMMM yyyy";

export const TIME_FORMAT = "HH:mm";

export const DATETIME_FORMAT = "dd/MM/yyyy HH:mm";

export const LOCALE = "id-ID";

export const TIMEZONE = "Asia/Jakarta";

// ============================================================
// THEME
// ============================================================

export const THEME = Object.freeze({
  default: "system",

  values: Object.freeze({
    light: "light",
    dark: "dark",
    system: "system",
  }),
});

// ============================================================
// TOAST
// ============================================================

export const TOAST = Object.freeze({
  defaultDuration: 4_000,
  maxToasts: 5,
  position: "bottom-right",
});

// ============================================================
// REPORT
// ============================================================

export const REPORT = Object.freeze({
  status: Object.freeze({
    DRAFT: "draft",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  }),

  rating: Object.freeze({
    min: 1,
    max: 5,
    default: 0,
  }),

  score: Object.freeze({
    min: 0,
    max: 100,
    default: null,
  }),

  duration: Object.freeze({
    min: 1,
    max: 999,
  }),
});

// ============================================================
// ENVIRONMENT
// ============================================================

export const IS_DEVELOPMENT = import.meta.env.MODE === "development";

export const IS_PRODUCTION = import.meta.env.MODE === "production";

export const IS_TEST = import.meta.env.MODE === "test";

// ============================================================
// STORAGE KEYS
// ============================================================

export const STORAGE_KEYS = Object.freeze({
  theme: "littlewins-theme",
  authToken: "littlewins-auth-token",
  refreshToken: "littlewins-refresh-token",
  user: "littlewins-user",
  preferences: "littlewins-preferences",
  lastVisited: "littlewins-last-visited",
});
