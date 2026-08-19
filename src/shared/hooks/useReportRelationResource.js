import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  getCachedResource,
  getResourceKey,
  getResourceSnapshot,
  invalidateResource,
  setCachedResource,
} from "@/shared/cache";

import useAuth from "./useAuth";

const EMPTY_ARRAY = Object.freeze([]);

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
  methods,
  messages,
  initialData,
  autoFetch = true,
  sortData,
  staleTime = 30_000,
}) => {
  const { user } = useAuth();

  const userScope = getUserScope(user);

  const normalizedInitialData = Array.isArray(initialData)
    ? initialData
    : EMPTY_ARRAY;

  const normalizedReportId =
    reportId !== null && reportId !== undefined && reportId !== ""
      ? String(reportId)
      : null;

  const hasReportId = normalizedReportId !== null;

  const cacheKey = useMemo(() => {
    if (!userScope || !normalizedReportId) {
      return null;
    }

    return getResourceKey({
      scope: `user:${userScope}`,
      resource: `report:${normalizedReportId}:relation`,
    });
  }, [userScope, normalizedReportId]);

  const applySort = useCallback(
    (value) => {
      const normalized = toArray(value);

      if (typeof sortData !== "function") {
        return normalized;
      }

      return sortData(normalized);
    },
    [sortData],
  );

  const [data, setData] = useState(() => applySort(normalizedInitialData));

  const [loading, setLoading] = useState(Boolean(autoFetch && hasReportId));

  const [error, setError] = useState(null);

  const mountedRef = useRef(false);

  const requestVersionRef = useRef(0);

  const mutationVersionRef = useRef(0);

  const controllerRef = useRef(null);

  const createPromiseRef = useRef(null);

  const updatePromisesRef = useRef(new Map());

  const removePromisesRef = useRef(new Map());

  /* ========================================================
   * LIFECYCLE
   * ======================================================== */

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      requestVersionRef.current += 1;

      mutationVersionRef.current += 1;

      controllerRef.current?.abort();

      controllerRef.current = null;

      createPromiseRef.current = null;

      updatePromisesRef.current.clear();

      removePromisesRef.current.clear();
    };
  }, []);

  /* ========================================================
   * REPORT / CACHE CHANGE
   *
   * IMPORTANT:
   * initialData TIDAK menjadi dependency.
   * ======================================================== */

  const cachedData = useMemo(() => {
    if (!cacheKey) {
      return null;
    }

    return getCachedResource(cacheKey, staleTime);
  }, [cacheKey, staleTime]);

  const staleSnapshot = useMemo(() => {
    if (!cacheKey) {
      return null;
    }

    return getResourceSnapshot(cacheKey);
  }, [cacheKey]);

  useEffect(() => {
    if (!hasReportId) {
      setData(EMPTY_ARRAY);

      setError(null);
      setLoading(false);

      return;
    }

    if (cachedData !== null) {
      setData(applySort(cachedData));

      setError(null);

      if (!autoFetch) {
        setLoading(false);
      }

      return;
    }

    if (staleSnapshot?.data !== undefined) {
      setData(applySort(staleSnapshot.data));

      setError(null);

      if (!autoFetch) {
        setLoading(false);
      }

      return;
    }

    /*
     * Jangan setData(initialData)
     * di sini setiap render.
     *
     * Initial state sudah diambil
     * pada useState().
     */
    if (!autoFetch) {
      setLoading(false);
    }

    setError(null);
  }, [applySort, autoFetch, cachedData, hasReportId, staleSnapshot]);

  /* ========================================================
   * INVALIDATE
   * ======================================================== */

  const invalidate = useCallback(() => {
    requestVersionRef.current += 1;

    mutationVersionRef.current += 1;

    controllerRef.current?.abort();

    controllerRef.current = null;

    if (cacheKey) {
      invalidateResource(cacheKey);
    }
  }, [cacheKey]);

  /* ========================================================
   * FETCH
   * ======================================================== */

  const fetchItems = useCallback(
    async ({ force = false } = {}) => {
      if (!hasReportId) {
        if (mountedRef.current) {
          setData(EMPTY_ARRAY);

          setLoading(false);

          setError(new Error("Report ID wajib diisi."));
        }

        return EMPTY_ARRAY;
      }

      const requestVersion = ++requestVersionRef.current;

      const mutationVersion = mutationVersionRef.current;

      if (!force && cacheKey) {
        const freshData = getCachedResource(cacheKey, staleTime);

        if (freshData !== null) {
          const nextData = applySort(freshData);

          if (
            mountedRef.current &&
            requestVersion === requestVersionRef.current &&
            mutationVersion === mutationVersionRef.current
          ) {
            setData(nextData);

            setError(null);
            setLoading(false);
          }

          return nextData;
        }
      }

      controllerRef.current?.abort();

      const controller = new AbortController();

      controllerRef.current = controller;

      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        const result = await methods.getAll(normalizedReportId, {
          signal: controller.signal,
        });

        const nextData = applySort(result);

        const isCurrent =
          mountedRef.current &&
          requestVersion === requestVersionRef.current &&
          mutationVersion === mutationVersionRef.current;

        if (!isCurrent) {
          return nextData;
        }

        setData(nextData);

        if (cacheKey) {
          setCachedResource(cacheKey, nextData);
        }

        setError(null);

        return nextData;
      } catch (fetchError) {
        if (isAbortError(fetchError)) {
          return EMPTY_ARRAY;
        }

        const normalizedError = toError(fetchError, messages.fetch);

        if (
          mountedRef.current &&
          requestVersion === requestVersionRef.current &&
          mutationVersion === mutationVersionRef.current
        ) {
          setError(normalizedError);
        }

        throw normalizedError;
      } finally {
        if (
          mountedRef.current &&
          requestVersion === requestVersionRef.current &&
          mutationVersion === mutationVersionRef.current
        ) {
          setLoading(false);
        }

        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
      }
    },
    [
      applySort,
      cacheKey,
      hasReportId,
      messages.fetch,
      methods,
      normalizedReportId,
      staleTime,
    ],
  );

  /* ========================================================
   * CREATE
   * ======================================================== */

  const create = useCallback(
    (payload) => {
      if (!hasReportId) {
        return Promise.reject(new Error("Report ID wajib diisi."));
      }

      if (createPromiseRef.current) {
        return createPromiseRef.current;
      }

      invalidate();

      if (mountedRef.current) {
        setError(null);
      }

      const promise = (async () => {
        try {
          const item = await methods.create(normalizedReportId, payload);

          if (mountedRef.current && item !== null && item !== undefined) {
            setData((current) => {
              const next = applySort([...current, item]);

              if (cacheKey) {
                setCachedResource(cacheKey, next);
              }

              return next;
            });
          }

          mutationVersionRef.current += 1;

          return item;
        } catch (mutationError) {
          mutationVersionRef.current += 1;

          const normalizedError = toError(mutationError, messages.create);

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
    [
      applySort,
      cacheKey,
      hasReportId,
      invalidate,
      messages.create,
      methods,
      normalizedReportId,
    ],
  );

  /* ========================================================
   * UPDATE
   * ======================================================== */

  const update = useCallback(
    (id, payload) => {
      if (!hasReportId) {
        return Promise.reject(new Error("Report ID wajib diisi."));
      }

      const key = String(id);

      const existing = updatePromisesRef.current.get(key);

      if (existing) {
        return existing;
      }

      invalidate();

      if (mountedRef.current) {
        setError(null);
      }

      const promise = (async () => {
        try {
          const item = await methods.update(normalizedReportId, id, payload);

          if (mountedRef.current && item !== null && item !== undefined) {
            setData((current) => {
              const next = applySort(
                current.map((currentItem) =>
                  sameId(currentItem?.id, id) ? item : currentItem,
                ),
              );

              if (cacheKey) {
                setCachedResource(cacheKey, next);
              }

              return next;
            });
          }

          mutationVersionRef.current += 1;

          return item;
        } catch (mutationError) {
          mutationVersionRef.current += 1;

          const normalizedError = toError(mutationError, messages.update);

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
    [
      applySort,
      cacheKey,
      hasReportId,
      invalidate,
      messages.update,
      methods,
      normalizedReportId,
    ],
  );

  /* ========================================================
   * REMOVE
   * ======================================================== */

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

      if (mountedRef.current) {
        setError(null);
      }

      const promise = (async () => {
        try {
          await methods.remove(normalizedReportId, id);

          if (mountedRef.current) {
            setData((current) => {
              const next = current.filter((item) => !sameId(item?.id, id));

              if (cacheKey) {
                setCachedResource(cacheKey, next);
              }

              return next;
            });
          }

          mutationVersionRef.current += 1;

          return true;
        } catch (mutationError) {
          mutationVersionRef.current += 1;

          const normalizedError = toError(mutationError, messages.delete);

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
    [
      cacheKey,
      hasReportId,
      invalidate,
      messages.delete,
      methods,
      normalizedReportId,
    ],
  );

  /* ========================================================
   * AUTO FETCH
   * ======================================================== */

  useEffect(() => {
    if (!autoFetch || !hasReportId) {
      if (mountedRef.current) {
        setLoading(false);
      }

      return undefined;
    }

    void fetchItems().catch(() => {});

    return undefined;
  }, [autoFetch, fetchItems, hasReportId]);

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
