import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const EMPTY_ARRAY = Object.freeze([]);

const normalizeIndex = (index, total) => {
  const numericIndex = Number(index);

  if (!Number.isInteger(numericIndex)) {
    return null;
  }

  if (numericIndex < 0 || numericIndex >= total) {
    return null;
  }

  return numericIndex;
};

const useLightbox = (photos = EMPTY_ARRAY) => {
  const safePhotos = Array.isArray(photos) ? photos : EMPTY_ARRAY;

  const total = safePhotos.length;

  const [selectedIndex, setSelectedIndex] = useState(null);

  const previousActiveElementRef = useRef(null);

  const visibleIndex = useMemo(() => {
    if (selectedIndex === null || total === 0) {
      return null;
    }

    return normalizeIndex(selectedIndex, total);
  }, [selectedIndex, total]);

  useEffect(() => {
    if (visibleIndex === null || typeof document === "undefined") {
      return undefined;
    }

    previousActiveElementRef.current = document.activeElement;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;

      const activeElement = previousActiveElementRef.current;

      previousActiveElementRef.current = null;

      if (activeElement && typeof activeElement.focus === "function") {
        try {
          activeElement.focus();
        } catch {
          // noop
        }
      }
    };
  }, [visibleIndex]);

  const open = useCallback(
    (index) => {
      const normalizedIndex = normalizeIndex(index, total);

      if (normalizedIndex === null) {
        return;
      }

      setSelectedIndex(normalizedIndex);
    },
    [total],
  );

  const close = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const goPrev = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null || total < 2) {
        return current;
      }

      return current === 0 ? total - 1 : current - 1;
    });
  }, [total]);

  const goNext = useCallback(() => {
    setSelectedIndex((current) => {
      if (current === null || total < 2) {
        return current;
      }

      return current === total - 1 ? 0 : current + 1;
    });
  }, [total]);

  return {
    selectedIndex: visibleIndex,

    isOpen: visibleIndex !== null,

    total,

    open,

    close,

    goPrev,

    goNext,
  };
};

useLightbox.displayName = "useLightbox";

export default useLightbox;
