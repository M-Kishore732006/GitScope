/**
 * String formatting utilities
 */

/**
 * Convert string to UPPERCASE for displaying usernames & names across the app
 * 
 * @param {string} str 
 * @returns {string}
 */
export const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.toUpperCase();
};

export const toUpper = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.toUpperCase();
};
