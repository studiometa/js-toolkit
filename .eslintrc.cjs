module.exports = {
  extends: '@studiometa/eslint-config',
  rules: {
    'import/extensions': [ 'error', 'always', { ignorePackages: true }],
    'no-underscore-dangle': 'off',
  },
  overrides: [
    {
      files: [ '**/*.spec.js', '**/spec.js', 'packages/tests/**/*.js' ],
      extends: [ 'plugin:jest/recommended', 'plugin:jest/style' ],
      rules: {
        'max-classes-per-file': 'off',
        'jest/no-test-callback': 'off',
        'require-jsdoc': 'off',
      },
    },
    {
      files: [ '**/*.ts' ],
      parser: '@typescript-eslint/parser',
      plugins: [ '@typescript-eslint' ],
      extends: [ 'eslint:recommended', 'plugin:@typescript-eslint/recommended' ],
    },
    {
      files: [ 'packages/docs/**/*.js' ],
      rules: {
        'require-jsdoc': 'off',
      },
    },
  ],
};
