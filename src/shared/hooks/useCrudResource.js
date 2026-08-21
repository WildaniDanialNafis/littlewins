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

  const [isInitialLoading, setIsInitialLoading] = useState(() =>
    Boolean(autoFetch && service && cacheKey),
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [initialError, setInitialError] = useState(null);

  const [refreshError, setRefreshError] = useState(null);

  const [isCreating, setIsCreating] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  /* ==========================================================
   * REFS
   * ========================================================== */

  const mountedRef = useRef(false);

  const generationRef = useRef(0);

  const mutationVersionRef = useRef(0);

  const identityRef = useRef(cacheKey);

  const requestVersionRef = useRef(0);

  const createPromiseRef = useRef(null);

  const updatePromisesRef = useRef(new Map());

  const removePromisesRef = useRef(new Map());

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

      requestVersionRef.current += 1;

      createPromiseRef.current = null;

      updatePromises.clear();

      removePromises.clear();
    };
  }, []);

  /* ==========================================================
   * IDENTITY
   * ========================================================== */

  useEffect(() => {
    if (identityRef.current === cacheKey) {
      return;
    }

    identityRef.current = cacheKey;

    generationRef.current += 1;

    mutationVersionRef.current += 1;

    requestVersionRef.current += 1;

    const nextData = (() => {
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
    })();

    setData(nextData);
    setInitialError(null);
    setRefreshError(null);
    setIsRefreshing(false);

    setIsInitialLoading(Boolean(autoFetch && service && cacheKey));
  }, [autoFetch, cacheKey, initial, service, staleTime]);

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
          setIsInitialLoading(false);

          setIsRefreshing(false);
        }

        return EMPTY_ARRAY;
      }

      if (!force) {
        const cached = getCachedResource(cacheKey, staleTime);

        if (cached !== null) {
          const nextData = toArray(cached);

          if (mountedRef.current) {
            setData(nextData);

            setInitialError(null);

            setRefreshError(null);

            setIsInitialLoading(false);

            setIsRefreshing(false);
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

      const requestId = ++requestVersionRef.current;

      const showInitialLoading = data.length === 0;

      if (mountedRef.current) {
        if (showInitialLoading) {
          setIsInitialLoading(true);
        } else {
          setIsRefreshing(true);
        }

        if (force) {
          setRefreshError(null);
        } else {
          setInitialError(null);
        }
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
          mutationVersion === mutationVersionRef.current &&
          requestId === requestVersionRef.current &&
          identityRef.current === cacheKey;

        /*
         * Version guard tetap dijalankan oleh cache layer.
         */
        setCachedResource(cacheKey, nextData, {
          version: requestVersion,
        });

        if (!isCurrent) {
          return nextData;
        }

        setData(nextData);

        setInitialError(null);
        setRefreshError(null);

        setIsInitialLoading(false);

        setIsRefreshing(false);

        return nextData;
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          if (mountedRef.current && requestId === requestVersionRef.current) {
            setIsInitialLoading(false);

            setIsRefreshing(false);
          }

          return EMPTY_ARRAY;
        }

        const normalizedError = toError(
          fetchError,
          messages?.fetch ?? "Gagal memuat data.",
        );

        const isCurrent =
          mountedRef.current &&
          generation === generationRef.current &&
          mutationVersion === mutationVersionRef.current &&
          requestId === requestVersionRef.current &&
          identityRef.current === cacheKey;

        if (isCurrent) {
          if (showInitialLoading) {
            setInitialError(normalizedError);
          } else {
            setRefreshError(normalizedError);
          }

          setIsInitialLoading(false);

          setIsRefreshing(false);
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
      if (!service || typeof service.create !== "function") {
        return Promise.reject(new Error("Create method tidak tersedia."));
      }

      if (createPromiseRef.current) {
        return createPromiseRef.current;
      }

      invalidate();

      const mutationGeneration = generationRef.current;

      if (mountedRef.current) {
        setIsCreating(true);
      }

      const promise = (async () => {
        try {
          const created = await service.create(payload);

          const isCurrent =
            mountedRef.current && mutationGeneration === generationRef.current;

          if (isCurrent) {
            setData((current) => {
              if (!created) {
                return current;
              }

              const exists = current.some((item) =>
                sameId(item?.id, created?.id),
              );

              if (exists) {
                return current;
              }

              const nextData = [...current, created];

              if (cacheKey) {
                setCachedResource(cacheKey, nextData, {
                  version: getResourceVersion(cacheKey),
                });
              }

              return nextData;
            });

            setInitialError(null);
            setRefreshError(null);
          }

          return created;
        } catch (mutationError) {
          const normalizedError = toError(
            mutationError,
            messages?.create ?? "Gagal membuat data.",
          );

          if (mountedRef.current) {
            setInitialError(normalizedError);
          }

          throw normalizedError;
        } finally {
          if (createPromiseRef.current === promise) {
            createPromiseRef.current = null;
          }

          if (mountedRef.current) {
            setIsCreating(false);
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
      if (!service || typeof service.update !== "function") {
        return Promise.reject(new Error("Update method tidak tersedia."));
      }

      const key = String(id);

      const existing = updatePromisesRef.current.get(key);

      if (existing) {
        return existing;
      }

      invalidate();

      const mutationGeneration = generationRef.current;

      if (mountedRef.current) {
        setIsUpdating(true);
      }

      const promise = (async () => {
        try {
          const updated = await service.update(id, payload);

          const isCurrent =
            mountedRef.current && mutationGeneration === generationRef.current;

          if (isCurrent) {
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

            setInitialError(null);
            setRefreshError(null);
          }

          return updated;
        } catch (mutationError) {
          const normalizedError = toError(
            mutationError,
            messages?.update ?? "Gagal memperbarui data.",
          );

          if (mountedRef.current) {
            setInitialError(normalizedError);
          }

          throw normalizedError;
        } finally {
          if (updatePromisesRef.current.get(key) === promise) {
            updatePromisesRef.current.delete(key);
          }

          if (mountedRef.current && updatePromisesRef.current.size === 0) {
            setIsUpdating(false);
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
      if (!service || typeof service.remove !== "function") {
        return Promise.reject(new Error("Delete method tidak tersedia."));
      }

      const key = String(id);

      const existing = removePromisesRef.current.get(key);

      if (existing) {
        return existing;
      }

      invalidate();

      const mutationGeneration = generationRef.current;

      if (mountedRef.current) {
        setIsDeleting(true);
      }

      const promise = (async () => {
        try {
          await service.remove(id);

          const isCurrent =
            mountedRef.current && mutationGeneration === generationRef.current;

          if (isCurrent) {
            setData((current) => {
              const nextData = current.filter((item) => !sameId(item?.id, id));

              if (cacheKey) {
                setCachedResource(cacheKey, nextData, {
                  version: getResourceVersion(cacheKey),
                });
              }

              return nextData;
            });

            setInitialError(null);
            setRefreshError(null);
          }

          return true;
        } catch (mutationError) {
          const normalizedError = toError(
            mutationError,
            messages?.delete ?? "Gagal menghapus data.",
          );

          if (mountedRef.current) {
            setInitialError(normalizedError);
          }

          throw normalizedError;
        } finally {
          if (removePromisesRef.current.get(key) === promise) {
            removePromisesRef.current.delete(key);
          }

          if (mountedRef.current && removePromisesRef.current.size === 0) {
            setIsDeleting(false);
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
      if (mountedRef.current) {
        setIsInitialLoading(false);
      }

      return undefined;
    }

    let cancelled = false;

    void (async () => {
      if (cancelled) {
        return;
      }

      try {
        await fetchAll();
      } catch {
        // Error sudah diproses di fetchAll.
      }
    })();

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
   * DERIVED STATE
   * ========================================================== */

  const loading = isInitialLoading;

  const isFetching = Boolean(isInitialLoading || isRefreshing);

  const error = initialError ?? refreshError ?? null;

  const isMutating = Boolean(isCreating || isUpdating || isDeleting);

  /* ==========================================================
   * RETURN
   * ========================================================== */

  return {
    data,

    loading,

    isInitialLoading,

    isFetching,

    isRefreshing,

    error,

    initialError,

    refreshError,

    isCreating,

    isUpdating,

    isDeleting,

    isMutating,

    fetchAll,

    create,

    update,

    remove,

    refresh,
  };
};

useCrudResource.displayName = "useCrudResource";

export default useCrudResource;
