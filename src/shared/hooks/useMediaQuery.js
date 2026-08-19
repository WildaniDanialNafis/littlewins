import { useEffect, useState } from "react";

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
  const [matches, setMatches] = useState(() => {
    const mediaQuery = getMatchMedia(query);

    return Boolean(mediaQuery?.matches);
  });

  useEffect(() => {
    const mediaQuery = getMatchMedia(query);

    if (!mediaQuery) {
      return undefined;
    }

    const handleChange = (event) => {
      const nextValue = Boolean(event.matches);

      setMatches((current) => (current === nextValue ? current : nextValue));
    };

    /*
     * Sinkronisasi hanya jika
     * nilai memang berbeda.
     */
    const currentValue = Boolean(mediaQuery.matches);

    setMatches((current) =>
      current === currentValue ? current : currentValue,
    );

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

    return undefined;
  }, [query]);

  return matches;
};

useMediaQuery.displayName = "useMediaQuery";

export default useMediaQuery;
