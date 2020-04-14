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
          { text: 'Accordion', link: '/components/accordion/' },
          { text: 'Tabs', link: '/components/tabs/' },
        ],
      },
      {
        text: 'Utils',
        link: '/utils/',
        items: [
          { text: 'debounce', link: '/utils/#debounce' },
          { text: 'isObject', link: '/utils/#isObject' },
          { text: 'throttle', link: '/utils/#throttle' },
        ],
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
