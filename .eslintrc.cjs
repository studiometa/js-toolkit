module.exports = {
  extends: '@studiometa/eslint-config',
  globals: {
    window: false,
    document: false,
    requestAnimationFrame: false,
    IntersectionObserver: false,
    Image: false,
    KeyboardEvent: false,
  },
  rules: {
    'import/extensions': ['error', 'always'],
    'class-methods-use-this': 'off',
    'no-underscore-dangle': [
      'error',
      { allow: [ '__base__', '_excludeFromAutoBind' ] },
    ],
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
  ],
};
