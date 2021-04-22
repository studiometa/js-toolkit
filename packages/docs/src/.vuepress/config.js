const path = require('path');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

module.exports = {
  title: '🔧 JS Toolkit',
  description: 'A set of useful little bits of JavaScript to boost your project! 🚀',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      {
        text: 'Decorators',
        link: '/decorators/',
        items: [
          { text: 'withBreakpointManager', link: '/decorators/withBreakpointManager.html' },
          { text: 'withBreakpointObserver', link: '/decorators/withBreakpointObserver.html' },
          { text: 'withIntersectionObserver', link: '/decorators/withIntersectionObserver.html' },
          { text: 'withMountWhenInView', link: '/decorators/withMountWhenInView.html' },
        ],
      },
      {
        text: 'Components',
        link: '/components/',
        items: [
          { text: 'Accordion', link: '/components/Accordion.html' },
          { text: 'Cursor', link: '/components/Cursor.html' },
          { text: 'Modal', link: '/components/Modal.html' },
          { text: 'Tabs', link: '/components/Tabs.html' },
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
        items: [
          { text: 'debounce', link: '/utils/#debounce' },
          { text: 'focusTrap', link: '/utils/#focusTrap' },
          { text: 'isObject', link: '/utils/#isObject' },
          { text: 'history', link: '/utils/#history' },
          { text: 'keyCodes', link: '/utils/#keyCodes' },
          { text: 'matrix', link: '/utils/#matrix' },
          { text: 'nextFrame', link: '/utils/#nextFrame' },
          { text: 'throttle', link: '/utils/#throttle' },
          { text: 'transition', link: '/utils/#transition' },
        ],
      },
      { text: 'Demo', link: 'https://studiometa-js-toolkit-demo.netlify.app/' },
      { text: 'Github', link: 'https://github.com/studiometa/js-toolkit' },
    ],
  },
  markdown: {
    toc: { includeLevel: [2] },
  },
  configureWebpack(config) {
    config.plugins.push(new HardSourceWebpackPlugin())
    config.plugins.push(new HardSourceWebpackPlugin.ExcludeModulePlugin([
      {
        test: /mini-css-extract-plugin[\\/]dist[\\/]loader/,
      },
    ]),)
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
