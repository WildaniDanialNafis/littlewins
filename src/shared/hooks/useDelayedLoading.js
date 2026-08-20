import { useEffect, useRef, useState } from "react";

import { LOADING_TIMING } from "@/shared/constants";

/* ============================================================
 * HELPERS
 * ============================================================ */

const DEFAULT_POLICY = "page";

const resolvePolicy = (type) => {
  if (
    typeof type === "string" &&
    Object.prototype.hasOwnProperty.call(LOADING_TIMING, type)
  ) {
    return LOADING_TIMING[type];
  }

  return LOADING_TIMING[DEFAULT_POLICY];
};

const normalizeDuration = (value, fallback = 0) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return fallback;
  }

  return numericValue;
};

/* ============================================================
 * HOOK
 * ============================================================ */

/**
 * Controls when a loading indicator becomes visible.
 *
 * This hook intentionally manages presentation timing only.
 * It does not:
 * - cancel requests
 * - timeout requests
 * - retry requests
 * - change the underlying loading state
 *
 * @param {boolean} loading
 * @param {"page"|"route"|"auth"|"inline"} type
 * @returns {boolean}
 */
export const useDelayedLoading = (loading, type = DEFAULT_POLICY) => {
  const policy = resolvePolicy(type);

  const showDelayMs = normalizeDuration(policy?.showDelayMs, 0);

  const minVisibleMs = normalizeDuration(policy?.minVisibleMs, 0);

  const [visible, setVisible] = useState(false);

  const mountedRef = useRef(false);

  const showTimerRef = useRef(null);

  const hideTimerRef = useRef(null);

  const visibleSinceRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      window.clearTimeout(showTimerRef.current);

      window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  useEffect(() => {
    window.clearTimeout(showTimerRef.current);

    window.clearTimeout(hideTimerRef.current);

    if (!loading) {
      if (!visible) {
        visibleSinceRef.current = 0;

        return undefined;
      }

      const visibleSince = visibleSinceRef.current;

      if (!visibleSince) {
        if (mountedRef.current) {
          setVisible(false);
        }

        return undefined;
      }

      const elapsed = Date.now() - visibleSince;

      const remaining = Math.max(0, minVisibleMs - elapsed);

      hideTimerRef.current = window.setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }

        visibleSinceRef.current = 0;

        setVisible(false);
      }, remaining);

      return () => {
        window.clearTimeout(hideTimerRef.current);
      };
    }

    /*
     * Loading is already visible.
     *
     * Do not restart the minimum-visible timer.
     */
    if (visible) {
      return undefined;
    }

    /*
     * Loading started, but we intentionally delay
     * showing the indicator to avoid flashes for fast
     * operations.
     */
    showTimerRef.current = window.setTimeout(() => {
      if (!mountedRef.current) {
        return;
      }

      visibleSinceRef.current = Date.now();

      setVisible(true);
    }, showDelayMs);

    return () => {
      window.clearTimeout(showTimerRef.current);
    };
  }, [loading, minVisibleMs, showDelayMs, visible]);

  return loading || visible ? visible : false;
};

useDelayedLoading.displayName = "useDelayedLoading";

export default useDelayedLoading;
