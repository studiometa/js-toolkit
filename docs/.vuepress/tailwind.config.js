const path = require('path');
const { colors } = require('tailwindcss/defaultTheme');
const config = require('@studiometa/tailwind-config');

module.exports = {
  ...config,
  important: true,
  theme: {
    ...config.theme,
    colors: {
      ...config.theme.colors,
      ...colors,
    },
  },
  purge: {
    content: [
      path.join(__dirname, './components/Preview.vue'),
      path.join(__dirname, '../**/*.md'),
      path.join(__dirname, '../**/*.html'),
    ],
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
};
