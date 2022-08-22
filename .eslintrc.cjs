module.exports = {
  extends: '@studiometa/eslint-config',
  rules: {
    'import/extensions': ['error', 'always', { ignorePackages: true }],
    'no-underscore-dangle': 'off',
    'jsdoc/valid-types': 'off',
  },
  settings: {
    'import/extensions': ['.js', '.mjs', '.jsx', '.ts', '.mts'],
  },
  overrides: [
    {
      files: ['**/*.spec.js', '**/spec.js', 'packages/tests/**/*.js'],
      extends: ['plugin:jest/recommended', 'plugin:jest/style'],
      rules: {
        'max-classes-per-file': 'off',
        'jest/no-test-callback': 'off',
        'require-jsdoc': 'off',
      },
    },
    {
      files: ['**/*.ts', 'packages/js-toolkit/**/*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        'require-jsdoc': 'off',
        'jsdoc/require-returns': 'off',
        'jsdoc/require-param': 'off',
        'import/extensions': 'off',
      },
    },
    {
      files: ['packages/docs/**/*.js'],
      rules: {
        'require-jsdoc': 'off',
      },
    },
  ],
};
