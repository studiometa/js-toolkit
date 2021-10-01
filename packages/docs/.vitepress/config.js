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
      {
        text: 'API',
        link: '/api/',
        items: [
          { text: 'Reference', link: '/api/' },
          { text: 'Helpers', link: '/api/helpers/' },
        ],
      },
      {
        text: 'Decorators',
        link: '/decorators/',
        items: [
          { text: 'withBreakpointManager', link: '/decorators/withBreakpointManager.html' },
          { text: 'withBreakpointObserver', link: '/decorators/withBreakpointObserver.html' },
          { text: 'withDrag', link: '/decorators/withDrag.html' },
          { text: 'withExtraConfig', link: '/decorators/withExtraConfig.html' },
          { text: 'withIntersectionObserver', link: '/decorators/withIntersectionObserver.html' },
          { text: 'withMountWhenInView', link: '/decorators/withMountWhenInView.html' },
        ],
      },
      {
        text: 'Services',
        items: [
          { text: 'Drag', link: '/services/drag.html' },
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
          { text: 'String utils', link: '/utils/string.html' },
          { text: 'debounce', link: '/utils/#debounce' },
          { text: 'focusTrap', link: '/utils/#focustrap' },
          { text: 'isObject', link: '/utils/#isobject' },
          { text: 'history', link: '/utils/#history' },
          { text: 'keyCodes', link: '/utils/#keycodes' },
          { text: 'matrix', link: '/utils/#matrix' },
          { text: 'nextFrame', link: '/utils/#nextframe' },
          { text: 'throttle', link: '/utils/#throttle' },
          { text: 'transition', link: '/utils/#transition' },
        ],
      },
      { text: 'Demo', link: 'https://studiometa-js-toolkit-demo.netlify.app/' },
    ],
    sidebar: {
      '/api/helpers/': getHelpersSidebar(),
    },
  },
  markdown: {
    toc: { includeLevel: [1, 2] },
  },
};


function getHelpersSidebar() {
  return [
    {
      text: 'App helper',
      link: '#app-helper',
      children: [
        { text: 'createApp', link: '#createApp'}
      ]
    },
    {
      text: 'Lazy import helpers',
      link: '#lazy-import-helpers',
      children: [
        { text: 'importOnInteraction', link: '#importOnInteraction' },
        { text: 'importWhenIdle', link: '#importWhenIdle'},
        { text: 'importWhenVisible', link: '#importWhenVisible'},
      ]
    },
    {
      text: 'Legacy helpers',
      link: '#legacy-helpers',
      children: [
        { text: 'defineComponent', link: '#defineComponent' },
        { text: 'createBase', link: '#createBase'},
      ]
    }
  ]
}
