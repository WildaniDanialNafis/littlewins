/**
 * Centralized loading presentation policy.
 *
 * Request lifetime is controlled by resource hooks.
 * These values only control when loading feedback becomes visible.
 */

const LOADING_TIMING = Object.freeze({
  page: Object.freeze({
    showDelayMs: 0,
    minVisibleMs: 350,
  }),

  route: Object.freeze({
    showDelayMs: 120,
    minVisibleMs: 200,
  }),

  auth: Object.freeze({
    showDelayMs: 100,
    minVisibleMs: 200,
  }),

  inline: Object.freeze({
    showDelayMs: 200,
    minVisibleMs: 200,
  }),
});

export { LOADING_TIMING };

export default LOADING_TIMING;
