import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { reportService } from "@/services/api";

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

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const EMPTY_ARRAY = Object.freeze([]);

const LIST_STALE_TIME = 30_000;

const DETAIL_STALE_TIME = 30_000;

/* ============================================================
 * HELPERS
 * ============================================================ */

const normalizeError = (error, fallback) => {
  if (error instanceof Error) {
    return error;
  }

  if (error && typeof error.message === "string") {
    return new Error(error.message);
  }

  if (typeof error === "string" && error.trim()) {
    return new Error(error);
  }

  return new Error(fallback);
};

const isAbortError = (error) => {
  return (
    error?.name === "AbortError" ||
    error?.name === "TimeoutError" ||
    error?.code === "ERR_CANCELED" ||
    error?.code === "ABORT_ERR"
  );
};

const toArray = (value) => {
  return Array.isArray(value) ? value : EMPTY_ARRAY;
};

const normalizeId = (id) => {
  if (id === null || id === undefined || id === "") {
    return null;
  }

  const normalized = String(id).trim();

  return normalized || null;
};

const isValidId = (id) => {
  return id !== null && id !== undefined && id !== "";
};

const sameId = (firstId, secondId) => {
  return normalizeId(firstId) === normalizeId(secondId);
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

export const useReports = (options = {}) => {
  const {
    autoFetch = true,

    staleTime = LIST_STALE_TIME,
  } = options;

  const { user } = useAuth();

  const userScope = getUserScope(user);

  /* ==========================================================
   * CACHE KEYS
   * ========================================================== */

  const listCacheKey = useMemo(() => {
    if (!userScope) {
      return null;
    }

    return getResourceKey({
      scope: `user:${userScope}`,
      resource: "reports:list",
    });
  }, [userScope]);

  const getDetailCacheKey = useCallback(
    (id) => {
      if (!userScope || !isValidId(id)) {
        return null;
      }

      return getResourceKey({
        scope: `user:${userScope}`,

        resource: `reports:${String(id)}`,
      });
    },
    [userScope],
  );

  /* ==========================================================
   * INITIAL DATA
   * ========================================================== */

  const getInitialReports = useCallback(() => {
    if (!listCacheKey) {
      return EMPTY_ARRAY;
    }

    const cached = getCachedResource(listCacheKey, staleTime);

    if (cached !== null) {
      return toArray(cached);
    }

    const snapshot = getResourceSnapshot(listCacheKey);

    if (snapshot?.data !== undefined) {
      return toArray(snapshot.data);
    }

    return EMPTY_ARRAY;
  }, [listCacheKey, staleTime]);

  /* ==========================================================
   * STATE
   * ========================================================== */

  const [reports, setReports] = useState(getInitialReports);

  const [isInitialLoading, setIsInitialLoading] = useState(() =>
    Boolean(autoFetch && listCacheKey),
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

  const identityRef = useRef(listCacheKey);

  const generationRef = useRef(0);

  const mutationVersionRef = useRef(0);

  const listRequestVersionRef = useRef(0);

  const refreshPromiseRef = useRef(null);

  const createPromiseRef = useRef(null);

  const updatePromisesRef = useRef(new Map());

  const deletePromisesRef = useRef(new Map());

  /* ==========================================================
   * LIFECYCLE
   * ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    const updatePromises = updatePromisesRef.current;
    const deletePromises = deletePromisesRef.current;

    return () => {
      mountedRef.current = false;

      generationRef.current += 1;

      mutationVersionRef.current += 1;

      listRequestVersionRef.current += 1;

      refreshPromiseRef.current = null;

      createPromiseRef.current = null;

      updatePromises.clear();

      deletePromises.clear();
    };
  }, []);

  /* ==========================================================
   * USER / CACHE IDENTITY
   * ========================================================== */

  useEffect(() => {
    if (identityRef.current === listCacheKey) {
      return;
    }

    identityRef.current = listCacheKey;

    generationRef.current += 1;

    mutationVersionRef.current += 1;

    listRequestVersionRef.current += 1;

    setInitialError(null);

    setRefreshError(null);

    setIsInitialLoading(Boolean(autoFetch && listCacheKey));

    setIsRefreshing(false);

    setReports(getInitialReports());
  }, [autoFetch, getInitialReports, listCacheKey]);

  /* ==========================================================
   * FETCH LIST
   * ========================================================== */

  const fetchReports = useCallback(
    async ({ force = false } = {}) => {
      if (!listCacheKey) {
        if (mountedRef.current) {
          setReports(EMPTY_ARRAY);

          setIsInitialLoading(false);

          setIsRefreshing(false);
        }

        return EMPTY_ARRAY;
      }

      /*
       * FRESH CACHE
       */
      if (!force) {
        const cached = getCachedResource(listCacheKey, staleTime);

        if (cached !== null) {
          const nextReports = toArray(cached);

          if (mountedRef.current) {
            setReports(nextReports);

            setInitialError(null);

            setRefreshError(null);

            setIsInitialLoading(false);

            setIsRefreshing(false);
          }

          return nextReports;
        }
      }

      /*
       * FORCE FETCH
       */
      if (force) {
        invalidateResource(listCacheKey);
      }

      const generation = generationRef.current;

      const mutationVersion = mutationVersionRef.current;

      const requestVersion = getResourceVersion(listCacheKey);

      const requestId = ++listRequestVersionRef.current;

      const shouldShowInitialLoading = reports.length === 0;

      if (mountedRef.current) {
        if (shouldShowInitialLoading) {
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
          key: listCacheKey,

          request: () => reportService.getAll(),
        });

        const nextReports = toArray(result);

        const isCurrent =
          mountedRef.current &&
          generation === generationRef.current &&
          mutationVersion === mutationVersionRef.current &&
          requestId === listRequestVersionRef.current &&
          identityRef.current === listCacheKey;

        /*
         * Cache may be updated even when
         * the originating component was
         * subsequently replaced.
         *
         * Version guard prevents an older
         * request from overwriting newer
         * invalidated cache state.
         */
        setCachedResource(listCacheKey, nextReports, {
          version: requestVersion,
        });

        if (!isCurrent) {
          return nextReports;
        }

        setReports(nextReports);

        setInitialError(null);

        setRefreshError(null);

        setIsInitialLoading(false);

        setIsRefreshing(false);

        return nextReports;
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          if (
            mountedRef.current &&
            requestId === listRequestVersionRef.current
          ) {
            setIsInitialLoading(false);

            setIsRefreshing(false);
          }

          return EMPTY_ARRAY;
        }

        const normalizedError = normalizeError(
          fetchError,
          "Gagal memuat daftar laporan.",
        );

        const isCurrent =
          mountedRef.current &&
          generation === generationRef.current &&
          mutationVersion === mutationVersionRef.current &&
          requestId === listRequestVersionRef.current &&
          identityRef.current === listCacheKey;

        if (isCurrent) {
          if (shouldShowInitialLoading) {
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
    [listCacheKey, reports.length, staleTime],
  );

  /* ==========================================================
   * GET DETAIL
   * ========================================================== */

  const getReport = useCallback(
    async (id) => {
      const normalizedId = normalizeId(id);

      if (normalizedId === null) {
        throw new Error("ID laporan wajib diisi.");
      }

      const detailCacheKey = getDetailCacheKey(normalizedId);

      if (detailCacheKey) {
        const cached = getCachedResource(detailCacheKey, DETAIL_STALE_TIME);

        if (cached !== null) {
          return cached;
        }

        const snapshot = getResourceSnapshot(detailCacheKey);

        /*
         * stale snapshot tetap bisa digunakan
         * hanya bila request baru nanti gagal
         * tidak secara otomatis menimpa caller.
         */
        if (snapshot?.data !== undefined) {
          /*
           * Jangan langsung return snapshot
           * karena detail membutuhkan data
           * terbaru bila cache sudah stale.
           */
        }
      }

      const generation = generationRef.current;

      const mutationVersion = mutationVersionRef.current;

      const requestVersion = detailCacheKey
        ? getResourceVersion(detailCacheKey)
        : null;

      try {
        const result = await createRequestDeduper({
          key: detailCacheKey ?? `report:detail:${normalizedId}`,

          request: () => reportService.getById(normalizedId),
        });

        const isCurrent =
          mountedRef.current &&
          generation === generationRef.current &&
          mutationVersion === mutationVersionRef.current;

        if (detailCacheKey && isCurrent) {
          setCachedResource(detailCacheKey, result, {
            version: requestVersion,
          });
        }

        return result;
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          return null;
        }

        throw normalizeError(fetchError, "Gagal memuat detail laporan.");
      }
    },
    [getDetailCacheKey],
  );

  /* ==========================================================
   * INVALIDATION
   * ========================================================== */

  const invalidateList = useCallback(() => {
    if (!listCacheKey) {
      return null;
    }

    return invalidateResource(listCacheKey);
  }, [listCacheKey]);

  const invalidateDetail = useCallback(
    (id) => {
      const key = getDetailCacheKey(id);

      if (!key) {
        return null;
      }

      return invalidateResource(key);
    },
    [getDetailCacheKey],
  );

  const beginMutation = useCallback(
    (id = null) => {
      generationRef.current += 1;

      mutationVersionRef.current += 1;

      invalidateList();

      if (isValidId(id)) {
        invalidateDetail(id);
      }
    },
    [invalidateDetail, invalidateList],
  );

  /* ==========================================================
   * CREATE
   * ========================================================== */

  const createReport = useCallback(
    (payload) => {
      if (createPromiseRef.current) {
        return createPromiseRef.current;
      }

      beginMutation();

      const mutationGeneration = generationRef.current;

      if (mountedRef.current) {
        setIsCreating(true);
      }

      const promise = (async () => {
        try {
          const report = await reportService.create(payload);

          const isCurrent =
            mountedRef.current && mutationGeneration === generationRef.current;

          if (isCurrent) {
            setReports((current) => {
              const exists = current.some((item) =>
                sameId(item?.id, report?.id),
              );

              if (exists) {
                return current;
              }

              const next = [...current, report];

              if (listCacheKey) {
                setCachedResource(listCacheKey, next, {
                  version: getResourceVersion(listCacheKey),
                });
              }

              return next;
            });

            setInitialError(null);

            setRefreshError(null);
          }

          return report;
        } catch (mutationError) {
          const normalizedError = normalizeError(
            mutationError,
            "Gagal membuat laporan.",
          );

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
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
    [beginMutation, listCacheKey],
  );

  /* ==========================================================
   * UPDATE
   * ========================================================== */

  const updateReport = useCallback(
    (id, payload) => {
      const normalizedId = normalizeId(id);

      if (normalizedId === null) {
        return Promise.reject(new Error("ID laporan wajib diisi."));
      }

      const key = String(normalizedId);

      const existing = updatePromisesRef.current.get(key);

      if (existing) {
        return existing;
      }

      beginMutation(normalizedId);

      const mutationGeneration = generationRef.current;

      if (mountedRef.current) {
        setIsUpdating(true);
      }

      const promise = (async () => {
        try {
          const report = await reportService.update(normalizedId, payload);

          const isCurrent =
            mountedRef.current && mutationGeneration === generationRef.current;

          if (isCurrent) {
            setReports((current) => {
              const next = current.map((item) =>
                sameId(item?.id, normalizedId) ? report : item,
              );

              if (listCacheKey) {
                setCachedResource(listCacheKey, next, {
                  version: getResourceVersion(listCacheKey),
                });
              }

              return next;
            });

            setInitialError(null);

            setRefreshError(null);
          }

          invalidateDetail(normalizedId);

          return report;
        } catch (mutationError) {
          const normalizedError = normalizeError(
            mutationError,
            "Gagal memperbarui laporan.",
          );

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
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
    [beginMutation, invalidateDetail, listCacheKey],
  );

  /* ==========================================================
   * DELETE
   * ========================================================== */

  const deleteReport = useCallback(
    (id) => {
      const normalizedId = normalizeId(id);

      if (normalizedId === null) {
        return Promise.reject(new Error("ID laporan wajib diisi."));
      }

      const key = String(normalizedId);

      const existing = deletePromisesRef.current.get(key);

      if (existing) {
        return existing;
      }

      beginMutation(normalizedId);

      const mutationGeneration = generationRef.current;

      if (mountedRef.current) {
        setIsDeleting(true);
      }

      const promise = (async () => {
        try {
          await reportService.remove(normalizedId);

          const isCurrent =
            mountedRef.current && mutationGeneration === generationRef.current;

          if (isCurrent) {
            setReports((current) => {
              const next = current.filter(
                (item) => !sameId(item?.id, normalizedId),
              );

              if (listCacheKey) {
                setCachedResource(listCacheKey, next, {
                  version: getResourceVersion(listCacheKey),
                });
              }

              return next;
            });

            setInitialError(null);

            setRefreshError(null);
          }

          invalidateDetail(normalizedId);

          return true;
        } catch (mutationError) {
          const normalizedError = normalizeError(
            mutationError,
            "Gagal menghapus laporan.",
          );

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
            setInitialError(normalizedError);
          }

          throw normalizedError;
        } finally {
          if (deletePromisesRef.current.get(key) === promise) {
            deletePromisesRef.current.delete(key);
          }

          if (mountedRef.current && deletePromisesRef.current.size === 0) {
            setIsDeleting(false);
          }
        }
      })();

      deletePromisesRef.current.set(key, promise);

      return promise;
    },
    [beginMutation, invalidateDetail, listCacheKey],
  );

  /* ==========================================================
   * REFRESH
   * ========================================================== */

  const refresh = useCallback(() => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const promise = (async () => {
      try {
        if (mountedRef.current) {
          setRefreshError(null);

          setIsRefreshing(true);
        }

        return await fetchReports({
          force: true,
        });
      } finally {
        if (mountedRef.current) {
          setIsRefreshing(false);
        }

        if (refreshPromiseRef.current === promise) {
          refreshPromiseRef.current = null;
        }
      }
    })();

    refreshPromiseRef.current = promise;

    return promise;
  }, [fetchReports]);

  /* ==========================================================
   * AUTO FETCH
   * ========================================================== */

  useEffect(() => {
    if (!autoFetch || !listCacheKey) {
      if (mountedRef.current) {
        setIsInitialLoading(false);
      }

      return undefined;
    }

    let cancelled = false;

    const execute = async () => {
      if (cancelled) {
        return;
      }

      try {
        await fetchReports();
      } catch {
        /*
         * Error sudah disimpan di state.
         */
      }
    };

    void execute();

    return () => {
      cancelled = true;
    };
  }, [autoFetch, fetchReports, listCacheKey]);

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
    reports,

    data: reports,

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

    fetchReports,

    getReport,

    createReport,

    updateReport,

    deleteReport,

    refresh,
  };
};

useReports.displayName = "useReports";

export default useReports;
