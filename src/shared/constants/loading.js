// src/shared/constants/loading.js

/**
 * Centralized loading UX policy.
 *
 * Configuration only:
 * - no React
 * - no timers
 * - no promises
 * - no side effects
 *
 * These values control loading presentation,
 * not request lifetime.
 */

const LOADING_TIMING = Object.freeze({
  page: Object.freeze({
    /**
     * Prevents loading UI from flashing for fast operations.
     */
    showDelayMs: 150,

    /**
     * Prevents a loading indicator that has already appeared
     * from disappearing immediately.
     */
    minVisibleMs: 250,
  }),

  route: Object.freeze({
    /**
     * Lazy route chunks that resolve quickly should not flash
     * a loading indicator.
     */
    showDelayMs: 120,

    minVisibleMs: 200,
  }),

  auth: Object.freeze({
    /**
     * Authentication/bootstrap is critical, but a very fast
     * restore should still avoid a visible loading flash.
     */
    showDelayMs: 100,

    minVisibleMs: 200,
  }),

  inline: Object.freeze({
    /**
     * Small operations such as submit, refresh, or mutation
     * buttons should not immediately switch to a spinner.
     */
    showDelayMs: 200,

    minVisibleMs: 200,
  }),
});

export { LOADING_TIMING };

export default LOADING_TIMING;
