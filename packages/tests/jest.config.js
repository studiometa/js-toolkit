/**
 * @see https://jestjs.io/docs/en/configuration.html
 * @type {import('@jest/types').Config.GlobalConfig}
 */
export default {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    pretendToBeVisual: true,
  },
  collectCoverage: false,
  collectCoverageFrom: ['<rootDir>/js-toolkit/**/*.js', '<rootDir>/js-toolkit/**/*.ts'],
  rootDir: '..',
  transform: {
    '^.+\\.ts$': ['esbuild-jest', { format: 'esm', sourcemap: true }],
    '^.+\\.html?$': 'html-loader-jest',
  },
  extensionsToTreatAsEsm: ['.ts'],
  resolver: 'ts-jest-resolver',
  moduleNameMapper: {
    '^@studiometa/js-toolkit(.*)': '<rootDir>/js-toolkit$1',
  },
  setupFiles: [
    '<rootDir>/tests/__setup__/mockBreakpoints.js',
    '<rootDir>/tests/__setup__/mockRequestIdleCallback.js',
    '<rootDir>/tests/__setup__/mockScrollTo.js',
    '<rootDir>/tests/__setup__/ResizeObserver.js',
  ],
  globals: {
    __DEV__: true,
  },
};
