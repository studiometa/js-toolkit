const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  presets: ['prototyping'],
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      vue$: 'vue/dist/vue.esm.js',
    };

    // Custom configuration for the babel-loader to transpile code from outside
    // the current working directory, as the toolkit's sources are one folder up.
    // @see https://stackoverflow.com/a/53207579
    // @see https://github.com/babel/babel/issues/8309#issuecomment-523325222
    const babel = config.module.rules.find(rule => {
      return rule.use.includes('babel-loader') || rule.use.find(l => l.loader === 'babel-loader' );
    });
    const loaderIndex = babel.use.findIndex(l => l.loader === 'babel-loader');
    babel.use.splice(loaderIndex, 1, { loader: 'babel-loader', options: { cacheDirectory: true, rootMode: 'upward' } });
  },
};
