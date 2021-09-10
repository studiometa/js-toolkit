module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          esmodules: true,
        },
      },
    ],
  ],
  plugins:
    process.env.NODE_TARGET === 'bundle'
      ? ['@babel/plugin-proposal-class-properties']
      : ['@babel/plugin-transform-runtime', 'babel-plugin-add-import-extension'],
};
