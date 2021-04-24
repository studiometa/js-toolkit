const path = require('path');
const webpack = require('webpack');

module.exports = {
  presets: ['prototyping'],
  webpack(config, isDev) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      vue$: 'vue/dist/vue.esm.js',
      '@studiometa/js-toolkit': path.resolve(__dirname, '../js-toolkit'),
    };

    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(isDev),
      })
    );

    config.cache = {
      ...(config.cache || {}),
      buildDependencies: {
        config: [__filename],
        toolkit: [path.resolve(__dirname, '../js-toolkit')],
      },
    };

    const jsRule = config.module.rules.find(
      (rule) => rule.test.toString() === /\.m?js$/.toString()
    );
    delete jsRule.exclude;
    jsRule.include = [path.resolve(__dirname, 'src'), path.resolve(__dirname, '../js-toolkit/')];

    // Custom configuration for the babel-loader to transpile code from outside
    // the current working directory, as the toolkit's sources are one folder up.
    // @see https://stackoverflow.com/a/53207579
    // @see https://github.com/babel/babel/issues/8309#issuecomment-523325222
    const babel = config.module.rules.find((rule) => {
      return rule.use.includes('babel-loader') || rule.use.find((l) => l.loader === 'babel-loader');
    });
    const loaderIndex = babel.use.findIndex((l) => l.loader === 'babel-loader');
    babel.use.splice(loaderIndex, 1, {
      loader: 'babel-loader',
      options: { cacheDirectory: true, rootMode: 'upward' },
    });
  },
};
