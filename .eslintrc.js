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
  },
  overrides: [
    {
      files: ['**/*.spec.js', '**/spec.js'],
      extends: ['plugin:jest/recommended', 'plugin:jest/style'],
    },
  ],
};
