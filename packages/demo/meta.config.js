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
  },
};
