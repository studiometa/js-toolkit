module.exports = {
  lang: 'en-US',
  title: '🔧 JS Toolkit',
  description: 'A set of useful little bits of JavaScript to boost your project! 🚀',
  themeConfig: {
    repo: 'studiometa/js-toolkit',
    docsDir: 'packages/docs/src',
    lastUpdated: 'Last updated',
    // algolia: {
    //   apiKey: '',
    //   indexName: '',
    // },
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
          { text: 'withExtraConfig', link: '/decorators/withExtraConfig.html' },
          { text: 'withIntersectionObserver', link: '/decorators/withIntersectionObserver.html' },
          { text: 'withMountWhenInView', link: '/decorators/withMountWhenInView.html' },
          { text: 'withVue', link: '/decorators/withVue.html' },
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
          { text: 'Key', link: '/services/key.html' },
          { text: 'Pointer', link: '/services/pointer.html' },
          { text: 'RAF', link: '/services/raf.html' },
          { text: 'Resize', link: '/services/resize.html' },
          { text: 'Scroll', link: '/services/scroll.html' },
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
    ],
  },
  markdown: {
    toc: { includeLevel: [1,2] },
  },
};
