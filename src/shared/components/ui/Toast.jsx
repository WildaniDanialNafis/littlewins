import { useEffect } from "react";

import { cx } from "@/shared/utils/cx";

const VARIANT_CLASSES = {
  success: "border-success/20 bg-success-soft text-success",

  error: "border-danger/20 bg-danger-soft text-danger",

  warning: "border-warning/20 bg-warning-soft text-warning",

  info: "border-info/20 bg-info-soft text-info",
};

const ToastIcon = ({ type }) => {
  const iconClass = "size-5 shrink-0";

  const icons = {
    success: (
      <svg
        className={iconClass}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m5 12 4 4L19 6" />
      </svg>
    ),

    error: (
      <svg
        className={iconClass}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    ),

    warning: (
      <svg
        className={iconClass}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10.3 3.7 2.1 18a2 2 0 0 0 1.7 3h16.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    ),

    info: (
      <svg
        className={iconClass}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </svg>
    ),
  };

  return icons[type] ?? icons.info;
};

const CloseIcon = () => {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
};

export const Toast = ({ message, type = "info", duration = 4000, onClose }) => {
  useEffect(() => {
    if (duration <= 0 || !onClose) {
      return undefined;
    }

    const timer = window.setTimeout(onClose, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [duration, onClose]);

  const isError = type === "error";

  return (
    <div
      className={cx(
        "pointer-events-auto flex items-start gap-3",
        "rounded-2xl border px-4 py-3",
        "shadow-lg backdrop-blur-sm",
        "motion-safe:animate-in",
        "motion-safe:fade-in",
        "motion-safe:slide-in-from-right-2",
        "motion-reduce:animate-none",
        VARIANT_CLASSES[type] ?? VARIANT_CLASSES.info,
      )}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      <ToastIcon type={type} />

      <p className="min-w-0 flex-1 text-sm leading-5">{message}</p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={cx(
            "inline-flex size-7 shrink-0 items-center justify-center",
            "rounded-lg",
            "opacity-70 transition-opacity",
            "hover:opacity-100",
            "focus-visible:outline-none",
            "focus-visible:ring-2",
            "focus-visible:ring-current/30",
          )}
          aria-label="Tutup notifikasi"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

Toast.displayName = "Toast";

export default Toast;
