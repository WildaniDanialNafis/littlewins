const DEFAULT_STALE_TIME = 30_000;

const DEFAULT_MAX_ENTRIES = 100;

const cache = new Map();

const inFlightRequests = new Map();

/* ============================================================
 * HELPERS
 * ============================================================ */

const now = () => Date.now();

const normalizeKey = (key) => {
  if (key === null || key === undefined) {
    return null;
  }

  const normalized = String(key).trim();

  return normalized || null;
};

const normalizeStaleTime = (staleTime) => {
  const numericValue = Number(staleTime);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return DEFAULT_STALE_TIME;
  }

  return numericValue;
};

const normalizeMaxEntries = (maxEntries) => {
  const numericValue = Number(maxEntries);

  if (!Number.isInteger(numericValue) || numericValue <= 0) {
    return DEFAULT_MAX_ENTRIES;
  }

  return numericValue;
};

const isFresh = (entry, staleTime) => {
  if (!entry) {
    return false;
  }

  const age = Math.max(0, now() - entry.timestamp);

  return age <= normalizeStaleTime(staleTime);
};

const touchCacheEntry = (key, entry) => {
  cache.delete(key);
  cache.set(key, entry);
};

const enforceCacheLimit = (maxEntries = DEFAULT_MAX_ENTRIES) => {
  const limit = normalizeMaxEntries(maxEntries);

  while (cache.size > limit) {
    const oldestKey = cache.keys().next().value;

    if (oldestKey === undefined) {
      break;
    }

    cache.delete(oldestKey);
  }
};

const deleteInFlight = (normalizedKey) => {
  inFlightRequests.delete(normalizedKey);
};

/* ============================================================
 * CACHE READ
 * ============================================================ */

export const getCachedResource = (key, staleTime = DEFAULT_STALE_TIME) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return null;
  }

  const entry = cache.get(normalizedKey);

  if (!entry) {
    return null;
  }

  if (!isFresh(entry, staleTime)) {
    return null;
  }

  touchCacheEntry(normalizedKey, entry);

  return entry.data;
};

export const getResourceSnapshot = (key) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return null;
  }

  const entry = cache.get(normalizedKey);

  if (!entry) {
    return null;
  }

  touchCacheEntry(normalizedKey, entry);

  return entry;
};

/* ============================================================
 * CACHE WRITE
 * ============================================================ */

export const setCachedResource = (key, data, options = {}) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return;
  }

  const { timestamp = now(), maxEntries = DEFAULT_MAX_ENTRIES } = options;

  const entry = {
    data,
    timestamp: Number.isFinite(Number(timestamp)) ? Number(timestamp) : now(),
  };

  cache.set(normalizedKey, entry);

  touchCacheEntry(normalizedKey, entry);

  enforceCacheLimit(maxEntries);
};

/* ============================================================
 * INVALIDATION
 * ============================================================ */

export const invalidateResource = (key) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return;
  }

  /*
   * Invalidate cache AND the
   * corresponding request dedupe slot.
   *
   * Penting:
   * request yang sudah berjalan
   * tidak di-abort di sini.
   *
   * Kita hanya memastikan request
   * berikutnya tidak mengambil
   * promise obsolete dari deduper.
   */
  cache.delete(normalizedKey);

  deleteInFlight(normalizedKey);
};

export const invalidateResources = (keys = []) => {
  if (!Array.isArray(keys) || keys.length === 0) {
    return;
  }

  for (const key of keys) {
    invalidateResource(key);
  }
};

export const clearResourceCache = () => {
  cache.clear();
  inFlightRequests.clear();
};

/* ============================================================
 * KEY
 * ============================================================ */

export const getResourceKey = ({ scope = "global", resource }) => {
  const normalizedScope = String(scope || "global").trim();

  const normalizedResource = String(resource || "").trim();

  if (!normalizedResource) {
    return normalizedScope;
  }

  return `${normalizedScope}:${normalizedResource}`;
};

/* ============================================================
 * REQUEST DEDUPER
 * ============================================================ */

export const createRequestDeduper = ({ key, request }) => {
  const normalizedKey = normalizeKey(key);

  if (typeof request !== "function") {
    return Promise.reject(
      new TypeError("Request handler harus berupa function."),
    );
  }

  if (!normalizedKey) {
    return Promise.resolve().then(request);
  }

  const existingPromise = inFlightRequests.get(normalizedKey);

  if (existingPromise) {
    return existingPromise;
  }

  const promise = Promise.resolve().then(request);

  inFlightRequests.set(normalizedKey, promise);

  const cleanup = () => {
    if (inFlightRequests.get(normalizedKey) === promise) {
      inFlightRequests.delete(normalizedKey);
    }
  };

  void promise.then(cleanup, cleanup);

  return promise;
};

/* ============================================================
 * INVALIDATE + REQUEST
 * ============================================================ */

export const invalidateResourceAndRequest = (key) => {
  invalidateResource(key);
};

/* ============================================================
 * STATS
 * ============================================================ */

export const getCacheStats = () => {
  return {
    entries: cache.size,

    inFlightRequests: inFlightRequests.size,
  };
};

export default {
  getCachedResource,
  getResourceSnapshot,
  setCachedResource,
  invalidateResource,
  invalidateResources,
  clearResourceCache,
  getResourceKey,
  createRequestDeduper,
  invalidateResourceAndRequest,
  getCacheStats,
};
