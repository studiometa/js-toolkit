module.exports = {
  presets: [require('@studiometa/tailwind-config')],
  important: true,
  purge: {
    content: [
      './.vitepress/**/*.js',
      './.vitepress/**/*.vue',
      './.vitepress/**/*.ts',
      './**/*.md',
      './**/*.html'
    ],
  },
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
};
