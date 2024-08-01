import type { Config } from 'jest';

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
  },
  extensionsToTreatAsEsm: ['.ts'],
  resolver: 'ts-jest-resolver',
  moduleNameMapper: {
    '^@studiometa/js-toolkit$': '<rootDir>/js-toolkit',
    '^@studiometa/js-toolkit/utils$': '<rootDir>/js-toolkit/utils',
    '^#private/(.*)': '<rootDir>/js-toolkit/$1',
  },
  globals: {
    __DEV__: true,
  },
} as Config;
