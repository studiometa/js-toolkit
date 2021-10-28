module.exports = {
  root: true,
  extends: '@studiometa/eslint-config',
  rules: {
    'class-methods-use-this': 'off',
    'require-jsdoc': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': ['error', 'always', { ignorePackages: true }],
  },
};
