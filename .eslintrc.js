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
    'class-methods-use-this': 'off',
    'no-underscore-dangle': [
      'error',
      { allow: ['__base__', '__isChild__', '__isBase__', '__isAsync__', '_excludeFromAutoBind'] },
    ],
  },
  settings: {
    'import/resolver': {
      alias: [['~', './src']],
    },
  },
  overrides: [
    {
      files: ['**/*.spec.js', '**/spec.js', 'tests/**/*.js'],
      extends: ['plugin:jest/recommended', 'plugin:jest/style'],
      rules: {
        'max-classes-per-file': 'off',
        'jest/no-test-callback': 'off',
        'require-jsdoc': 'off',
      },
    },
  ],
};
