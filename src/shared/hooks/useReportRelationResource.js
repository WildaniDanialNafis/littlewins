import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  createRequestDeduper,
  getCachedResource,
  getResourceKey,
  getResourceSnapshot,
  getResourceVersion,
  invalidateResource,
  setCachedResource,
} from "@/shared/cache";

import useAuth from "./useAuth";

const EMPTY_ARRAY = Object.freeze([]);

const DEFAULT_STALE_TIME = 60_000;

/* ============================================================
 * HELPERS
 * ============================================================ */

const isAbortError = (error) => {
  return (
    error?.name === "AbortError" ||
    error?.name === "TimeoutError" ||
    error?.code === "ERR_CANCELED" ||
    error?.code === "ABORT_ERR"
  );
};

const toError = (error, fallbackMessage) => {
  if (error instanceof Error) {
    return error;
  }

  if (error && typeof error.message === "string") {
    return new Error(error.message);
  }

  if (typeof error === "string" && error.trim()) {
    return new Error(error);
  }

  return new Error(fallbackMessage);
};

const toArray = (value) => {
  return Array.isArray(value) ? value : EMPTY_ARRAY;
};

const sameId = (firstId, secondId) => {
  return String(firstId) === String(secondId);
};

const normalizeResourceKey = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();

  return normalized || null;
};

const getUserScope = (user) => {
  const userId = user?.profile?.id ?? user?.id;

  if (userId === null || userId === undefined || userId === "") {
    return null;
  }

  return `${String(user?.role ?? "unknown")
    .trim()
    .toLowerCase()}:${String(userId)}`;
};

/* ============================================================
 * HOOK
 * ============================================================ */

const useReportRelationResource = ({
  reportId,

  resourceKey,

  methods,

  messages,

  initialData = EMPTY_ARRAY,

  autoFetch = true,

  sortData,

  staleTime = DEFAULT_STALE_TIME,

  forceFetchOnMount = false,
}) => {
  const { user } = useAuth();

  const normalizedReportId =
    reportId !== null && reportId !== undefined && reportId !== ""
      ? String(reportId)
      : null;

  const normalizedResourceKey = normalizeResourceKey(resourceKey);

  const userScope = getUserScope(user);

  const hasReportId = normalizedReportId !== null;

  const canCache = Boolean(
    userScope && normalizedReportId && normalizedResourceKey,
  );

  const cacheKey = useMemo(() => {
    if (!canCache) {
      return null;
    }

    return getResourceKey({
      scope: `user:${userScope}`,

      resource: `report:${normalizedReportId}:${normalizedResourceKey}`,
    });
  }, [canCache, normalizedReportId, normalizedResourceKey, userScope]);

  const normalizeData = useCallback(
    (value) => {
      const array = toArray(value);

      if (typeof sortData !== "function") {
        return array;
      }

      return sortData(array);
    },
    [sortData],
  );

  const normalizedInitialData = useMemo(
    () => normalizeData(initialData),
    [initialData, normalizeData],
  );

  /**
   * FIX:
   * Cache resolution dipindahkan dari useEffect ke useMemo.
   * Tidak ada setState synchronously dalam effect.
   */
  const resolvedInitialData = useMemo(() => {
    if (!hasReportId) {
      return normalizedInitialData;
    }

    if (!cacheKey) {
      return normalizedInitialData;
    }

    const cached = getCachedResource(cacheKey, staleTime);

    if (cached !== null) {
      return normalizeData(cached);
    }

    const snapshot = getResourceSnapshot(cacheKey);

    if (snapshot?.data !== undefined) {
      return normalizeData(snapshot.data);
    }

    return normalizedInitialData;
  }, [cacheKey, hasReportId, normalizeData, normalizedInitialData, staleTime]);

  const identity = useMemo(
    () =>
      [
        userScope ?? "anonymous",

        normalizedReportId ?? "invalid",

        normalizedResourceKey ?? "unknown",
      ].join(":"),
    [normalizedReportId, normalizedResourceKey, userScope],
  );

  const [data, setData] = useState(resolvedInitialData);

  const [loading, setLoading] = useState(Boolean(autoFetch && hasReportId));

  const [error, setError] = useState(null);

  const mountedRef = useRef(false);

  const generationRef = useRef(0);

  const identityRef = useRef(identity);

  const createPromiseRef = useRef(null);

  const updatePromisesRef = useRef(new Map());

  const removePromisesRef = useRef(new Map());

  const forceMountIdentityRef = useRef(null);

  /* ==========================================================
   * LIFECYCLE
   * ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    const updatePromises = updatePromisesRef.current;
    const removePromises = removePromisesRef.current;

    return () => {
      mountedRef.current = false;

      generationRef.current += 1;

      createPromiseRef.current = null;

      updatePromises.clear();

      removePromises.clear();
    };
  }, []);

  /* ==========================================================
   * IDENTITY
   * ========================================================== */

  useEffect(() => {
    if (identityRef.current === identity) {
      return;
    }

    identityRef.current = identity;

    generationRef.current += 1;

    setError(null);

    if (!hasReportId) {
      return;
    }

    if (!cacheKey) {
      return;
    }

    const cached = getCachedResource(cacheKey, staleTime);

    if (cached !== null) {
      return;
    }

    const snapshot = getResourceSnapshot(cacheKey);

    if (snapshot?.data !== undefined) {
      return;
    }
  }, [identity, cacheKey, hasReportId, staleTime]);

  /* ==========================================================
   * INVALIDATE
   * ========================================================== */

  const invalidate = useCallback(() => {
    generationRef.current += 1;

    if (cacheKey) {
      invalidateResource(cacheKey);
    }
  }, [cacheKey]);

  /* ==========================================================
   * FETCH
   * ========================================================== */

  const fetchItems = useCallback(
    async ({ force = false } = {}) => {
      if (!hasReportId) {
        setData(normalizeData(initialData));

        setLoading(false);

        return EMPTY_ARRAY;
      }

      if (!methods || typeof methods.getAll !== "function") {
        const methodError = new Error("GetAll method tidak tersedia.");

        if (mountedRef.current) {
          setError(methodError);

          setLoading(false);
        }

        throw methodError;
      }

      if (!force) {
        const cached = getCachedResource(cacheKey, staleTime);

        if (cached !== null) {
          const nextData = normalizeData(cached);

          if (mountedRef.current) {
            setData(nextData);

            setError(null);

            setLoading(false);
          }

          return nextData;
        }
      }

      if (force && cacheKey) {
        invalidateResource(cacheKey);
      }

      const requestGeneration = generationRef.current;

      const requestIdentity = identity;

      if (mountedRef.current) {
        setLoading(true);

        setError(null);
      }

      try {
        const result = await createRequestDeduper({
          key:
            cacheKey ?? `report:${normalizedReportId}:${normalizedResourceKey}`,

          request: () => methods.getAll(normalizedReportId),
        });

        const nextData = normalizeData(result);

        if (cacheKey) {
          setCachedResource(cacheKey, nextData, {
            version: getResourceVersion(cacheKey),
          });
        }

        const isCurrent =
          mountedRef.current &&
          requestGeneration === generationRef.current &&
          identityRef.current === requestIdentity;

        if (!isCurrent) {
          return nextData;
        }

        setData(nextData);

        setError(null);

        setLoading(false);

        return nextData;
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          if (
            mountedRef.current &&
            requestGeneration === generationRef.current
          ) {
            setLoading(false);
          }

          return EMPTY_ARRAY;
        }

        const normalizedError = toError(
          fetchError,
          messages?.fetch ?? "Gagal memuat data.",
        );

        if (
          mountedRef.current &&
          requestGeneration === generationRef.current &&
          identityRef.current === requestIdentity
        ) {
          setError(normalizedError);

          setLoading(false);
        }

        throw normalizedError;
      }
    },
    [
      cacheKey,
      hasReportId,
      identity,
      initialData,
      messages?.fetch,
      methods,
      normalizeData,
      normalizedReportId,
      normalizedResourceKey,
      staleTime,
    ],
  );

  /* ==========================================================
   * CREATE
   * ========================================================== */

  const create = useCallback(
    (payload) => {
      if (!hasReportId) {
        return Promise.reject(new Error("Report ID wajib diisi."));
      }

      if (!methods || typeof methods.create !== "function") {
        return Promise.reject(new Error("Create method tidak tersedia."));
      }

      if (createPromiseRef.current) {
        return createPromiseRef.current;
      }

      invalidate();

      const mutationGeneration = generationRef.current;

      const promise = (async () => {
        try {
          const created = await methods.create(normalizedReportId, payload);

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
            setData((current) => {
              const next = normalizeData([...current, created]);

              if (cacheKey) {
                setCachedResource(cacheKey, next, {
                  version: getResourceVersion(cacheKey),
                });
              }

              return next;
            });

            setError(null);
          }

          return created;
        } catch (mutationError) {
          const normalizedError = toError(
            mutationError,
            messages?.create ?? "Gagal membuat data.",
          );

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
            setError(normalizedError);
          }

          throw normalizedError;
        } finally {
          if (createPromiseRef.current === promise) {
            createPromiseRef.current = null;
          }
        }
      })();

      createPromiseRef.current = promise;

      return promise;
    },
    [
      cacheKey,
      hasReportId,
      invalidate,
      messages?.create,
      methods,
      normalizeData,
      normalizedReportId,
    ],
  );

  /* ==========================================================
   * UPDATE
   * ========================================================== */

  const update = useCallback(
    (id, payload) => {
      const key = String(id);

      if (!hasReportId) {
        return Promise.reject(new Error("Report ID wajib diisi."));
      }

      if (!methods || typeof methods.update !== "function") {
        return Promise.reject(new Error("Update method tidak tersedia."));
      }

      const existing = updatePromisesRef.current.get(key);

      if (existing) {
        return existing;
      }

      invalidate();

      const mutationGeneration = generationRef.current;

      const promise = (async () => {
        try {
          const updated = await methods.update(normalizedReportId, id, payload);

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
            setData((current) => {
              const next = normalizeData(
                current.map((item) => (sameId(item?.id, id) ? updated : item)),
              );

              if (cacheKey) {
                setCachedResource(cacheKey, next, {
                  version: getResourceVersion(cacheKey),
                });
              }

              return next;
            });

            setError(null);
          }

          return updated;
        } catch (mutationError) {
          const normalizedError = toError(
            mutationError,
            messages?.update ?? "Gagal memperbarui data.",
          );

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
            setError(normalizedError);
          }

          throw normalizedError;
        } finally {
          if (updatePromisesRef.current.get(key) === promise) {
            updatePromisesRef.current.delete(key);
          }
        }
      })();

      updatePromisesRef.current.set(key, promise);

      return promise;
    },
    [
      cacheKey,
      hasReportId,
      invalidate,
      messages?.update,
      methods,
      normalizeData,
      normalizedReportId,
    ],
  );

  /* ==========================================================
   * REMOVE
   * ========================================================== */

  const remove = useCallback(
    (id) => {
      if (!hasReportId) {
        return Promise.reject(new Error("Report ID wajib diisi."));
      }

      const key = String(id);

      const existing = removePromisesRef.current.get(key);

      if (existing) {
        return existing;
      }

      invalidate();

      const mutationGeneration = generationRef.current;

      const promise = (async () => {
        try {
          await methods.remove(normalizedReportId, id);

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
            setData((current) => {
              const next = normalizeData(
                current.filter((item) => !sameId(item?.id, id)),
              );

              if (cacheKey) {
                setCachedResource(cacheKey, next, {
                  version: getResourceVersion(cacheKey),
                });
              }

              return next;
            });

            setError(null);
          }

          return true;
        } catch (mutationError) {
          const normalizedError = toError(
            mutationError,
            messages?.delete ?? "Gagal menghapus data.",
          );

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
            setError(normalizedError);
          }

          throw normalizedError;
        } finally {
          if (removePromisesRef.current.get(key) === promise) {
            removePromisesRef.current.delete(key);
          }
        }
      })();

      removePromisesRef.current.set(key, promise);

      return promise;
    },
    [
      cacheKey,
      hasReportId,
      invalidate,
      messages?.delete,
      methods,
      normalizeData,
      normalizedReportId,
    ],
  );

  /* ==========================================================
   * AUTO FETCH
   * ========================================================== */

  useEffect(() => {
    if (!autoFetch || !hasReportId) {
      if (mountedRef.current) {
        setLoading(false);
      }

      return undefined;
    }

    let force = false;

    if (forceFetchOnMount && forceMountIdentityRef.current !== identity) {
      forceMountIdentityRef.current = identity;

      force = true;
    }

    void fetchItems({
      force,
    }).catch(() => {});

    return undefined;
  }, [autoFetch, fetchItems, forceFetchOnMount, hasReportId, identity]);

  /* ==========================================================
   * REFRESH
   * ========================================================== */

  const refresh = useCallback(
    () =>
      fetchItems({
        force: true,
      }),
    [fetchItems],
  );

  return {
    data,

    loading,

    error,

    fetchItems,

    create,

    update,

    remove,

    refresh,
  };
};

useReportRelationResource.displayName = "useReportRelationResource";

export default useReportRelationResource;
