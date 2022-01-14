const defaultConfig = require('tailwindcss/defaultConfig');

module.exports = {
  presets: [require('@studiometa/tailwind-config')],
  // important: true,
  purge: {
    content: [
      './.vitepress/**/*.js',
      './.vitepress/**/*.vue',
      './.vitepress/**/*.ts',
      './**/*.md',
      './**/*.html',
    ],
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  theme: {
    extend: {
      cursor: {
        grab: 'grab',
        grabbing: 'grabbing',
      },
      colors: {
        brand: '#3eaf7c',
      },
      fontSize: {
        '2xs': ['0.625rem', '1'],
      },
      maxHeight: defaultConfig.theme.maxWidth,
    },
  },
  variants: {
    extend: {
      cursor: ['active'],
      ringOpacity: ['hover', 'active', 'focus'],
    },
  },
};
