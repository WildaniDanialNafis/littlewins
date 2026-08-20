import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

const useLightbox = (photos = []) => {
  const safePhotos = Array.isArray(photos) ? photos : [];

  const total = safePhotos.length;

  const [selectedIndex, setSelectedIndex] = useState(null);

  const previousActiveElementRef = useRef(null);

  /*
   * Jangan melakukan setState di effect hanya untuk
   * mengoreksi index yang sudah tidak valid.
   *
   * Invalid index cukup dipresentasikan sebagai null.
   */
  const visibleIndex = useMemo(() => {
    if (selectedIndex === null || total <= 0) {
      return null;
    }

    return selectedIndex >= 0 && selectedIndex < total ? selectedIndex : null;
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

      activeElement?.focus?.();
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

  useEffect(() => {
    if (visibleIndex === null || typeof document === "undefined") {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.defaultPrevented) {
        return;
      }

      switch (event.key) {
        case "Escape":
          event.preventDefault();

          close();

          break;

        case "ArrowLeft":
          event.preventDefault();

          goPrev();

          break;

        case "ArrowRight":
          event.preventDefault();

          goNext();

          break;

        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, goNext, goPrev, visibleIndex]);

  return {
    selectedIndex: visibleIndex,

    open,

    close,

    goPrev,

    goNext,
  };
};

useLightbox.displayName = "useLightbox";

export default useLightbox;
