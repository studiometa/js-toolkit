const path = require('path');
const webpack = require('webpack');

module.exports = {
  presets: ['prototyping'],
  webpack(config, isDev) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@studiometa/js-toolkit': path.resolve(__dirname, '../js-toolkit'),
    };

    // Remove Vue loader and plugin.
    config.plugins = config.plugins.filter((plugin) => {
      return plugin.constructor.name !== 'VueLoaderPlugin';
    });
    config.module.rules = config.module.rules.filter((rule) => {
      return !(rule.use && rule.use.includes('vue-loader'));
    });

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
