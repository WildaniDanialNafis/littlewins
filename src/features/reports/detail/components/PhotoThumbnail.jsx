import { memo, useCallback, useEffect, useState } from "react";

import { cx } from "@/shared/utils";

/* ============================================================
 * PHOTO THUMBNAIL
 * ============================================================ */

const PhotoThumbnail = memo(
  ({ photo, index, subject = "belajar", onOpen, overlay = null }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      setHasError(false);
    }, [photo]);

    const handleError = useCallback(() => {
      setHasError(true);
    }, []);

    const handleOpen = useCallback(() => {
      onOpen?.(index);
    }, [index, onOpen]);

    const hasOverlay = Boolean(overlay);

    if (!photo) {
      return null;
    }

    return (
      <button
        type="button"
        className={cx(
          "group relative block w-full overflow-hidden rounded-xl",
          "bg-surface-muted",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-primary/30",
          "focus-visible:ring-offset-2",
          "focus-visible:ring-offset-background",
        )}
        onClick={handleOpen}
        aria-label={
          hasOverlay ? overlay.label : `Lihat foto ${index + 1} ${subject}`
        }
      >
        {!hasError ? (
          <img
            src={photo}
            alt={`${subject}, foto ${index + 1}`}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            className="aspect-square w-full object-cover"
            onError={handleError}
          />
        ) : (
          <span
            className="flex aspect-square w-full items-center justify-center px-3 text-center text-xs font-medium text-muted"
            aria-hidden="true"
          >
            Foto tidak dapat dimuat
          </span>
        )}

        {!hasOverlay && (
          <span
            className={cx(
              "pointer-events-none absolute inset-0 flex items-end",
              "bg-linear-to-t from-black/55 via-transparent to-transparent",
              "p-3 opacity-0",
              "transition-opacity",
              "duration-(--token-transition-base)",
              "group-hover:opacity-100",
              "group-focus-visible:opacity-100",
              "motion-reduce:transition-none",
            )}
            aria-hidden="true"
          >
            <span className="text-xs font-semibold text-white">Lihat</span>
          </span>
        )}

        {hasOverlay && (
          <span
            className={cx(
              "pointer-events-none absolute inset-0 z-10",
              "flex flex-col items-center justify-center",
              "rounded-xl",
              "bg-black/65 text-white",
              "transition-colors duration-(--token-transition-fast)",
              "group-hover:bg-black/75",
              "group-focus-visible:bg-black/75",
              "motion-reduce:transition-none",
            )}
            aria-hidden="true"
          >
            <span className="text-3xl font-bold leading-none sm:text-4xl">
              +{overlay.count}
            </span>

            <span className="mt-1.5 text-xs font-medium text-white">
              Foto lagi
            </span>
          </span>
        )}
      </button>
    );
  },
);

PhotoThumbnail.displayName = "PhotoThumbnail";

export default PhotoThumbnail;
