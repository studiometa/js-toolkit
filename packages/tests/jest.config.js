/**
 * @link https://jestjs.io/docs/en/configuration.html
 * @type {import('@jest/types').Config.GlobalConfig}
 */
export default {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    pretendToBeVisual: true,
  },
  collectCoverage: false,
  collectCoverageFrom: ['<rootDir>/js-toolkit/**/*.js'],
  rootDir: '..',
  transform: {
    '^.+\\.html?$': 'html-loader-jest',
  },
  setupFiles: [
    '<rootDir>/tests/__setup__/mockBreakpoints.js',
    '<rootDir>/tests/__setup__/mockQuerySelectorAllWithScope.js',
    '<rootDir>/tests/__setup__/mockRequestIdleCallback.js',
    '<rootDir>/tests/__setup__/mockScrollTo.js',
    '<rootDir>/tests/__setup__/ResizeObserver.js',
  ],
  globals: {
    __DEV__: true,
  },
};
