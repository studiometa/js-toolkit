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
      ? [
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-proposal-export-default-from',
          '@babel/plugin-proposal-export-namespace-from',
        ]
      : [
          '@babel/plugin-transform-runtime',
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-proposal-export-default-from',
          '@babel/plugin-proposal-export-namespace-from',
        ],
  parserOpts: {
    plugins: ['dynamicImport', 'classProperties'],
  },
};
