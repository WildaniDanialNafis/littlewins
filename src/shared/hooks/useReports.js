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

const sameId = (firstId, secondId) => {
  return String(firstId) === String(secondId);
};

const normalizeId = (id) => {
  if (id === null || id === undefined || id === "") {
    return null;
  }

  return String(id);
};

const isValidId = (id) => {
  return id !== null && id !== undefined && id !== "";
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
   * STATE
   * ========================================================== */

  // Track whether we've ever started loading to prevent flash
  const hasStartedLoadingRef = useRef(false);

  const [reports, setReports] = useState(() => {
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
  });

  const [loading, setLoading] = useState(() => {
    // Only start with loading=true if we have a valid cacheKey AND no fresh cache
    if (!autoFetch || !listCacheKey) {
      return false;
    }

    const cached = getCachedResource(listCacheKey, staleTime);
    if (cached !== null) {
      return false;
    }

    return true;
  });

  const [error, setError] = useState(null);

  /* ==========================================================
   * REFS
   * ========================================================== */

  const mountedRef = useRef(false);

  const generationRef = useRef(0);

  const mutationVersionRef = useRef(0);

  const createPromiseRef = useRef(null);

  const updatePromisesRef = useRef(new Map());

  const deletePromisesRef = useRef(new Map());

  const listIdentityRef = useRef(listCacheKey);

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

      createPromiseRef.current = null;

      updatePromises.clear();

      deletePromises.clear();
    };
  }, []);

  /* ==========================================================
   * IDENTITY CHANGE
   * ========================================================== */

  useEffect(() => {
    if (listIdentityRef.current === listCacheKey) {
      return;
    }

    listIdentityRef.current = listCacheKey;

    generationRef.current += 1;

    mutationVersionRef.current += 1;

    setError(null);
  }, [listCacheKey]);
  /* ==========================================================
   * FETCH LIST
   * ========================================================== */

  const fetchReports = useCallback(
    async ({ force = false } = {}) => {
      if (!listCacheKey) {
        if (mountedRef.current) {
          setReports(EMPTY_ARRAY);

          // Don't set loading to false if we haven't started loading yet
          // This prevents flash when cacheKey is null due to auth not ready
          if (hasStartedLoadingRef.current) {
            setLoading(false);
          }
        }

        return EMPTY_ARRAY;
      }

      if (!force) {
        const cached = getCachedResource(listCacheKey, staleTime);

        if (cached !== null) {
          const nextReports = toArray(cached);

          if (mountedRef.current) {
            setReports(nextReports);

            setError(null);

            setLoading(false);
          }

          return nextReports;
        }
      }

      if (force) {
        invalidateResource(listCacheKey);
      }

      const generation = generationRef.current;

      const mutationVersion = mutationVersionRef.current;

      const requestVersion = getResourceVersion(listCacheKey);

      if (mountedRef.current) {
        hasStartedLoadingRef.current = true;

        setLoading(true);

        setError(null);
      }

      try {
        const result = await createRequestDeduper({
          key: listCacheKey,

          request: () => reportService.getAll(),
        });

        const nextReports = toArray(result);

        setCachedResource(listCacheKey, nextReports, {
          version: requestVersion,
        });

        const isCurrent =
          mountedRef.current &&
          generation === generationRef.current &&
          mutationVersion === mutationVersionRef.current;

        if (!isCurrent) {
          return nextReports;
        }

        setReports(nextReports);

        setError(null);

        setLoading(false);

        return nextReports;
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          if (mountedRef.current) {
            setLoading(false);
          }

          return EMPTY_ARRAY;
        }

        const normalizedError = normalizeError(
          fetchError,
          "Gagal memuat daftar laporan.",
        );

        if (mountedRef.current && generation === generationRef.current) {
          setError(normalizedError);

          setLoading(false);
        }

        throw normalizedError;
      }
    },
    [listCacheKey, staleTime],
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
   * MUTATION HELPERS
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
   * CREATE REPORT
   * ========================================================== */

  const createReport = useCallback(
    (payload) => {
      if (createPromiseRef.current) {
        return createPromiseRef.current;
      }

      beginMutation();

      const mutationGeneration = generationRef.current;

      const promise = (async () => {
        try {
          const report = await reportService.create(payload);

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
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

            setError(null);
          }

          return report;
        } catch (mutationError) {
          const normalizedError = normalizeError(
            mutationError,
            "Gagal membuat laporan.",
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
    [beginMutation, listCacheKey],
  );

  /* ==========================================================
   * UPDATE REPORT
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

      const promise = (async () => {
        try {
          const report = await reportService.update(normalizedId, payload);

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
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

            setError(null);
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
    [beginMutation, invalidateDetail, listCacheKey],
  );

  /* ==========================================================
   * DELETE REPORT
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

      const promise = (async () => {
        try {
          await reportService.remove(normalizedId);

          if (
            mountedRef.current &&
            mutationGeneration === generationRef.current
          ) {
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

            setError(null);
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
            setError(normalizedError);
          }

          throw normalizedError;
        } finally {
          if (deletePromisesRef.current.get(key) === promise) {
            deletePromisesRef.current.delete(key);
          }
        }
      })();

      deletePromisesRef.current.set(key, promise);

      return promise;
    },
    [beginMutation, invalidateDetail, listCacheKey],
  );
  /* ==========================================================
   * AUTO FETCH
   * ========================================================== */

  useEffect(() => {
    if (!autoFetch) {
      return undefined;
    }

    let cancelled = false;

    const timer = setTimeout(() => {
      if (cancelled) {
        return;
      }

      void fetchReports().catch(() => {});
    }, 0);

    return () => {
      cancelled = true;

      clearTimeout(timer);
    };
  }, [autoFetch, fetchReports]);

  /* ==========================================================
   * REFRESH
   * ========================================================== */

  const refresh = useCallback(
    () =>
      fetchReports({
        force: true,
      }),
    [fetchReports],
  );

  /* ==========================================================
   * RETURN
   * ========================================================== */

  return {
    reports,

    loading,

    error,

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
