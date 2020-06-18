module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'cjs',
      },
    ],
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-export-default-from',
  ],
  parserOpts: {
    plugins: ['dynamicImport', 'classProperties'],
  },
  // babelrcRoots: ['.', 'packages/*'],
};
