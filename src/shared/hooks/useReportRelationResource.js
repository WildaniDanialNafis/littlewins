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

  /* ==========================================================
   * NORMALIZATION
   * ========================================================== */

  const normalizeData = useCallback(
    (value) => {
      const array = toArray(value);

      if (typeof sortData !== "function") {
        return array;
      }

      const sorted = sortData(array);

      return Array.isArray(sorted) ? sorted : array;
    },
    [sortData],
  );

  const normalizedInitialData = useMemo(
    () => normalizeData(initialData),
    [initialData, normalizeData],
  );

  const resolveInitialData = useCallback(() => {
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

  /* ==========================================================
   * STATE
   * ========================================================== */

  const [data, setData] = useState(resolveInitialData);

  const [isInitialLoading, setIsInitialLoading] = useState(() =>
    Boolean(autoFetch && hasReportId),
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

  const identityRef = useRef(identity);

  const requestVersionRef = useRef(0);

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
    if (identityRef.current === identity) {
      return;
    }

    identityRef.current = identity;

    generationRef.current += 1;

    requestVersionRef.current += 1;

    setData(resolveInitialData());

    setInitialError(null);
    setRefreshError(null);
    setIsRefreshing(false);

    setIsInitialLoading(Boolean(autoFetch && hasReportId));
  }, [autoFetch, hasReportId, identity, resolveInitialData]);

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
        if (mountedRef.current) {
          setData(normalizeData(initialData));

          setIsInitialLoading(false);

          setIsRefreshing(false);
        }

        return EMPTY_ARRAY;
      }

      if (!methods || typeof methods.getAll !== "function") {
        const methodError = new Error("GetAll method tidak tersedia.");

        if (mountedRef.current) {
          setInitialError(methodError);

          setIsInitialLoading(false);

          setIsRefreshing(false);
        }

        throw methodError;
      }

      if (!force) {
        const cached = getCachedResource(cacheKey, staleTime);

        if (cached !== null) {
          const nextData = normalizeData(cached);

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

      if (force && cacheKey) {
        invalidateResource(cacheKey);
      }

      const requestGeneration = generationRef.current;

      const requestIdentity = identity;

      const requestVersion = cacheKey ? getResourceVersion(cacheKey) : null;

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
          key:
            cacheKey ?? `report:${normalizedReportId}:${normalizedResourceKey}`,

          request: () => methods.getAll(normalizedReportId),
        });

        const nextData = normalizeData(result);

        if (cacheKey) {
          setCachedResource(cacheKey, nextData, {
            version: requestVersion,
          });
        }

        const isCurrent =
          mountedRef.current &&
          requestGeneration === generationRef.current &&
          requestId === requestVersionRef.current &&
          identityRef.current === requestIdentity;

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
          requestGeneration === generationRef.current &&
          requestId === requestVersionRef.current &&
          identityRef.current === requestIdentity;

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
    [
      cacheKey,
      data.length,
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

      if (mountedRef.current) {
        setIsCreating(true);
      }

      const promise = (async () => {
        try {
          const created = await methods.create(normalizedReportId, payload);

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

              const nextData = normalizeData([...current, created]);

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
      if (!hasReportId) {
        return Promise.reject(new Error("Report ID wajib diisi."));
      }

      if (!methods || typeof methods.update !== "function") {
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
          const updated = await methods.update(normalizedReportId, id, payload);

          const isCurrent =
            mountedRef.current && mutationGeneration === generationRef.current;

          if (isCurrent) {
            setData((current) => {
              const nextData = normalizeData(
                current.map((item) => (sameId(item?.id, id) ? updated : item)),
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

      if (!methods || typeof methods.remove !== "function") {
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
          await methods.remove(normalizedReportId, id);

          const isCurrent =
            mountedRef.current && mutationGeneration === generationRef.current;

          if (isCurrent) {
            setData((current) => {
              const nextData = normalizeData(
                current.filter((item) => !sameId(item?.id, id)),
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
        setIsInitialLoading(false);
      }

      return undefined;
    }

    let cancelled = false;

    let force = false;

    if (forceFetchOnMount && forceMountIdentityRef.current !== identity) {
      forceMountIdentityRef.current = identity;

      force = true;
    }

    void (async () => {
      if (cancelled) {
        return;
      }

      try {
        await fetchItems({
          force,
        });
      } catch {
        // Error sudah diproses di fetchItems.
      }
    })();

    return () => {
      cancelled = true;
    };
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

    fetchItems,

    create,

    update,

    remove,

    refresh,
  };
};

useReportRelationResource.displayName = "useReportRelationResource";

export default useReportRelationResource;
