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

const getEntryAge = (entry) => {
  if (!entry) {
    return Infinity;
  }

  return Math.max(0, now() - entry.timestamp);
};

const isFresh = (entry, staleTime) => {
  if (!entry) {
    return false;
  }

  return getEntryAge(entry) <= normalizeStaleTime(staleTime);
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
 * CACHE STATE
 * ============================================================ */

export const getResourceState = (key, staleTime = DEFAULT_STALE_TIME) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return "missing";
  }

  const entry = cache.get(normalizedKey);

  if (!entry) {
    return "missing";
  }

  return isFresh(entry, staleTime) ? "fresh" : "stale";
};

export const isResourceFresh = (key, staleTime = DEFAULT_STALE_TIME) => {
  return getResourceState(key, staleTime) === "fresh";
};

export const isResourceStale = (key, staleTime = DEFAULT_STALE_TIME) => {
  return getResourceState(key, staleTime) === "stale";
};

export const hasResourceSnapshot = (key) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return false;
  }

  return cache.has(normalizedKey);
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

  if (!entry) {
    return null;
  }

  if (!isFresh(entry, staleTime)) {
    return null;
  }

  touchEntry(normalizedKey, entry);

  return entry.data;
};

export const getStaleResource = (key) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return null;
  }

  const entry = cache.get(normalizedKey);

  if (!entry) {
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

export const getResourceAge = (key) => {
  const normalizedKey = normalizeKey(key);

  if (!normalizedKey) {
    return null;
  }

  const entry = cache.get(normalizedKey);

  if (!entry) {
    return null;
  }

  return getEntryAge(entry);
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

  if (expectedVersion !== null && expectedVersion !== currentVersion) {
    return false;
  }

  const rawTimestamp = Number(options.timestamp);

  const timestamp =
    Number.isFinite(rawTimestamp) && rawTimestamp >= 0 ? rawTimestamp : now();

  const entry = {
    data,
    timestamp,
  };

  cache.set(normalizedKey, entry);
  touchEntry(normalizedKey, entry);

  enforceCacheLimit(options.maxEntries);

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

  bumpResourceVersion(normalizedKey);

  return getResourceVersion(normalizedKey);
};

export const invalidateResources = (keys = []) => {
  if (!Array.isArray(keys) || keys.length === 0) {
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

export const getCacheEpoch = () => {
  return cacheEpoch;
};

/* ============================================================
 * REQUEST DEDUPLICATION
 * ============================================================ */

export const createRequestDeduper = ({
  key,
  request,
  version = null,
  joinExisting = true,
}) => {
  const normalizedKey = normalizeKey(key);

  if (typeof request !== "function") {
    return Promise.reject(
      new TypeError("Request handler harus berupa function."),
    );
  }

  if (!normalizedKey) {
    return Promise.resolve().then(request);
  }

  const currentVersion = String(version ?? getResourceVersion(normalizedKey));

  const epoch = cacheEpoch;

  const existing = inFlightRequests.get(normalizedKey);

  /*
   * For concurrent callers of the same resource, always join
   * the existing request. The consumer-side generation/version
   * checks remain responsible for deciding whether its result
   * is allowed to update local state.
   */
  if (joinExisting && existing && existing.epoch === epoch) {
    return existing.promise;
  }

  const promise = Promise.resolve().then(request);

  const entry = {
    promise,
    version: currentVersion,
    epoch,
    startedAt: now(),
  };

  inFlightRequests.set(normalizedKey, entry);

  const cleanup = () => {
    const current = inFlightRequests.get(normalizedKey);

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

export const invalidateResourceAndRequest = (key, request) => {
  invalidateResource(key);

  const requestVersion = getResourceVersion(key);

  return createRequestDeduper({
    key,
    request,
    version: requestVersion,
    joinExisting: true,
  });
};

/* ============================================================
 * DEBUG / DIAGNOSTICS
 * ============================================================ */

export const getCacheStats = () => {
  return {
    cacheEntries: cache.size,
    inFlightRequests: inFlightRequests.size,
    cacheEpoch,

    cacheKeys: Array.from(cache.keys()),
    inFlightKeys: Array.from(inFlightRequests.keys()),
  };
};

/* ============================================================
 * DEFAULT
 * ============================================================ */

export default {
  getCachedResource,
  getStaleResource,
  getResourceSnapshot,

  getResourceState,
  getResourceAge,
  hasResourceSnapshot,
  hasCachedResource,
  isResourceFresh,
  isResourceStale,

  getResourceVersion,
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
