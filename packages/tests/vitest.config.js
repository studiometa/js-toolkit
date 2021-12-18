/**
 * @typedef {import('vitest').UserOptions} UserOptions
 */

/**
 * @type {UserOptions}
 */
const config = {
  includes: ['**/*.spec.js'],
  excludes: [
    '**/node_modules/**',
    '**/Base/**',
    '**/decorators/**',
    '**/helpers/**',
    '**/services/**',
  ],
  environment: 'jsdom',
};

export default config;
