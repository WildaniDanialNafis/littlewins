import { useCallback, useSyncExternalStore } from "react";

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

export const useMediaQuery = (query) => {
  const subscribe = useCallback(
    (onStoreChange) => {
      const mediaQuery = getMatchMedia(query);

      if (!mediaQuery) {
        return () => {};
      }

      const handleChange = () => {
        onStoreChange();
      };

      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", handleChange);

        return () => {
          mediaQuery.removeEventListener("change", handleChange);
        };
      }

      if (typeof mediaQuery.addListener === "function") {
        mediaQuery.addListener(handleChange);

        return () => {
          mediaQuery.removeListener(handleChange);
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
