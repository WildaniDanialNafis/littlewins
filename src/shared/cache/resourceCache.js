const DEFAULT_STALE_TIME = 30_000;

const DEFAULT_MAX_ENTRIES = 150;

const cache = new Map();

const inFlightRequests = new Map();

const resourceVersions = new Map();

let cacheEpoch = 0;

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
  const value = Number(staleTime);

  if (!Number.isFinite(value) || value < 0) {
    return DEFAULT_STALE_TIME;
  }

  return value;
};

const normalizeMaxEntries = (maxEntries) => {
  const value = Number(maxEntries);

  if (!Number.isInteger(value) || value <= 0) {
    return DEFAULT_MAX_ENTRIES;
  }

  return value;
};

const isFresh = (entry, staleTime) => {
  if (!entry) {
    return false;
  }

  const age = Math.max(0, now() - entry.timestamp);

  return age <= normalizeStaleTime(staleTime);
};

const touchEntry = (key, entry) => {
  cache.delete(key);

  cache.set(key, entry);
};

const getCurrentVersion = (key) => {
  return resourceVersions.get(key) ?? 0;
};

const bumpResourceVersion = (key) => {
  const next = getCurrentVersion(key) + 1;

  resourceVersions.set(key, next);

  return `${cacheEpoch}:${next}`;
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

/* ============================================================
 * READ
 * ============================================================ */

export const getCachedResource = (key, staleTime = DEFAULT_STALE_TIME) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return null;
  }

  const entry = cache.get(normalizedKey);

  if (!entry || !isFresh(entry, staleTime)) {
    return null;
  }

  touchEntry(normalizedKey, entry);

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

  touchEntry(normalizedKey, entry);

  return entry;
};

export const getResourceVersion = (key) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return `${cacheEpoch}:0`;
  }

  return `${cacheEpoch}:${getCurrentVersion(normalizedKey)}`;
};

export const hasCachedResource = (key, staleTime = DEFAULT_STALE_TIME) => {
  return getCachedResource(key, staleTime) !== null;
};

/* ============================================================
 * WRITE
 * ============================================================ */

export const setCachedResource = (key, data, options = {}) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return false;
  }

  const expectedVersion =
    options.version === undefined || options.version === null
      ? null
      : String(options.version);

  const currentVersion = getResourceVersion(normalizedKey);

  /*
   * Response dari generation lama
   * tidak boleh masuk cache generation baru.
   */
  if (expectedVersion !== null && expectedVersion !== currentVersion) {
    return false;
  }

  const timestamp = Number.isFinite(Number(options.timestamp))
    ? Number(options.timestamp)
    : now();

  const entry = {
    data,
    timestamp,
  };

  cache.set(normalizedKey, entry);

  touchEntry(normalizedKey, entry);

  enforceCacheLimit(options.maxEntries ?? DEFAULT_MAX_ENTRIES);

  return true;
};

/* ============================================================
 * INVALIDATION
 * ============================================================ */

export const invalidateResource = (key) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return `${cacheEpoch}:0`;
  }

  cache.delete(normalizedKey);

  /*
   * JANGAN menghapus inFlightRequests.
   *
   * Request lama tetap boleh selesai.
   *
   * Request baru akan mendapatkan version berbeda,
   * sehingga tidak join request lama.
   */
  bumpResourceVersion(normalizedKey);

  return getResourceVersion(normalizedKey);
};

export const invalidateResources = (keys = []) => {
  if (!Array.isArray(keys)) {
    return;
  }

  for (const key of keys) {
    invalidateResource(key);
  }
};

/* ============================================================
 * GLOBAL RESET
 * ============================================================ */

export const clearResourceCache = () => {
  cache.clear();

  /*
   * Global reset berbeda dari invalidation satu resource.
   *
   * Ini dilakukan ketika identity/session berubah.
   */
  inFlightRequests.clear();

  cacheEpoch += 1;

  resourceVersions.clear();
};

/* ============================================================
 * KEY
 * ============================================================ */

export const getResourceKey = ({ scope = "global", resource }) => {
  const normalizedScope = String(scope ?? "global").trim();

  const normalizedResource = String(resource ?? "").trim();

  if (!normalizedResource) {
    return normalizedScope;
  }

  return `${normalizedScope}:${normalizedResource}`;
};

export const getCacheEpoch = () => cacheEpoch;

/* ============================================================
 * REQUEST DEDUPE
 * ============================================================ */

export const createRequestDeduper = ({ key, request }) => {
  const normalizedKey = normalizeKey(key);

  if (typeof request !== "function") {
    return Promise.reject(
      new TypeError("Request handler harus berupa function."),
    );
  }

  /*
   * Request tanpa key tidak bisa didedupe.
   */
  if (!normalizedKey) {
    return Promise.resolve().then(request);
  }

  const version = getResourceVersion(normalizedKey);

  const epoch = getCacheEpoch();

  const existing = inFlightRequests.get(normalizedKey);

  /*
   * Hanya join request yang benar-benar
   * berada pada generation sama.
   */
  if (existing && existing.version === version && existing.epoch === epoch) {
    return existing.promise;
  }

  const promise = Promise.resolve().then(request);

  const entry = {
    promise,

    version,

    epoch,

    startedAt: now(),
  };

  inFlightRequests.set(normalizedKey, entry);

  const cleanup = () => {
    const current = inFlightRequests.get(normalizedKey);

    /*
     * Request lama tidak boleh menghapus
     * request generasi baru.
     */
    if (current?.promise === promise) {
      inFlightRequests.delete(normalizedKey);
    }
  };

  void promise.then(cleanup, cleanup);

  return promise;
};

export const getInFlightRequest = (key) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return null;
  }

  return inFlightRequests.get(normalizedKey)?.promise ?? null;
};

export const getInFlightRequestMeta = (key) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return null;
  }

  return inFlightRequests.get(normalizedKey) ?? null;
};

export const hasInFlightRequest = (key) => {
  return Boolean(getInFlightRequest(key));
};

/* ============================================================
 * INVALIDATE + REQUEST
 * ============================================================ */

export const invalidateResourceAndRequest = (key, request) => {
  invalidateResource(key);

  return createRequestDeduper({
    key,
    request,
  });
};

/* ============================================================
 * DEBUG
 * ============================================================ */

export const getCacheStats = () => {
  return {
    cacheEntries: cache.size,

    inFlightRequests: inFlightRequests.size,

    cacheKeys: Array.from(cache.keys()),

    inFlightKeys: Array.from(inFlightRequests.keys()),
  };
};

/* ============================================================
 * DEFAULT
 * ============================================================ */

export default {
  getCachedResource,

  getResourceSnapshot,

  getResourceVersion,

  hasCachedResource,

  setCachedResource,

  invalidateResource,

  invalidateResources,

  clearResourceCache,

  getResourceKey,

  getCacheEpoch,

  createRequestDeduper,

  getInFlightRequest,

  getInFlightRequestMeta,

  hasInFlightRequest,

  invalidateResourceAndRequest,

  getCacheStats,
};
