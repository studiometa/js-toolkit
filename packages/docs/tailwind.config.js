// const path = require('path');
// const { colors } = require('tailwindcss/defaultTheme');
// const config = require('@studiometa/tailwind-config');

module.exports = {
  presets: [require('@studiometa/tailwind-config')],
  important: true,
  // theme: {
  //   ...config.theme,
  //   colors: {
  //     ...config.theme.colors,
  //     ...colors,
  //   },
  // },
  purge: {
    enabled: false,
    content: [
      './src/.vitepress/**/*.js',
      './src/.vitepress/**/*.vue',
      './src/.vitepress/**/*.ts',
      './src/**/*.md',
      './src/**/*.html'
    ],
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
};
