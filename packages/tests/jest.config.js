/**
 * @link https://jestjs.io/docs/en/configuration.html
 */
export default {
  testEnvironment: 'jsdom',
  collectCoverage: false,
  collectCoverageFrom: ['<rootDir>/js-toolkit/**/*.js'],
  rootDir: '../',
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.html?$': 'html-loader-jest',
  },
  setupFiles: [
    '<rootDir>/tests/__setup__/requestAnimationFrame.js',
    '<rootDir>/tests/__setup__/mockBreakpoints.js',
    '<rootDir>/tests/__setup__/ResizeObserver.js',
    '<rootDir>/tests/__setup__/mockQuerySelectorAllWithScope.js',
  ],
};
