const defaultConfig = require('tailwindcss/defaultConfig');
const tailwindConfig = require('@studiometa/tailwind-config');

tailwindConfig.corePlugins = undefined;

module.exports = {
  presets: [tailwindConfig],
  content: [
    './.vitepress/**/*.js',
    './.vitepress/**/*.vue',
    './.vitepress/**/*.ts',
    './**/*.md',
    './**/*.html',
  ],
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
        brand: {
          DEFAULT: '#3eaf7c',
          light: '#42d392',
        },
        code: {
          bg: 'var(--code-bg-color)',
        },
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
