module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: process.env.NODE_ENV === 'test' ? 'cjs' : false,
      },
    ],
  ],
  plugins:
    process.env.NODE_TARGET === 'bundle'
      ? ['@babel/plugin-proposal-class-properties']
      : ['@babel/plugin-transform-runtime', '@babel/plugin-proposal-class-properties'],
  parserOpts: {
    plugins: ['dynamicImport', 'classProperties'],
  },
};
