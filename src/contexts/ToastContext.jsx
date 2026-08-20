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

/* ============================================================
 * HELPERS
 * ============================================================ */

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

/* ============================================================
 * PROVIDER
 * ============================================================ */

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /*
   * Synchronous mirror of the current toast state.
   *
   * addToast/removeToast/timer callbacks all operate
   * against this ref before scheduling React state.
   *
   * This avoids relying on mutation inside a setState updater.
   */
  const toastsRef = useRef([]);

  const sequenceRef = useRef(0);

  const timersRef = useRef(new Map());

  /* ==========================================================
   * STATE COMMIT
   * ========================================================== */

  const commitToasts = useCallback((nextToasts) => {
    const normalized = Array.isArray(nextToasts) ? nextToasts : [];

    toastsRef.current = normalized;

    setToasts(normalized);
  }, []);

  /* ==========================================================
   * ID
   * ========================================================== */

  const createToastId = useCallback(() => {
    sequenceRef.current += 1;

    return `${Date.now()}-${sequenceRef.current}`;
  }, []);

  /* ==========================================================
   * TIMER
   * ========================================================== */

  const clearTimer = useCallback((id) => {
    const timer = timersRef.current.get(id);

    if (timer === undefined) {
      return;
    }

    window.clearTimeout(timer);

    timersRef.current.delete(id);
  }, []);

  const scheduleRemoval = useCallback(
    (id, duration) => {
      if (duration <= 0) {
        return;
      }

      clearTimer(id);

      const timer = window.setTimeout(() => {
        timersRef.current.delete(id);

        const current = toastsRef.current;

        const next = current.filter((toast) => toast.id !== id);

        if (next.length === current.length) {
          return;
        }

        commitToasts(next);
      }, duration);

      timersRef.current.set(id, timer);
    },
    [clearTimer, commitToasts],
  );

  /* ==========================================================
   * REMOVE
   * ========================================================== */

  const removeToast = useCallback(
    (id) => {
      clearTimer(id);

      const current = toastsRef.current;

      const next = current.filter((toast) => toast.id !== id);

      if (next.length === current.length) {
        return;
      }

      commitToasts(next);
    },
    [clearTimer, commitToasts],
  );

  /* ==========================================================
   * ADD
   * ========================================================== */

  const addToast = useCallback(
    (message, type = "info", duration = DEFAULT_DURATION) => {
      const normalizedMessage = normalizeMessage(message);

      if (!normalizedMessage) {
        return null;
      }

      const normalizedType = normalizeType(type);

      const normalizedDuration = normalizeDuration(duration);

      const current = toastsRef.current;

      /*
       * Detect duplicate BEFORE scheduling
       * any new state update.
       */
      const existing = current.find(
        (item) =>
          item.message === normalizedMessage && item.type === normalizedType,
      );

      if (existing) {
        /*
         * Re-use the toast that actually exists.
         */
        scheduleRemoval(existing.id, normalizedDuration);

        return existing.id;
      }

      const id = createToastId();

      const toast = {
        id,

        message: normalizedMessage,

        type: normalizedType,

        duration: normalizedDuration,
      };

      let next = [...current, toast];

      if (next.length > MAX_TOASTS) {
        const removed = next.slice(0, next.length - MAX_TOASTS);

        /*
         * Clear timers belonging to toasts that
         * are evicted from the visible state.
         */
        for (const removedToast of removed) {
          clearTimer(removedToast.id);
        }

        next = next.slice(-MAX_TOASTS);
      }

      /*
       * Commit the new state synchronously
       * through the ref mirror.
       */
      commitToasts(next);

      scheduleRemoval(id, normalizedDuration);

      return id;
    },
    [clearTimer, commitToasts, createToastId, scheduleRemoval],
  );

  /* ==========================================================
   * CLEANUP
   * ========================================================== */

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer);
      }

      timers.clear();

      toastsRef.current = [];
    };
  }, []);

  /* ==========================================================
   * CONTEXT
   * ========================================================== */

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
