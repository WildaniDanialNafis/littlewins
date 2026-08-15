import { createPortal } from "react-dom";

import { Button } from "@/shared/components/ui";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/shared/icons";
import { cx } from "@/shared/utils";

const PhotoLightbox = ({
  photos = [],
  selectedIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  const total = photos.length;

  if (selectedIndex === null || selectedIndex < 0 || selectedIndex >= total) {
    return null;
  }

  const currentPhoto = photos[selectedIndex];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Dokumentasi kegiatan belajar"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl items-center justify-center"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={cx(
            "absolute right-0 top-0 z-10 -translate-y-12 rounded-full",
            "bg-white/10 text-white hover:bg-white/20",
            "focus-visible:ring-white/50 focus-visible:ring-offset-0",
            "sm:-right-1 sm:-translate-y-14",
          )}
          aria-label="Tutup dokumentasi"
        >
          <CloseIcon className="h-5 w-5" aria-hidden="true" />
        </Button>

        {total > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onPrev}
            className={cx(
              "absolute left-1 z-10 rounded-full",
              "bg-black/50 text-white shadow-lg",
              "hover:bg-black/70",
              "focus-visible:ring-white/50 focus-visible:ring-offset-0",
              "sm:left-3 md:left-5",
            )}
            aria-label="Foto sebelumnya"
          >
            <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
          </Button>
        )}

        <img
          src={currentPhoto}
          alt={`Dokumentasi ${selectedIndex + 1} dari ${total}`}
          className="max-h-[82vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
          draggable="false"
        />

        {total > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onNext}
            className={cx(
              "absolute right-1 z-10 rounded-full",
              "bg-black/50 text-white shadow-lg",
              "hover:bg-black/70",
              "focus-visible:ring-white/50 focus-visible:ring-offset-0",
              "sm:right-3 md:right-5",
            )}
            aria-label="Foto berikutnya"
          >
            <ChevronRightIcon className="h-6 w-6" aria-hidden="true" />
          </Button>
        )}

        {total > 1 && (
          <p
            className={cx(
              "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-12",
              "rounded-full bg-black/60 px-3 py-1.5",
              "text-xs font-medium text-white backdrop-blur-sm",
            )}
          >
            {selectedIndex + 1} / {total}
          </p>
        )}
      </div>
    </div>,
    document.body,
  );
};

PhotoLightbox.displayName = "PhotoLightbox";

export default PhotoLightbox;
