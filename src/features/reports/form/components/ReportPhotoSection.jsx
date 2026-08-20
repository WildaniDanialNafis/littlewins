import { memo, useEffect, useMemo } from "react";

import { PhotoIcon } from "@/shared/icons";

/* ============================================================
 * REPORT PHOTO SECTION
 * ============================================================ */

const ReportPhotoSection = ({
  photos = [],
  existingPhotos = [],
  onAdd,
  onRemove,
  onRemoveExisting,
  disabled = false,
}) => {
  const { newPhotos, newPhotoPreviews, savedPhotos } = useMemo(() => {
    const normalizedPhotos = Array.isArray(photos)
      ? photos.filter((photo) => photo instanceof File)
      : [];

    const previews = normalizedPhotos.map((file) => URL.createObjectURL(file));

    return {
      newPhotos: normalizedPhotos,
      newPhotoPreviews: previews,
      savedPhotos: Array.isArray(existingPhotos) ? existingPhotos : [],
    };
  }, [photos, existingPhotos]);

  useEffect(() => {
    return () => {
      newPhotoPreviews.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [newPhotoPreviews]);

  const handleChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length > 0) {
      onAdd?.(files);
    }

    event.target.value = "";
  };

  const getExistingPhotoSource = (photo) => {
    if (!photo) {
      return null;
    }

    if (typeof photo === "string") {
      return photo;
    }

    return (
      photo.photo_url || photo.url || photo.image_url || photo.photo || null
    );
  };

  const getExistingPhotoKey = (photo, index) => {
    if (!photo || typeof photo !== "object") {
      return `existing-photo-${index}`;
    }

    return (
      photo.id ??
      photo.photo_id ??
      photo.report_photo_id ??
      `existing-photo-${index}`
    );
  };

  const getNewPhotoKey = (file, index) => {
    if (!(file instanceof File)) {
      return `new-photo-${index}`;
    }

    return [file.name, file.size, file.lastModified].join("-");
  };

  return (
    <div className="space-y-5">
      {/* ======================================================
       * UPLOAD
       * ====================================================== */}

      <label
        htmlFor="report-photos"
        className={[
          "flex min-h-28 cursor-pointer flex-col",
          "items-center justify-center",
          "rounded-xl",
          "border-2 border-dashed border-border",
          "bg-surface-muted/40",
          "px-4 py-5 text-center",
          "transition-[background-color,border-color]",
          "duration-(--token-transition-fast)",
          "hover:border-primary/50",
          "hover:bg-primary-soft/20",
          "focus-within:border-primary/60",
          "focus-within:ring-2",
          "focus-within:ring-primary/20",
          disabled ? "pointer-events-none opacity-50" : "",
        ].join(" ")}
      >
        <span
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary"
          aria-hidden="true"
        >
          <PhotoIcon className="h-5 w-5" aria-hidden="true" />
        </span>

        <span className="mt-2.5 text-sm font-semibold text-text">
          Tambah foto
        </span>

        <span className="mt-1 text-xs leading-5 text-muted">
          Pilih satu atau beberapa foto.
        </span>

        <input
          id="report-photos"
          name="photos"
          type="file"
          accept="image/*"
          multiple
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
        />
      </label>

      {/* ======================================================
       * SAVED PHOTOS
       * ====================================================== */}

      {savedPhotos.length > 0 && (
        <section>
          <div className="mb-2.5">
            <p className="text-sm font-semibold text-text">Foto tersimpan</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
            {savedPhotos.map((photo, index) => {
              const src = getExistingPhotoSource(photo);

              if (!src) {
                return null;
              }

              return (
                <figure
                  key={getExistingPhotoKey(photo, index)}
                  className="group relative overflow-hidden rounded-xl border border-border bg-surface"
                >
                  <img
                    src={src}
                    alt={`Foto ${index + 1}`}
                    className="aspect-4/3 w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRemoveExisting?.(photo)}
                    aria-label={`Hapus foto ${index + 1}`}
                    className={[
                      "absolute right-2 top-2",
                      "inline-flex h-9 w-9 items-center justify-center",
                      "rounded-lg bg-black/60 text-white",
                      "transition-[background-color,opacity]",
                      "duration-(--token-transition-fast)",
                      "hover:bg-black/80",
                      "focus-visible:outline-none",
                      "focus-visible:ring-2",
                      "focus-visible:ring-white/70",
                      disabled
                        ? "pointer-events-none opacity-40"
                        : "opacity-100",
                    ].join(" ")}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* ======================================================
       * NEW PHOTOS
       * ====================================================== */}

      {newPhotos.length > 0 && (
        <section>
          <div className="mb-2.5">
            <p className="text-sm font-semibold text-text">Foto baru</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
            {newPhotos.map((file, index) => {
              const preview = newPhotoPreviews[index];

              if (!preview) {
                return null;
              }

              return (
                <figure
                  key={getNewPhotoKey(file, index)}
                  className="group relative overflow-hidden rounded-xl border border-border bg-surface"
                >
                  <img
                    src={preview}
                    alt={`Foto baru ${index + 1}`}
                    className="aspect-4/3 w-full object-cover"
                    decoding="async"
                  />

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRemove?.(index)}
                    aria-label={`Hapus foto baru ${index + 1}`}
                    className={[
                      "absolute right-2 top-2",
                      "inline-flex h-9 w-9 items-center justify-center",
                      "rounded-lg bg-black/60 text-white",
                      "transition-[background-color,opacity]",
                      "duration-(--token-transition-fast)",
                      "hover:bg-black/80",
                      "focus-visible:outline-none",
                      "focus-visible:ring-2",
                      "focus-visible:ring-white/70",
                      disabled
                        ? "pointer-events-none opacity-40"
                        : "opacity-100",
                    ].join(" ")}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* ======================================================
       * EMPTY
       * ====================================================== */}

      {savedPhotos.length === 0 && newPhotos.length === 0 && (
        <p className="text-sm text-muted">Belum ada foto.</p>
      )}
    </div>
  );
};

ReportPhotoSection.displayName = "ReportPhotoSection";

export default memo(ReportPhotoSection);
