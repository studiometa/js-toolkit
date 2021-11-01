module.exports = {
  lang: 'en-US',
  title: '🔧 JS Toolkit',
  description: 'A set of useful little bits of JavaScript to boost your project! 🚀',
  themeConfig: {
    repo: 'studiometa/js-toolkit',
    docsDir: 'packages/docs',
    lastUpdated: 'Last updated',
    editLinks: true,
    editLinkText: 'Edit this page on GitHub',
    sidebarDepth: 3,
    // algolia: {
    //   apiKey: '',
    //   indexName: '',
    // },
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Utils Reference', link: '/utils/' },
      { text: 'Demo', link: 'https://studiometa-js-toolkit-demo.netlify.app/' },
      { text: 'Release Notes', link: 'https://github.com/studiometa/js-toolkit/releases' },
    ],
    sidebar: {
      '/guide/': getGuideSidebar(),
      '/api/services/': getApiSidebar({ expanded: 'services' }),
      '/api/decorators/': getApiSidebar({ expanded: 'decorators' }),
      '/api/helpers/': getApiSidebar({ expanded: 'helpers' }),
      '/api/': getApiSidebar({ expanded: 'api' }),
      '/utils/': getUtilsSidebar(),
    },
  },
};

function getGuideSidebar() {
  return [
    {
      text: 'Introduction',
      children: [
        { text: 'Getting started' },
        { text: 'Managing components'},
        { text: 'Managing refs' },
        { text: 'Managing options'},
        { text: 'Lifecycle hooks' },
        { text: 'Working with events' },
        { text: 'Using the services' },
      ],
    },
    {
      text: 'Going further',
      children: [
        { text: 'Using decorators' },
        { text: 'Lazy imports' },
        { text: 'Registering new services' },
      ]
    },
    {
      text: 'Recipes',
      children: [
        { text: 'todo' },
      ],
    }
  ];
}

function getApiSidebar({ expanded = 'api' } = {}) {
  return [
    {
      text: 'Base class',
      link: '/api/',
      children: expanded === 'api' ? getBaseSidebar() : getBaseSidebar(),
    },
    {
      text: 'Helpers',
      link: '/api/helpers/',
      children: expanded === 'helpers' ? getHelpersSidebar() : getHelpersSidebar(),
    },
    {
      text: 'Services',
      link: '/api/services/',
      children: expanded === 'services' ? getServicesSidebar() : getServicesSidebar(),
    },
    {
      text: 'Decorators',
      link: '/api/decorators/',
      children: expanded === 'decorators' ? getDecoratorsSidebar() : getDecoratorsSidebar(),
    },
  ];
}

function getBaseSidebar() {
  return [
    {
      text: 'Configuration',
      link: '/api/configuration.html',
    },
    {
      text: 'Lifecycle hooks',
      link: '/api/methods-hooks-lifecycle.html',
    },
    {
      text: 'Services hooks',
      link: '/api/methods-hooks-services.html',
    },
    {
      text: 'Events hooks',
      link: '/api/methods-hooks-events.html',
    },
    {
      text: 'Instantiation',
      link: '/api/instanciation.html',
    },
    {
      text: 'Instance properties',
      link: '/api/instance-properties.html',
    },
    {
      text: 'Instance methods',
      link: '/api/instance-methods.html',
    },
    {
      text: 'Intance events',
      link: '/api/instance-events.html',
    },
    {
      text: 'Static methods',
      link: '/api/static-methods.html',
    },
  ];
}

function getServicesSidebar() {
  return [
    { text: 'useDrag', link: '/api/services/useDrag.html' },
    { text: 'useKey', link: '/api/services/useKey.html' },
    { text: 'useLoad', link: '/api/services/useLoad.html' },
    { text: 'usePointer', link: '/api/services/usePointer.html' },
    { text: 'useRaf', link: '/api/services/useRaf.html' },
    { text: 'useResize', link: '/api/services/useResize.html' },
    { text: 'useScroll', link: '/api/services/useScroll.html' },
  ];
}

function getDecoratorsSidebar() {
  return [
    { text: 'withBreakpointManager', link: '/api/decorators/withBreakpointManager.html' },
    { text: 'withBreakpointObserver', link: '/api/decorators/withBreakpointObserver.html' },
    { text: 'withDrag', link: '/api/decorators/withDrag.html' },
    { text: 'withExtraConfig', link: '/api/decorators/withExtraConfig.html' },
    { text: 'withIntersectionObserver', link: '/api/decorators/withIntersectionObserver.html' },
    { text: 'withMountWhenInView', link: '/api/decorators/withMountWhenInView.html' },
    { text: 'withVue2', link: '/api/decorators/withVue2.html' },
  ];
}

function getHelpersSidebar() {
  return [
    { text: 'createApp', link: '/api/helpers/createApp.html' },
    { text: 'importOnInteraction', link: '/api/helpers/importOnInteraction.html' },
    { text: 'importWhenIdle', link: '/api/helpers/importWhenIdle.html' },
    { text: 'importWhenVisible', link: '/api/helpers/importWhenVisible.html' },
  ];
}

function getUtilsSidebar() {
  return [
    {
      text: 'Math',
      link: '/utils/math',
      children: [],
    }
  ]
}
