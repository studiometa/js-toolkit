module.exports = {
  title: '🔧 JS Toolkit',
  description: 'A set of useful little bits of JavaScript to boost your project! 🚀',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      {
        text: 'Reference',
        link: '/reference/',
        items: [
          { text: 'Utils', link: '/reference/utils/' },
        ],
      },
      { text: 'Github', link: 'https://github.com/studiometa/js-toolkit' },
    ],
  },
  markdown: {
    toc: { includeLevel: [ 2 ] },
  },
};
