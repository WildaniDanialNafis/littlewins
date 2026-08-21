import { useCallback, useEffect, useRef, useState } from "react";

import { LOADING_TIMING } from "@/shared/constants";

const DEFAULT_POLICY = "page";

const resolvePolicy = (type) => {
  if (
    typeof type === "string" &&
    Object.prototype.hasOwnProperty.call(LOADING_TIMING, type)
  ) {
    return LOADING_TIMING[type];
  }

  return (
    LOADING_TIMING[DEFAULT_POLICY] ?? {
      showDelayMs: 0,
      minVisibleMs: 0,
    }
  );
};

const normalizeDuration = (value, fallback = 0) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return fallback;
  }

  return numericValue;
};

export const useDelayedLoading = (loading, type = DEFAULT_POLICY) => {
  const policy = resolvePolicy(type);

  const showDelayMs = normalizeDuration(policy?.showDelayMs, 0);

  const minVisibleMs = normalizeDuration(policy?.minVisibleMs, 0);

  const [visible, setVisible] = useState(false);

  const mountedRef = useRef(false);

  const loadingRef = useRef(Boolean(loading));

  const visibleRef = useRef(false);

  const showTimerRef = useRef(null);

  const hideTimerRef = useRef(null);

  const visibleSinceRef = useRef(0);

  const generationRef = useRef(0);

  const clearShowTimer = useCallback(() => {
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);

      showTimerRef.current = null;
    }
  }, []);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);

      hideTimerRef.current = null;
    }
  }, []);

  const clearTimers = useCallback(() => {
    clearShowTimer();
    clearHideTimer();
  }, [clearHideTimer, clearShowTimer]);

  const showLoading = useCallback((generation) => {
    if (
      !mountedRef.current ||
      generation !== generationRef.current ||
      !loadingRef.current
    ) {
      return;
    }

    visibleRef.current = true;

    visibleSinceRef.current = Date.now();

    setVisible(true);
  }, []);

  const hideLoading = useCallback(() => {
    visibleRef.current = false;

    visibleSinceRef.current = 0;

    setVisible(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      generationRef.current += 1;

      clearTimers();
    };
  }, [clearTimers]);

  useEffect(() => {
    loadingRef.current = Boolean(loading);
  }, [loading]);

  useEffect(() => {
    generationRef.current += 1;

    const generation = generationRef.current;

    clearTimers();

    if (loading) {
      if (visibleRef.current) {
        return undefined;
      }

      if (showDelayMs === 0) {
        showLoading(generation);

        return undefined;
      }

      showTimerRef.current = window.setTimeout(() => {
        showTimerRef.current = null;

        showLoading(generation);
      }, showDelayMs);

      return undefined;
    }

    if (!visibleRef.current) {
      visibleSinceRef.current = 0;

      return undefined;
    }

    const visibleSince =
      visibleSinceRef.current > 0 ? visibleSinceRef.current : Date.now();

    const elapsed = Date.now() - visibleSince;

    const remainingMs = Math.max(0, minVisibleMs - elapsed);

    if (remainingMs === 0) {
      hideLoading();

      return undefined;
    }

    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;

      if (!mountedRef.current || generation !== generationRef.current) {
        return;
      }

      if (loadingRef.current) {
        return;
      }

      hideLoading();
    }, remainingMs);

    return () => {
      clearHideTimer();
    };
  }, [
    clearHideTimer,
    clearTimers,
    hideLoading,
    loading,
    minVisibleMs,
    showDelayMs,
    showLoading,
  ]);

  return visible;
};

useDelayedLoading.displayName = "useDelayedLoading";

export default useDelayedLoading;
