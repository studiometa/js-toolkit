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
  purge: false,
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
};
