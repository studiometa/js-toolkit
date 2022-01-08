// eslint-disable-next-line import/no-extraneous-dependencies
const { defineConfig } = require('vite');
const path = require('path');

module.exports = defineConfig({
  optimizeDeps: {
    include: ['@studiometa/js-toolkit'],
  },
  resolve: {
    alias: {
      './NavBarTitle.vue': path.resolve(__dirname, '.vitepress/theme/components/NavBarTitle.vue'),
    },
  },
});
