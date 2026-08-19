import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { TOAST } from "@/shared/constants";

const ToastContext = createContext(null);

ToastContext.displayName = "ToastContext";

const MAX_TOASTS =
  Number.isInteger(TOAST.maxToasts) && TOAST.maxToasts > 0
    ? TOAST.maxToasts
    : 5;

const DEFAULT_DURATION =
  Number.isFinite(Number(TOAST.defaultDuration)) &&
  Number(TOAST.defaultDuration) > 0
    ? Number(TOAST.defaultDuration)
    : 4000;

const normalizeMessage = (message) => {
  if (message === null || message === undefined) {
    return "";
  }

  return String(message).trim();
};

const normalizeType = (type) => {
  const allowedTypes = new Set(["success", "error", "warning", "info"]);

  return allowedTypes.has(type) ? type : "info";
};

const normalizeDuration = (duration) => {
  const numericDuration = Number(duration);

  if (!Number.isFinite(numericDuration)) {
    return DEFAULT_DURATION;
  }

  return Math.max(0, numericDuration);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const sequenceRef = useRef(0);

  const timersRef = useRef(new Map());

  const createToastId = useCallback(() => {
    sequenceRef.current += 1;

    return `${Date.now()}-${sequenceRef.current}`;
  }, []);

  const clearTimer = useCallback((id) => {
    const timer = timersRef.current.get(id);

    if (timer === undefined) {
      return;
    }

    window.clearTimeout(timer);

    timersRef.current.delete(id);
  }, []);

  const removeToast = useCallback(
    (id) => {
      clearTimer(id);

      setToasts((current) => current.filter((toast) => toast.id !== id));
    },
    [clearTimer],
  );

  const scheduleRemoval = useCallback(
    (id, duration) => {
      if (duration <= 0) {
        return;
      }

      clearTimer(id);

      const timer = window.setTimeout(() => {
        timersRef.current.delete(id);

        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, duration);

      timersRef.current.set(id, timer);
    },
    [clearTimer],
  );

  const addToast = useCallback(
    (message, type = "info", duration = DEFAULT_DURATION) => {
      const normalizedMessage = normalizeMessage(message);

      if (!normalizedMessage) {
        return null;
      }

      const normalizedType = normalizeType(type);

      const normalizedDuration = normalizeDuration(duration);

      const id = createToastId();

      const toast = {
        id,
        message: normalizedMessage,
        type: normalizedType,
        duration: normalizedDuration,
      };

      setToasts((current) => {
        /*
         * Identical toast yang baru
         * muncul segera setelah toast
         * yang sama tidak perlu
         * menumpuk.
         */
        const existingIndex = current.findIndex(
          (item) => item.message === toast.message && item.type === toast.type,
        );

        if (existingIndex >= 0) {
          const existing = current[existingIndex];

          /*
           * Re-schedule existing toast
           * daripada membuat duplicate.
           */
          scheduleRemoval(existing.id, normalizedDuration);

          return current;
        }

        const next = [...current, toast];

        return next.slice(-MAX_TOASTS);
      });

      scheduleRemoval(id, normalizedDuration);

      return id;
    },
    [createToastId, scheduleRemoval],
  );

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        window.clearTimeout(timer);
      }

      timersRef.current.clear();
    };
  }, []);

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

export default ToastContext;
