import { memo } from "react";

import { PhotoIcon } from "@/shared/icons";

const ReportPhotoSection = ({
  photos = [],
  existingPhotos = [],
  onAdd,
  onRemove,
  onRemoveExisting,
  disabled = false,
}) => {
  const handleChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length > 0) {
      onAdd?.(files);
    }

    event.target.value = "";
  };

  const getPhotoSource = (photo) => {
    if (!photo) {
      return null;
    }

    if (typeof photo === "string") {
      return photo;
    }

    return (
      photo.preview ||
      photo.photo_url ||
      photo.url ||
      photo.image_url ||
      photo.photo ||
      null
    );
  };

  const getExistingPhotoKey = (photo, index) => {
    if (!photo || typeof photo !== "object") {
      return `existing-photo-${index}`;
    }

    return photo.id ?? photo.photo_id ?? `existing-photo-${index}`;
  };

  const getNewPhotoKey = (photo, index) => {
    if (!(photo instanceof File)) {
      return `new-photo-${index}`;
    }

    return [photo.name, photo.size, photo.lastModified].join("-");
  };

  return (
    <div className="space-y-6">
      <label
        htmlFor="report-photos"
        className={[
          "flex min-h-32 cursor-pointer flex-col",
          "items-center justify-center rounded-2xl",
          "border-2 border-dashed border-border",
          "bg-surface-muted/40 px-5 py-6 text-center",
          "transition-colors",
          "hover:border-primary/50",
          "hover:bg-primary-soft/30",
          disabled ? "pointer-events-none opacity-50" : "",
        ].join(" ")}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <PhotoIcon className="h-5 w-5" aria-hidden="true" />
        </span>

        <span className="mt-3 text-sm font-semibold text-text">
          Tambahkan foto
        </span>

        <span className="mt-1 text-xs leading-5 text-muted">
          Pilih satu atau beberapa foto kegiatan belajar.
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

      {existingPhotos.length > 0 && (
        <section>
          <div className="mb-3">
            <p className="text-sm font-semibold text-text">Foto tersimpan</p>

            <p className="mt-0.5 text-xs text-muted">
              Foto yang sudah tersimpan pada laporan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {existingPhotos.map((photo, index) => {
              const src = getPhotoSource(photo);

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
                    alt={`Dokumentasi tersimpan ${index + 1}`}
                    className="aspect-4/3 w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRemoveExisting?.(photo)}
                    aria-label={`Hapus foto tersimpan ${index + 1}`}
                    className={[
                      "absolute right-2 top-2",
                      "inline-flex h-8 w-8 items-center justify-center",
                      "rounded-lg bg-black/60 text-white",
                      "transition-opacity",
                      "hover:bg-black/80",
                      "focus-visible:outline-none",
                      "focus-visible:ring-2",
                      "focus-visible:ring-white/70",
                      disabled
                        ? "pointer-events-none opacity-40"
                        : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
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

      {photos.length > 0 && (
        <section>
          <div className="mb-3">
            <p className="text-sm font-semibold text-text">Foto baru</p>

            <p className="mt-0.5 text-xs text-muted">
              Foto ini akan disimpan saat laporan disimpan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {photos.map((photo, index) => {
              const src = getPhotoSource(photo);

              if (!src) {
                return null;
              }

              return (
                <figure
                  key={getNewPhotoKey(photo, index)}
                  className="group relative overflow-hidden rounded-xl border border-border bg-surface"
                >
                  <img
                    src={src}
                    alt={`Foto baru ${index + 1}`}
                    className="aspect-4/3 w-full object-cover"
                  />

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onRemove?.(index)}
                    aria-label={`Hapus foto baru ${index + 1}`}
                    className={[
                      "absolute right-2 top-2",
                      "inline-flex h-8 w-8 items-center justify-center",
                      "rounded-lg bg-black/60 text-white",
                      "transition-opacity",
                      "hover:bg-black/80",
                      "focus-visible:outline-none",
                      "focus-visible:ring-2",
                      "focus-visible:ring-white/70",
                      disabled
                        ? "pointer-events-none opacity-40"
                        : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
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

      {existingPhotos.length === 0 && photos.length === 0 && (
        <p className="text-sm text-muted">Belum ada foto yang ditambahkan.</p>
      )}
    </div>
  );
};

ReportPhotoSection.displayName = "ReportPhotoSection";

export default memo(ReportPhotoSection);
