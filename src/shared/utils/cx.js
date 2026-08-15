/**
 * Combines truthy class names into a single string.
 *
 * @param {...(string|false|null|undefined)} classes
 * @returns {string}
 */
export const cx = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

export default cx;