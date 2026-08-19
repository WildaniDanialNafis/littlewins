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

  const controlClassName = cx(
    "inline-flex shrink-0 items-center justify-center",
    "h-10 w-10 rounded-full",
    "border border-black/10",
    "bg-white text-black",
    "shadow-xl shadow-black/40",
    "transition-all",
    "hover:bg-white/90",
    "active:scale-95",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-white",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    "sm:h-11 sm:w-11",
  );

  return createPortal(
    <div
      className={cx(
        "fixed inset-0 z-50",
        "flex items-center justify-center",
        "bg-black/90 backdrop-blur-sm",
        "p-3 sm:p-5",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Dokumentasi kegiatan belajar"
      onClick={onClose}
    >
      <div
        className={cx(
          "relative flex w-full max-w-5xl",
          "max-h-[92vh]",
          "items-center justify-center",
        )}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Close */}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className={cx(
            controlClassName,
            "absolute right-1 top-1 z-30",
            "sm:right-2 sm:top-2",
          )}
          aria-label="Tutup dokumentasi"
        >
          <CloseIcon className="h-5 w-5 stroke-[2.5]" aria-hidden="true" />
        </Button>

        {/* Previous */}

        {total > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onPrev}
            className={cx(
              controlClassName,
              "absolute left-1 top-1/2 z-30",
              "-translate-y-1/2",
              "sm:left-2 md:left-4",
            )}
            aria-label="Foto sebelumnya"
          >
            <ChevronLeftIcon
              className="h-6 w-6 stroke-[2.5]"
              aria-hidden="true"
            />
          </Button>
        )}

        {/* Image */}

        <img
          src={currentPhoto}
          alt={`Dokumentasi ${selectedIndex + 1} dari ${total}`}
          className={cx(
            "max-h-[82vh]",
            "w-auto max-w-full",
            "rounded-xl",
            "object-contain",
            "shadow-2xl",
          )}
          draggable="false"
        />

        {/* Next */}

        {total > 1 && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onNext}
            className={cx(
              controlClassName,
              "absolute right-1 top-1/2 z-30",
              "-translate-y-1/2",
              "sm:right-2 md:right-4",
            )}
            aria-label="Foto berikutnya"
          >
            <ChevronRightIcon
              className="h-6 w-6 stroke-[2.5]"
              aria-hidden="true"
            />
          </Button>
        )}

        {/* Counter */}

        {total > 1 && (
          <div
            className={cx(
              "absolute bottom-1 left-1/2 z-30",
              "-translate-x-1/2",
              "rounded-full",
              "bg-white px-3.5 py-1.5",
              "text-xs font-bold text-black",
              "shadow-xl shadow-black/40",
              "sm:bottom-2",
            )}
          >
            {selectedIndex + 1} / {total}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

PhotoLightbox.displayName = "PhotoLightbox";

export default PhotoLightbox;
