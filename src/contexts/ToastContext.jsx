import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { TOAST } from "@/shared/constants";

const ToastContext = createContext(null);

ToastContext.displayName = "ToastContext";

const createToastId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = "info", duration = TOAST.defaultDuration) => {
      const id = createToastId();

      setToasts((current) => {
        const next = [
          ...current,
          {
            id,
            message,
            type,
            duration,
          },
        ];

        return next.slice(-TOAST.maxToasts);
      });

      return id;
    },
    [],
  );

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast,
    }),
    [toasts, addToast, removeToast],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

ToastProvider.displayName = "ToastProvider";

export { ToastContext };
