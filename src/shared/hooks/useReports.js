import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { reportService } from "@/services/api";

import {
  getCachedResource,
  getResourceKey,
  getResourceSnapshot,
  invalidateResource,
  setCachedResource,
} from "@/shared/cache";

import { useAuth } from "./useAuth";

const EMPTY_ARRAY = Object.freeze([]);

/* ============================================================
 * HELPERS
 * ============================================================ */

const normalizeError = (error, fallbackMessage) => {
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
  const { autoFetch = true, initialData, staleTime = 30_000 } = options;

  const normalizedInitialData = Array.isArray(initialData)
    ? initialData
    : EMPTY_ARRAY;

  const { user } = useAuth();

  const userScope = getUserScope(user);

  const listCacheKey = useMemo(() => {
    if (!userScope) {
      return null;
    }

    return getResourceKey({
      scope: `user:${userScope}`,
      resource: "reports:list",
    });
  }, [userScope]);

  const [reports, setReports] = useState(() => {
    if (listCacheKey) {
      const cached = getCachedResource(listCacheKey, staleTime);

      if (cached !== null) {
        return toArray(cached);
      }

      const snapshot = getResourceSnapshot(listCacheKey);

      if (snapshot?.data !== undefined) {
        return toArray(snapshot.data);
      }
    }

    return normalizedInitialData;
  });

  const [loading, setLoading] = useState(
    Boolean(
      autoFetch &&
      listCacheKey &&
      getCachedResource(listCacheKey, staleTime) === null,
    ),
  );

  const [error, setError] = useState(null);

  const mountedRef = useRef(false);

  const listControllerRef = useRef(null);

  const detailControllerRef = useRef(null);

  const listRequestIdRef = useRef(0);

  const detailRequestIdRef = useRef(0);

  const mutationVersionRef = useRef(0);

  const createPromiseRef = useRef(null);

  const updatePromisesRef = useRef(new Map());

  const deletePromisesRef = useRef(new Map());

  /* ==========================================================
   * LIFECYCLE
   * ========================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      listRequestIdRef.current += 1;

      detailRequestIdRef.current += 1;

      mutationVersionRef.current += 1;

      listControllerRef.current?.abort();
      detailControllerRef.current?.abort();

      listControllerRef.current = null;

      detailControllerRef.current = null;

      createPromiseRef.current = null;

      updatePromisesRef.current.clear();
      deletePromisesRef.current.clear();
    };
  }, []);

  /* ==========================================================
   * USER / CACHE CHANGE
   *
   * initialData intentionally omitted.
   * It is an initial value, not a live
   * synchronization source.
   * ========================================================== */

  useEffect(() => {
    if (!listCacheKey) {
      if (!autoFetch) {
        setLoading(false);
      }

      return;
    }

    const cached = getCachedResource(listCacheKey, staleTime);

    if (cached !== null) {
      setReports(toArray(cached));

      setError(null);

      if (!autoFetch) {
        setLoading(false);
      }

      return;
    }

    const snapshot = getResourceSnapshot(listCacheKey);

    if (snapshot?.data !== undefined) {
      setReports(toArray(snapshot.data));
    }

    if (!autoFetch) {
      setLoading(false);
    }

    setError(null);
  }, [autoFetch, listCacheKey, staleTime]);

  /* ==========================================================
   * INVALIDATE
   * ========================================================== */

  const beginMutation = useCallback(
    (id = null) => {
      mutationVersionRef.current += 1;

      listRequestIdRef.current += 1;

      detailRequestIdRef.current += 1;

      listControllerRef.current?.abort();
      detailControllerRef.current?.abort();

      listControllerRef.current = null;

      detailControllerRef.current = null;

      if (listCacheKey) {
        invalidateResource(listCacheKey);
      }

      if (isValidId(id) && userScope) {
        invalidateResource(
          getResourceKey({
            scope: `user:${userScope}`,

            resource: `reports:${String(id)}`,
          }),
        );
      }
    },
    [listCacheKey, userScope],
  );

  /* ==========================================================
   * FETCH LIST
   * ========================================================== */

  const fetchReports = useCallback(
    async ({ force = false } = {}) => {
      const requestId = ++listRequestIdRef.current;

      const mutationVersion = mutationVersionRef.current;

      if (!force && listCacheKey) {
        const cached = getCachedResource(listCacheKey, staleTime);

        if (cached !== null) {
          const nextReports = toArray(cached);

          if (
            mountedRef.current &&
            requestId === listRequestIdRef.current &&
            mutationVersion === mutationVersionRef.current
          ) {
            setReports(nextReports);

            setError(null);
            setLoading(false);
          }

          return nextReports;
        }
      }

      listControllerRef.current?.abort();

      const controller = new AbortController();

      listControllerRef.current = controller;

      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        const result = await reportService.getAll({
          signal: controller.signal,
        });

        const nextReports = toArray(result);

        const current =
          mountedRef.current &&
          requestId === listRequestIdRef.current &&
          mutationVersion === mutationVersionRef.current;

        if (!current) {
          return nextReports;
        }

        setReports(nextReports);

        if (listCacheKey) {
          setCachedResource(listCacheKey, nextReports);
        }

        setLoading(false);

        return nextReports;
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          return EMPTY_ARRAY;
        }

        const normalizedError = normalizeError(
          fetchError,
          "Gagal memuat laporan.",
        );

        if (
          mountedRef.current &&
          requestId === listRequestIdRef.current &&
          mutationVersion === mutationVersionRef.current
        ) {
          setError(normalizedError);

          setLoading(false);
        }

        throw normalizedError;
      } finally {
        if (listControllerRef.current === controller) {
          listControllerRef.current = null;
        }
      }
    },
    [listCacheKey, staleTime],
  );

  /* ==========================================================
   * FETCH DETAIL
   * ========================================================== */

  const getReport = useCallback(
    async (id) => {
      if (!isValidId(id)) {
        throw new Error("Report ID wajib diisi.");
      }

      const normalizedId = normalizeId(id);

      const detailCacheKey = userScope
        ? getResourceKey({
            scope: `user:${userScope}`,

            resource: `reports:${normalizedId}`,
          })
        : null;

      if (detailCacheKey) {
        const cached = getCachedResource(detailCacheKey, staleTime);

        if (cached !== null) {
          return cached;
        }
      }

      const requestId = ++detailRequestIdRef.current;

      detailControllerRef.current?.abort();

      const controller = new AbortController();

      detailControllerRef.current = controller;

      try {
        const result = await reportService.getById(normalizedId, {
          signal: controller.signal,
        });

        const current =
          mountedRef.current && requestId === detailRequestIdRef.current;

        if (!current) {
          return result;
        }

        if (detailCacheKey && result !== null && result !== undefined) {
          setCachedResource(detailCacheKey, result);
        }

        return result;
      } catch (detailError) {
        if (isAbortError(detailError)) {
          return null;
        }

        throw normalizeError(detailError, "Gagal memuat laporan.");
      } finally {
        if (detailControllerRef.current === controller) {
          detailControllerRef.current = null;
        }
      }
    },
    [staleTime, userScope],
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

      const promise = (async () => {
        try {
          const report = await reportService.create(payload);

          mutationVersionRef.current += 1;

          if (mountedRef.current && report !== null && report !== undefined) {
            setReports((current) => {
              const nextReports = [...current, report];

              if (listCacheKey) {
                setCachedResource(listCacheKey, nextReports);
              }

              return nextReports;
            });
          }

          return report;
        } catch (mutationError) {
          mutationVersionRef.current += 1;

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
   * UPDATE
   * ========================================================== */

  const updateReport = useCallback(
    (id, payload) => {
      const key = String(id);

      const existing = updatePromisesRef.current.get(key);

      if (existing) {
        return existing;
      }

      beginMutation(id);

      const promise = (async () => {
        try {
          const report = await reportService.update(id, payload);

          mutationVersionRef.current += 1;

          if (mountedRef.current && report !== null && report !== undefined) {
            setReports((current) => {
              const nextReports = current.map((item) =>
                sameId(item?.id, id) ? report : item,
              );

              if (listCacheKey) {
                setCachedResource(listCacheKey, nextReports);
              }

              return nextReports;
            });
          }

          if (userScope) {
            setCachedResource(
              getResourceKey({
                scope: `user:${userScope}`,

                resource: `reports:${String(id)}`,
              }),
              report,
            );
          }

          return report;
        } catch (mutationError) {
          mutationVersionRef.current += 1;

          const normalizedError = normalizeError(
            mutationError,
            "Gagal memperbarui laporan.",
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
    [beginMutation, listCacheKey, userScope],
  );

  /* ==========================================================
   * DELETE
   * ========================================================== */

  const deleteReport = useCallback(
    (id) => {
      const key = String(id);

      const existing = deletePromisesRef.current.get(key);

      if (existing) {
        return existing;
      }

      beginMutation(id);

      const promise = (async () => {
        try {
          await reportService.remove(id);

          mutationVersionRef.current += 1;

          if (mountedRef.current) {
            setReports((current) => {
              const nextReports = current.filter(
                (item) => !sameId(item?.id, id),
              );

              if (listCacheKey) {
                setCachedResource(listCacheKey, nextReports);
              }

              return nextReports;
            });
          }

          if (userScope) {
            invalidateResource(
              getResourceKey({
                scope: `user:${userScope}`,

                resource: `reports:${String(id)}`,
              }),
            );
          }

          return true;
        } catch (mutationError) {
          mutationVersionRef.current += 1;

          const normalizedError = normalizeError(
            mutationError,
            "Gagal menghapus laporan.",
          );

          if (mountedRef.current) {
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
    [beginMutation, listCacheKey, userScope],
  );

  /* ==========================================================
   * AUTO FETCH
   * ========================================================== */

  useEffect(() => {
    if (!autoFetch) {
      setLoading(false);

      return undefined;
    }

    void fetchReports().catch(() => {});

    return undefined;
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
