/**
 * String formatting utilities
 */

/**
 * Convert string to Title Case (e.g. "john doe" -> "John Doe", "PRADEEP KUMAR" -> "Pradeep Kumar")
 * Preserves spaces and hyphens properly.
 * 
 * @param {string} str 
 * @returns {string}
 */
const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\b[a-zA-ZÀ-ÿ]+/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
};

module.exports = {
  toTitleCase
};
