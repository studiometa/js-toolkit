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
        items: [
          { text: 'Modal', link: '/components/modal/' },
          { text: 'Tabs', link: '/components/tabs/' },
        ],
      },
      {
        text: 'Services',
        items: [
          { text: 'Key', link: '/services/key/' },
          { text: 'Pointer', link: '/services/pointer/' },
          { text: 'RAF', link: '/services/raf/' },
          { text: 'Resize', link: '/services/resize/' },
          { text: 'Scroll', link: '/services/scroll/' },
        ],
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
