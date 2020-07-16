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
    '@babel/plugin-proposal-export-namespace-from',
  ],
  parserOpts: {
    plugins: ['dynamicImport', 'classProperties'],
  },
};
