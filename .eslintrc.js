module.exports = {
  extends: '@studiometa/eslint-config',
  globals: {
    window: false,
    document: false,
    requestAnimationFrame: false,
    IntersectionObserver: false,
    Image: false,
  },
  rules: {
    'class-methods-use-this': 'off',
  },
  overrides: [
    {
      files: '**/*.js',
      parser: 'babel-eslint',
    },
    {
      files: 'demo/**/*.js',
      rules: {
        'require-jsdoc': 'off',
      },
    },
  ],
};
