module.exports = {
  root: true,
  extends: '@studiometa/eslint-config',
  rules: {
    'class-methods-use-this': 'off',
    'require-jsdoc': 'off',
    'no-underscore-dangle': ['error', { allow: ['__base__', '__isChild__', '__isBase__'] }],
  },
};
