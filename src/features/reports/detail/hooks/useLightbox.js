import { useCallback, useEffect, useState } from "react";

const useLightbox = (photos = []) => {
  const safePhotos = Array.isArray(photos) ? photos : [];

  const total = safePhotos.length;

  const [selectedIndex, setSelectedIndex] = useState(null);

  const open = useCallback(
    (index) => {
      if (index < 0 || index >= total) {
        return;
      }

      setSelectedIndex(index);
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
    if (selectedIndex === null) {
      return;
    }

    if (total === 0 || selectedIndex >= total) {
      setSelectedIndex(null);
    }
  }, [selectedIndex, total]);

  useEffect(() => {
    if (selectedIndex === null) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "Escape":
          close();
          break;

        case "ArrowLeft":
          goPrev();
          break;

        case "ArrowRight":
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
  }, [selectedIndex, close, goPrev, goNext]);

  return {
    selectedIndex,
    open,
    close,
    goPrev,
    goNext,
  };
};

useLightbox.displayName = "useLightbox";

export default useLightbox;
