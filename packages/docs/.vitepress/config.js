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
        { text: 'Getting started', link: '/guide/' },
        { text: 'Managing components', link: '/guide/introduction/managing-components.html' },
        { text: 'Managing refs', link: '/guide/introduction/managing-refs.html' },
        { text: 'Managing options', link: '/guide/introduction/managing-options.html' },
        { text: 'Lifecycle hooks', link: '/guide/introduction/lifecycle-hooks.html' },
        { text: 'Using services', link: '/guide/introduction/using-services.html' },
        { text: 'Working with events', link: '/guide/introduction/working-with-events.html' },
      ],
    },
    {
      text: 'Going further',
      children: [
        { text: 'Using decorators', link: '/guide/going-further/using-decorators.html' },
        { text: 'Lazy imports', link: '/guide/going-further/lazy-imports.html' },
        {
          text: 'Registering new services',
          link: '/guide/going-further/registering-new-services.html',
        },
      ],
    },
    {
      text: 'Recipes',
      children: [
        {
          text: 'Teleport refs',
          link: '/guide/recipes/teleport-refs.html',
        },
      ],
    },
    {
      text: 'Migration guide',
      children: [
        {
          text: 'v1 → v2',
          link: '/guide/migration/v1-to-v2.html',
        },
      ],
    },
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
      link: '/api/instantiation.html',
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
    { text: 'withScrolledInView', link: '/api/decorators/withScrolledInView.html' },
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
      text: 'Utils',
      link: '/utils/',
      children: [
        { text: 'debounce', link: '/utils/debounce.html' },
        { text: 'focusTrap', link: '/utils/focusTrap.html' },
        { text: 'keyCodes', link: '/utils/keyCodes.html' },
        { text: 'memoize', link: '/utils/memoize.html' },
        { text: 'nextFrame', link: '/utils/nextFrame.html' },
        { text: 'scrollTo', link: '/utils/scrollTo.html' },
        { text: 'throttle', link: '/utils/throttle.html' },
      ],
    },
    {
      text: 'Collision utils',
      link: '/utils/collision/',
      children: [
        { text: 'boundingRectToCircle', link: '/utils/collision/boundingRectToCircle.html' },
        { text: 'collideCircleCircle', link: '/utils/collision/collideCircleCircle.html' },
        { text: 'collideCircleRect', link: '/utils/collision/collideCircleRect.html' },
        { text: 'collidePointCircle', link: '/utils/collision/collidePointCircle.html' },
        { text: 'collidePointRect', link: '/utils/collision/collidePointRect.html' },
        { text: 'collideRectRect', link: '/utils/collision/collideRectRect.html' },
      ],
    },
    {
      text: 'CSS utils',
      // link: '/utils/css/',
      children: [
        { text: 'matrix', link: '/utils/css/matrix.html' },
        { text: 'transition', link: '/utils/css/transition.html' },
      ],
    },
    {
      text: 'History utils',
      link: '/utils/history/',
      children: [
        { text: 'historyPush', link: '/utils/history/historyPush.html' },
        { text: 'historyReplace', link: '/utils/history/historyReplace.html' },
        { text: 'objectToURLSearchParams', link: '/utils/history/objectToURLSearchParams.html' },
      ],
    },
    {
      text: 'Math utils',
      // link: '/utils/math/',
      children: [
        { text: 'clamp', link: '/utils/math/clamp.html' },
        { text: 'clamp01', link: '/utils/math/clamp01.html' },
        { text: 'damp', link: '/utils/math/damp.html' },
        { text: 'inertiaFinalValue', link: '/utils/math/inertiaFinalValue.html' },
        { text: 'lerp', link: '/utils/math/lerp.html' },
        { text: 'map', link: '/utils/math/map.html' },
        { text: 'round', link: '/utils/math/round.html' },
      ],
    },
    {
      text: 'String utils',
      link: '/utils/string/',
      children: [
        { text: 'withLeadingCharacters', link: '/utils/string/withLeadingCharacters.html' },
        { text: 'withLeadingSlash', link: '/utils/string/withLeadingSlash.html' },
        { text: 'withoutLeadingCharacters', link: '/utils/string/withoutLeadingCharacters.html' },
        {
          text: 'withoutLeadingCharactersRecursive',
          link: '/utils/string/withoutLeadingCharactersRecursive.html',
        },
        { text: 'withoutLeadingSlash', link: '/utils/string/withoutLeadingSlash.html' },
        { text: 'withoutTrailingCharacters', link: '/utils/string/withoutTrailingCharacters.html' },
        {
          text: 'withoutTrailingCharactersRecursive',
          link: '/utils/string/withoutTrailingCharactersRecursive.html',
        },
        { text: 'withoutTrailingSlash', link: '/utils/string/withoutTrailingSlash.html' },
        { text: 'withTrailingCharacters', link: '/utils/string/withTrailingCharacters.html' },
        { text: 'withTrailingSlash', link: '/utils/string/withTrailingSlash.html' },
      ],
    },
  ];
}
