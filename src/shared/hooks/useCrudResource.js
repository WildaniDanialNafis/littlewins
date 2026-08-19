import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  messages,
  initialData,
  autoFetch = true,
  staleTime = 30_000,
}) => {
  const { user } = useAuth();

  /*
   * IMPORTANT:
   * Jangan menggunakan default parameter []
   * karena itu membuat array baru setiap render.
   */
  const normalizedInitialData = Array.isArray(initialData)
    ? initialData
    : EMPTY_ARRAY;

  const userScope = getUserScope(user);

  const resourceName = service?.constructor?.name ?? "resource";

  const cacheKey = useMemo(() => {
    if (!userScope) {
      return null;
    }

    return getResourceKey({
      scope: `user:${userScope}`,
      resource: resourceName,
    });
  }, [resourceName, userScope]);

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

  const getInitialData = useCallback(() => {
    if (cachedData !== null) {
      return toArray(cachedData);
    }

    if (staleSnapshot?.data !== undefined) {
      return toArray(staleSnapshot.data);
    }

    return toArray(normalizedInitialData);
  }, [cachedData, normalizedInitialData, staleSnapshot]);

  const [data, setData] = useState(getInitialData);

  const [loading, setLoading] = useState(
    Boolean(autoFetch && cachedData === null),
  );

  const [error, setError] = useState(null);

  const mountedRef = useRef(false);

  const requestVersionRef = useRef(0);

  const mutationVersionRef = useRef(0);

  const controllerRef = useRef(null);

  const createPromiseRef = useRef(null);

  const updatePromisesRef = useRef(new Map());

  const removePromisesRef = useRef(new Map());

  /* ==========================================================
   * LIFECYCLE
   * ========================================================== */

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

  /* ==========================================================
   * INITIAL/CACHE SYNC
   *
   * IMPORTANT:
   * initialData sengaja TIDAK ada di
   * dependency effect.
   *
   * initialData adalah initial state,
   * bukan external reactive source.
   *
   * Ini mencegah:
   *
   * render
   *   ↓
   * [] baru
   *   ↓
   * effect
   *   ↓
   * setData
   *   ↓
   * render
   *   ↓
   * LOOP
   * ========================================================== */

  useEffect(() => {
    if (cachedData !== null) {
      const nextData = toArray(cachedData);

      setData(nextData);

      if (!autoFetch) {
        setLoading(false);
      }

      setError(null);

      return;
    }

    if (staleSnapshot?.data !== undefined) {
      const nextData = toArray(staleSnapshot.data);

      setData(nextData);

      if (!autoFetch) {
        setLoading(false);
      }

      setError(null);

      return;
    }

    if (!autoFetch) {
      setLoading(false);
    }
  }, [autoFetch, cachedData, staleSnapshot]);

  /* ==========================================================
   * INVALIDATION
   * ========================================================== */

  const invalidate = useCallback(() => {
    mutationVersionRef.current += 1;

    requestVersionRef.current += 1;

    controllerRef.current?.abort();

    controllerRef.current = null;

    if (cacheKey) {
      invalidateResource(cacheKey);
    }
  }, [cacheKey]);

  /* ==========================================================
   * FETCH
   * ========================================================== */

  const fetchAll = useCallback(
    async ({ force = false } = {}) => {
      const requestVersion = ++requestVersionRef.current;

      const mutationVersion = mutationVersionRef.current;

      if (!force && cacheKey) {
        const cached = getCachedResource(cacheKey, staleTime);

        if (cached !== null) {
          const nextData = toArray(cached);

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

        const snapshot = getResourceSnapshot(cacheKey);

        if (snapshot?.data !== undefined && mountedRef.current) {
          setData(toArray(snapshot.data));
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
        const result = await service.getAll({
          signal: controller.signal,
        });

        const nextData = toArray(result);

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
          return [];
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
    [cacheKey, messages.fetch, service, staleTime],
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

      if (mountedRef.current) {
        setError(null);
      }

      const promise = (async () => {
        try {
          const item = await service.create(payload);

          if (mountedRef.current && item !== null && item !== undefined) {
            setData((current) => {
              const nextData = [...current, item];

              if (cacheKey) {
                setCachedResource(cacheKey, nextData);
              }

              return nextData;
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
    [cacheKey, invalidate, messages.create, service],
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

      if (mountedRef.current) {
        setError(null);
      }

      const promise = (async () => {
        try {
          const item = await service.update(id, payload);

          if (mountedRef.current && item !== null && item !== undefined) {
            setData((current) => {
              const nextData = current.map((currentItem) =>
                sameId(currentItem?.id, id) ? item : currentItem,
              );

              if (cacheKey) {
                setCachedResource(cacheKey, nextData);
              }

              return nextData;
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
    [cacheKey, invalidate, messages.update, service],
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

      if (mountedRef.current) {
        setError(null);
      }

      const promise = (async () => {
        try {
          await service.remove(id);

          if (mountedRef.current) {
            setData((current) => {
              const nextData = current.filter((item) => !sameId(item?.id, id));

              if (cacheKey) {
                setCachedResource(cacheKey, nextData);
              }

              return nextData;
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
    [cacheKey, invalidate, messages.delete, service],
  );

  /* ==========================================================
   * AUTO FETCH
   * ========================================================== */

  useEffect(() => {
    if (!autoFetch) {
      setLoading(false);

      return undefined;
    }

    void fetchAll().catch(() => {});

    return undefined;
  }, [autoFetch, fetchAll]);

  const refresh = useCallback(
    () =>
      fetchAll({
        force: true,
      }),
    [fetchAll],
  );

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
