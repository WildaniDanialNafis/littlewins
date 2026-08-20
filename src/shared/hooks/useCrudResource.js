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

import { useAuth } from "./useAuth";

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

const sameId = (firstId, secondId) => {
  return String(firstId) === String(secondId);
};

const toArray = (value) => {
  return Array.isArray(value) ? value : EMPTY_ARRAY;
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

const useCrudResource = ({
  service,
  resourceKey,
  messages,
  initialData = EMPTY_ARRAY,
  autoFetch = true,
  staleTime = DEFAULT_STALE_TIME,
}) => {
  const { user } = useAuth();

  const userScope = getUserScope(user);

  const normalizedResourceKey = String(resourceKey ?? "").trim();

  const cacheKey = useMemo(() => {
    if (!userScope || !normalizedResourceKey) {
      return null;
    }

    return getResourceKey({
      scope: `user:${userScope}`,
      resource: normalizedResourceKey,
    });
  }, [normalizedResourceKey, userScope]);

  const initial = Array.isArray(initialData) ? initialData : EMPTY_ARRAY;

  /* ==========================================================
   * STATE
   * ========================================================== */

  // Check if we have cached data on mount
  const hasCachedData = useMemo(() => {
    if (!cacheKey) {
      return false;
    }

    const cached = getCachedResource(cacheKey, staleTime);
    if (cached !== null) {
      return true;
    }

    const snapshot = getResourceSnapshot(cacheKey);
    if (snapshot?.data !== undefined) {
      return true;
    }

    return false;
  }, [cacheKey, staleTime]);

  const [data, setData] = useState(() => {
    if (!cacheKey) {
      return initial;
    }

    const cached = getCachedResource(cacheKey, staleTime);

    if (cached !== null) {
      return toArray(cached);
    }

    const snapshot = getResourceSnapshot(cacheKey);

    if (snapshot?.data !== undefined) {
      return toArray(snapshot.data);
    }

    return initial;
  });

  /**
   * CRITICAL FIX: Separate initialLoading from refreshing
   * 
   * initialLoading: Only true on first fetch when no data exists
   * refreshing: True when user explicitly refreshes existing data
   */
  const [initialLoading, setInitialLoading] = useState(() => {
    // Only start as loading if:
    // 1. autoFetch is enabled
    // 2. We have a valid cacheKey
    // 3. We don't already have cached data
    return Boolean(autoFetch && service && cacheKey && !hasCachedData);
  });

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  /* ==========================================================
   * REFS
   * ========================================================== */

  const mountedRef = useRef(false);

  const generationRef = useRef(0);

  const mutationVersionRef = useRef(0);

  const createPromiseRef = useRef(null);

  const updatePromisesRef = useRef(new Map());

  const removePromisesRef = useRef(new Map());

  // Track whether initial fetch has completed at least once
  const initialFetchCompleteRef = useRef(false);

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

      mutationVersionRef.current += 1;

      createPromiseRef.current = null;

      updatePromises.clear();

      removePromises.clear();
    };
  }, []);

  /* ==========================================================
   * INVALIDATE
   * ========================================================== */

  const invalidate = useCallback(() => {
    generationRef.current += 1;

    mutationVersionRef.current += 1;

    if (cacheKey) {
      invalidateResource(cacheKey);
    }
  }, [cacheKey]);

  /* ==========================================================
   * FETCH
   * ========================================================== */

  const fetchAll = useCallback(
    async ({ force = false } = {}) => {
      if (!service || !cacheKey) {
        if (mountedRef.current) {
          setInitialLoading(false);
          setRefreshing(false);
        }

        return EMPTY_ARRAY;
      }

      // Check if this is a refresh (data already exists) or initial fetch
      const hasExistingData = data.length > 0 || getCachedResource(cacheKey, staleTime) !== null;

      if (!force) {
        const cached = getCachedResource(cacheKey, staleTime);

        if (cached !== null) {
          const nextData = toArray(cached);

          if (mountedRef.current) {
            setData(nextData);

            setError(null);

            setInitialLoading(false);
            setRefreshing(false);
          }

          return nextData;
        }
      }

      if (force) {
        invalidateResource(cacheKey);
      }

      const generation = generationRef.current;

      const mutationVersion = mutationVersionRef.current;

      const requestVersion = getResourceVersion(cacheKey);

      if (mountedRef.current) {
        // CRITICAL FIX: Use refreshing for refreshes, initialLoading for first load
        if (hasExistingData || initialFetchCompleteRef.current) {
          setRefreshing(true);
          // Don't set initialLoading here - preserve existing data display
        } else {
          setInitialLoading(true);
        }

        setError(null);
      }

      try {
        const result = await createRequestDeduper({
          key: cacheKey,

          request: () => service.getAll(),
        });

        const nextData = toArray(result);

        const isCurrent =
          mountedRef.current &&
          generation === generationRef.current &&
          mutationVersion === mutationVersionRef.current;

        if (!isCurrent) {
          return nextData;
        }

        setCachedResource(cacheKey, nextData, {
          version: requestVersion,
        });

        setData(nextData);

        setError(null);

        // Mark initial fetch as complete
        initialFetchCompleteRef.current = true;

        setInitialLoading(false);
        setRefreshing(false);

        return nextData;
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          if (mountedRef.current) {
            setInitialLoading(false);
            setRefreshing(false);
          }

          return EMPTY_ARRAY;
        }

        const normalizedError = toError(
          fetchError,
          messages?.fetch ?? "Gagal memuat data.",
        );

        if (
          mountedRef.current &&
          generation === generationRef.current &&
          mutationVersion === mutationVersionRef.current
        ) {
          setError(normalizedError);

          setInitialLoading(false);
          setRefreshing(false);
        }

        throw normalizedError;
      }
    },
    [cacheKey, data.length, messages?.fetch, service, staleTime],
  );

  /* ==========================================================
   * CREATE
   * ========================================================== */

  const create = useCallback(
    (payload) => {
      if (createPromiseRef.current) {
        return createPromiseRef.current;
      }

      invalidate();

      const mutationGeneration = generationRef.current;

      const promise = (async () => {
        try {
          const created = await service.create(payload);

          mutationVersionRef.current += 1;

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
            setData((current) => {
              const nextData = [...current, created];

              if (cacheKey) {
                setCachedResource(cacheKey, nextData, {
                  version: getResourceVersion(cacheKey),
                });
              }

              return nextData;
            });

            setError(null);
          }

          return created;
        } catch (mutationError) {
          const normalizedError = toError(
            mutationError,
            messages?.create ?? "Gagal membuat data.",
          );

          if (mountedRef.current) {
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
    [cacheKey, invalidate, messages?.create, service],
  );

  /* ==========================================================
   * UPDATE
   * ========================================================== */

  const update = useCallback(
    (id, payload) => {
      const key = String(id);

      const existing = updatePromisesRef.current.get(key);

      if (existing) {
        return existing;
      }

      invalidate();

      const mutationGeneration = generationRef.current;

      const promise = (async () => {
        try {
          const updated = await service.update(id, payload);

          mutationVersionRef.current += 1;

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
            setData((current) => {
              const nextData = current.map((item) =>
                sameId(item?.id, id) ? updated : item,
              );

              if (cacheKey) {
                setCachedResource(cacheKey, nextData, {
                  version: getResourceVersion(cacheKey),
                });
              }

              return nextData;
            });

            setError(null);
          }

          return updated;
        } catch (mutationError) {
          const normalizedError = toError(
            mutationError,
            messages?.update ?? "Gagal memperbarui data.",
          );

          if (mountedRef.current) {
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
    [cacheKey, invalidate, messages?.update, service],
  );

  /* ==========================================================
   * REMOVE
   * ========================================================== */

  const remove = useCallback(
    (id) => {
      const key = String(id);

      const existing = removePromisesRef.current.get(key);

      if (existing) {
        return existing;
      }

      invalidate();

      const mutationGeneration = generationRef.current;

      const promise = (async () => {
        try {
          await service.remove(id);

          mutationVersionRef.current += 1;

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
            setData((current) => {
              const nextData = current.filter((item) => !sameId(item?.id, id));

              if (cacheKey) {
                setCachedResource(cacheKey, nextData, {
                  version: getResourceVersion(cacheKey),
                });
              }

              return nextData;
            });

            setError(null);
          }

          return true;
        } catch (mutationError) {
          const normalizedError = toError(
            mutationError,
            messages?.delete ?? "Gagal menghapus data.",
          );

          if (mountedRef.current) {
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
    [cacheKey, invalidate, messages?.delete, service],
  );

  /* ==========================================================
   * AUTO FETCH
   * ========================================================== */

  useEffect(() => {
    if (!autoFetch || !cacheKey || !service) {
      return undefined;
    }

    let cancelled = false;

    const execute = async () => {
      try {
        if (!cancelled) {
          await fetchAll();
        }
      } catch {
        // handled internally
      }
    };

    void execute();

    return () => {
      cancelled = true;
    };
  }, [autoFetch, cacheKey, fetchAll, service]);

  /* ==========================================================
   * REFRESH
   * ========================================================== */

  const refresh = useCallback(
    () =>
      fetchAll({
        force: true,
      }),
    [fetchAll],
  );

  /* ==========================================================
   * RETURN
   * ========================================================== */

  return {
    data,

    loading,

    error,

    fetchAll,

    create,

    update,

    remove,

    refresh,
  };
};

useCrudResource.displayName = "useCrudResource";

export default useCrudResource;
