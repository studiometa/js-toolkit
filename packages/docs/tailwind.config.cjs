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
  darkMode: 'dark',
  theme: {
    extend: {
      cursor: {
        grab: 'grab',
        grabbing: 'grabbing',
      },
      colors: {
        vp: {
          'text-1': 'var(--vp-c-text-1)',
          bg: 'var(--vp-c-bg)',
          'bg-alt': 'var(--vp-c-bg-alt)',
        },
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
