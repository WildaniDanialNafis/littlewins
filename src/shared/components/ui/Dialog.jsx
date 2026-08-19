import { useState } from "react";

import Modal from "./Modal";
import Spinner from "./Spinner";

const BUTTON_BASE_CLASS = [
  "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5",
  "text-sm font-semibold leading-none select-none",
  "transition-[background-color,border-color,color,box-shadow,transform,opacity]",
  "duration-(--token-transition-fast) ease-out",
  "focus-visible:outline-none focus-visible:ring-2",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "motion-reduce:transition-none",
].join(" ");

const VARIANT_CLASSES = {
  primary: [
    "border border-transparent bg-primary text-primary-foreground shadow-sm",
    "hover:bg-primary-hover active:bg-primary-active active:scale-[0.98]",
    "focus-visible:ring-primary/30",
  ].join(" "),

  secondary: [
    "border border-border bg-surface text-text",
    "hover:border-primary/30 hover:bg-surface-muted",
    "active:bg-surface-muted active:scale-[0.98]",
    "focus-visible:ring-primary/30",
  ].join(" "),

  success: [
    "border border-transparent bg-success text-success-foreground shadow-sm",
    "hover:bg-success-hover active:bg-success-active active:scale-[0.98]",
    "focus-visible:ring-success/30",
  ].join(" "),

  danger: [
    "border border-transparent bg-danger text-danger-foreground shadow-sm",
    "hover:bg-danger-hover active:bg-danger-active active:scale-[0.98]",
    "focus-visible:ring-danger/30",
  ].join(" "),

  warning: [
    "border border-transparent bg-warning text-warning-foreground shadow-sm",
    "hover:bg-warning-hover active:bg-warning-active active:scale-[0.98]",
    "focus-visible:ring-warning/30",
  ].join(" "),
};

const CANCEL_BUTTON_CLASS = [
  BUTTON_BASE_CLASS,
  "border border-border bg-surface text-text",
  "hover:border-border-strong hover:bg-surface-muted",
  "active:bg-surface-muted active:scale-[0.98]",
  "focus-visible:ring-primary/30",
].join(" ");

export const Dialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ya",
  cancelText = "Batal",
  variant = "danger",
}) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (isConfirming) {
      return;
    }

    setIsConfirming(true);

    try {
      /*
       * Convention:
       *
       * undefined / true
       *   → confirmation sukses
       *   → dialog ditutup
       *
       * false
       *   → confirmation gagal / tidak selesai
       *   → dialog tetap terbuka
       */
      const result = await onConfirm?.();

      if (result !== false) {
        onClose?.();
      }
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isConfirming ? undefined : onClose}
      title={title}
      size="sm"
    >
      <div className="space-y-6">
        <p className="text-sm leading-6 text-text-secondary">{message}</p>

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isConfirming}
            className={[
              CANCEL_BUTTON_CLASS,
              "w-full sm:min-w-24 sm:w-auto",
            ].join(" ")}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirming}
            aria-busy={isConfirming || undefined}
            className={[
              BUTTON_BASE_CLASS,
              VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.danger,
              "w-full sm:min-w-24 sm:w-auto",
            ].join(" ")}
          >
            {isConfirming && <Spinner size="sm" aria-hidden="true" />}

            <span>{isConfirming ? "Memproses..." : confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

Dialog.displayName = "Dialog";

export default Dialog;
