/**
 * @link https://jestjs.io/docs/en/configuration.html
 */
export default {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    pretendToBeVisual: true,
  },
  collectCoverage: false,
  collectCoverageFrom: ['<rootDir>/js-toolkit/**/*.js'],
  coverageProvider: 'v8',
  rootDir: '../',
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.html?$': 'html-loader-jest',
  },
  moduleNameMapper: {
    '^@studiometa/js-toolkit-docs(.*)': '<rootDir>/docs$1',
    '^@studiometa/js-toolkit(.*)': '<rootDir>/js-toolkit$1',
  },
  setupFiles: [
    '<rootDir>/tests/__setup__/mockBreakpoints.js',
    '<rootDir>/tests/__setup__/ResizeObserver.js',
    '<rootDir>/tests/__setup__/mockQuerySelectorAllWithScope.js',
  ],
};
