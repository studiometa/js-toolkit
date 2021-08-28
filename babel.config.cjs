module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
  ],
  plugins:
    process.env.NODE_TARGET === 'bundle'
      ? ['@babel/plugin-proposal-class-properties']
      : [
          '@babel/plugin-transform-runtime',
          '@babel/plugin-proposal-class-properties',
          'babel-plugin-add-import-extension',
        ],
  parserOpts: {
    plugins: ['dynamicImport', 'classProperties'],
  },
};