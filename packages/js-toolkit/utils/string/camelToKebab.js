/**
 * Regex to replace simple camelCase format.
 * @type {RegExp}
 */
const REGEX = /([a-z0-9])([A-Z])/g;

/**
 * Regex to replace camelCase with multiple following UPPERCASE, for example `anHTMLTag`.
 * @type {RegExp}
 */
const OTHER_REGEX = /([A-Z])([A-Z][a-z])/g;

/**
 * Transform a camelCase string to kebab-case.
 * @param {string} string The camelCase string.
 * @return {string} The kebab-case string.
 */
export default function camelToKebab(string) {
  return string.replace(REGEX, '$1-$2').replace(OTHER_REGEX, '$1-$2').toLowerCase();
}
