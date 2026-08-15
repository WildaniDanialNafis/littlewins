import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

const MODAL_SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const OVERLAY_CLASS = [
  "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6",
  "bg-text/50 backdrop-blur-sm",
  "motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none",
].join(" ");

const MODAL_CLASS = [
  "flex w-full flex-col rounded-xl border border-border bg-surface shadow-xl",
  "max-h-[calc(100dvh-2rem)] overflow-hidden",
  "motion-safe:animate-in motion-safe:zoom-in-[0.98]",
  "motion-safe:duration-(--token-transition-base)",
  "motion-reduce:animate-none",
].join(" ");

const HEADER_CLASS = [
  "flex shrink-0 items-center justify-between gap-4 px-5 py-4 sm:px-6",
  "border-b border-border",
].join(" ");

const TITLE_CLASS =
  "min-w-0 text-base font-semibold leading-6 text-text sm:text-lg";

const CONTENT_CLASS =
  "min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6";

const CLOSE_BUTTON_CLASS = [
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
  "text-muted transition-[background-color,color,box-shadow]",
  "duration-(--token-transition-fast) ease-out",
  "hover:bg-surface-muted hover:text-text",
  "active:bg-surface-muted",
  "focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-primary/30 focus-visible:ring-offset-2",
  "focus-visible:ring-offset-surface",
  "motion-reduce:transition-none",
].join(" ");

export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const overlayRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const handleOverlayMouseDown = (event) => {
    if (event.target === overlayRef.current) {
      onClose?.();
    }
  };

  if (!isOpen) {
    return null;
  }

  const modalSize = MODAL_SIZES[size] ?? MODAL_SIZES.md;

  return createPortal(
    <div
      ref={overlayRef}
      className={OVERLAY_CLASS}
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        className={`${MODAL_CLASS} ${modalSize}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {title && (
          <header className={HEADER_CLASS}>
            <h2 id={titleId} className={TITLE_CLASS}>
              {title}
            </h2>

            <button
              type="button"
              onClick={onClose}
              className={CLOSE_BUTTON_CLASS}
              aria-label="Tutup modal"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </svg>
            </button>
          </header>
        )}

        <div className={CONTENT_CLASS}>{children}</div>
      </div>
    </div>,
    document.body,
  );
};

Modal.displayName = "Modal";

export default Modal;
