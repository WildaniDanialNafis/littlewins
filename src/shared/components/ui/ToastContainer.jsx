import Toast from "./Toast";

export const ToastContainer = ({ toasts = [], removeToast }) => {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2"
      aria-live="polite"
      aria-atomic="true"
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
