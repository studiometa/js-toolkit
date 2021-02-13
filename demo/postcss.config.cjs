module.exports = {
  plugins: [require('tailwindcss'), require('autoprefixer')],
};

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins = [
    ...module.exports.plugins,
    require('cssnano'),
  ];
}
