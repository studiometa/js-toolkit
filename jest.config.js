// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  collectCoverage: false,
  collectCoverageFrom: ['<rootDir>/src/**/*.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.html?$': 'html-loader-jest',
  },
  setupFiles: [
    '<rootDir>/tests/__setup__/requestAnimationFrame.js',
    '<rootDir>/tests/__setup__/mockBreakpoints.js',
  ],
  moduleNameMapper: {
    '~(.*)$': '<rootDir>/src/$1',
  },
};
