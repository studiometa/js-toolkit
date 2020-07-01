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
    'no-underscore-dangle': ['error', { allow: ['__base__', '__isChild__', '__isBase__'] }],
  },
  overrides: [
    {
      files: ['**/*.spec.js', '**/spec.js', 'tests/**/*.js'],
      extends: ['plugin:jest/recommended', 'plugin:jest/style'],
      rules: {
        'jest/no-test-callback': 'off',
      },
    },
  ],
};
