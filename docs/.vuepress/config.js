const path = require('path');

module.exports = {
  title: '🔧 JS Toolkit',
  description: 'A set of useful little bits of JavaScript to boost your project! 🚀',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      {
        text: 'Components',
        link: '/components/',
        items: [{ text: 'Tabs', link: '/components/tabs/' }],
      },
      {
        text: 'Utils',
        link: '/utils/',
        items: Object.keys(require('../../dist/utils')).map(util => ({
          text: util,
          link: `/utils/#${util.toLowerCase()}`,
        })),
      },
      { text: 'Github', link: 'https://github.com/studiometa/js-toolkit' },
    ],
  },
  markdown: {
    toc: { includeLevel: [2] },
  },
  plugins: [
    [
      '@silvanite/tailwind',
      {
        config: path.resolve(__dirname, 'tailwind.config.js'),
        purgecss: { enabled: false },
      },
    ],
  ],
};
