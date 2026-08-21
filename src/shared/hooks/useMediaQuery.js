import { useCallback, useSyncExternalStore } from "react";

/* ============================================================
 * HELPERS
 * ============================================================ */

const getMatchMedia = (query) => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function" ||
    typeof query !== "string" ||
    !query.trim()
  ) {
    return null;
  }

  return window.matchMedia(query);
};

/* ============================================================
 * HOOK
 * ============================================================ */

const useMediaQuery = (query) => {
  const subscribe = useCallback(
    (onStoreChange) => {
      const mediaQuery = getMatchMedia(query);

      if (!mediaQuery) {
        return () => {};
      }

      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", onStoreChange);

        return () => {
          mediaQuery.removeEventListener("change", onStoreChange);
        };
      }

      if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(onStoreChange);

        return () => {
          mediaQuery.removeListener("change", onStoreChange);
        };
      }

      return () => {};
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    const mediaQuery = getMatchMedia(query);

    return Boolean(mediaQuery?.matches);
  }, [query]);

  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

useMediaQuery.displayName = "useMediaQuery";

export default useMediaQuery;
