import { memo, useCallback, useEffect, useState } from "react";

import { cx } from "@/shared/utils";

const PhotoThumbnail = memo(({ photo, index, subject = "belajar", onOpen }) => {
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

  if (hasError) {
    return (
      <div
        className={cx(
          "flex aspect-4/3 w-full items-center justify-center",
          "rounded-xl border border-border bg-surface-muted",
          "text-sm text-muted",
        )}
        role="img"
        aria-label={`Dokumentasi ${index + 1} gagal dimuat`}
      >
        Gagal memuat foto
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={cx(
        "group relative aspect-4/3 w-full overflow-hidden rounded-xl",
        "bg-surface-muted ring-1 ring-border",
        "transition-[box-shadow,transform] duration-(--token-transition-base)",
        "hover:ring-2 hover:ring-primary/50",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-primary/50",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-reduce:transition-none",
      )}
      aria-label={`Lihat dokumentasi ${index + 1}`}
    >
      <img
        src={photo}
        alt={`Dokumentasi kegiatan ${subject} ${index + 1}`}
        className={cx(
          "h-full w-full object-cover",
          "transition-transform duration-(--token-transition-base)",
          "group-hover:scale-105",
          "motion-reduce:transform-none",
        )}
        loading="lazy"
        decoding="async"
        onError={handleError}
      />

      <span
        className={cx(
          "absolute inset-0 flex items-end",
          "bg-linear-to-t from-black/60 via-transparent to-transparent",
          "p-3 opacity-0",
          "transition-opacity duration-(--token-transition-base)",
          "group-hover:opacity-100 group-focus-visible:opacity-100",
          "motion-reduce:transition-none",
        )}
        aria-hidden="true"
      >
        <span className="text-xs font-medium text-white">Lihat foto</span>
      </span>
    </button>
  );
});

PhotoThumbnail.displayName = "PhotoThumbnail";

export default PhotoThumbnail;
