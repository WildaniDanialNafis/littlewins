import Toast from "./Toast";

export const ToastContainer = ({ toasts = [], removeToast }) => {
  if (!Array.isArray(toasts) || toasts.length === 0) {
    return null;
  }

  return (
    <div
      className={[
        "pointer-events-none fixed inset-x-4 bottom-4 z-50",
        "flex flex-col items-stretch gap-2",
        "sm:left-auto sm:right-4 sm:w-full sm:max-w-sm",
      ].join(" ")}
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast?.(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

ToastContainer.displayName = "ToastContainer";

export default ToastContainer;
