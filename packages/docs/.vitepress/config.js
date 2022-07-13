import { defineConfig } from 'vitepress';
import fs from 'fs';

const pkg = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), { encoding: 'utf8' })
);

export default defineConfig({
  lang: 'en-US',
  title: 'JS Toolkit',
  description: 'A set of useful little bits of JavaScript to boost your project! 🚀',
  head: [['link', { rel: 'icon', type: 'image/x-icon', href: '/logo.png' }]],
  themeConfig: {
    logo: '/logo.png',
    version: pkg.version,
    repo: 'studiometa/js-toolkit',
    docsDir: 'packages/docs',
    lastUpdated: 'Last updated',
    editLinks: true,
    editLinkText: 'Edit this page on GitHub',
    sidebarDepth: 3,
    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2020–present Studio Meta',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/studiometa/js-toolkit' }],
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
});

function getGuideSidebar() {
  return [
    {
      text: 'Introduction',
      items: [
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
      items: [
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
      items: [
        {
          text: 'Counter component',
          link: '/guide/recipes/counter-component/',
        },
        {
          text: 'Scroll linked animation',
          link: '/guide/recipes/scroll-linked-animation/',
        },
        {
          text: 'Teleport refs',
          link: '/guide/recipes/teleport-refs/',
        },
      ],
    },
    {
      text: 'Migration guide',
      items: [
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
      items: expanded === 'api' ? getBaseSidebar() : getBaseSidebar(),
    },
    {
      text: 'Helpers',
      link: '/api/helpers/',
      items: expanded === 'helpers' ? getHelpersSidebar() : getHelpersSidebar(),
    },
    {
      text: 'Services',
      link: '/api/services/',
      items: expanded === 'services' ? getServicesSidebar() : getServicesSidebar(),
    },
    {
      text: 'Decorators',
      link: '/api/decorators/',
      items: expanded === 'decorators' ? getDecoratorsSidebar() : getDecoratorsSidebar(),
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
    { text: 'withFreezedOptions', link: '/api/decorators/withFreezedOptions.html' },
    { text: 'withIntersectionObserver', link: '/api/decorators/withIntersectionObserver.html' },
    { text: 'withMountWhenInView', link: '/api/decorators/withMountWhenInView.html' },
    { text: 'withResponsiveOptions', link: '/api/decorators/withResponsiveOptions.html' },
    { text: 'withScrolledInView', link: '/api/decorators/withScrolledInView.html' },
    { text: 'withVue2', link: '/api/decorators/withVue2.html' },
  ];
}

function getHelpersSidebar() {
  return [
    { text: 'createApp', link: '/api/helpers/createApp.html' },
    { text: 'getInstanceFromElement', link: '/api/helpers/getInstanceFromElement.html' },
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
      items: [
        { text: 'debounce', link: '/utils/debounce.html' },
        { text: 'focusTrap', link: '/utils/focusTrap.html' },
        { text: 'keyCodes', link: '/utils/keyCodes.html' },
        { text: 'memoize', link: '/utils/memoize.html' },
        { text: 'nextFrame', link: '/utils/nextFrame.html' },
        { text: 'nextMicrotask', link: '/utils/nextMicrotask.html' },
        { text: 'nextTick', link: '/utils/nextTick.html' },
        { text: 'scrollTo', link: '/utils/scrollTo.html' },
        { text: 'throttle', link: '/utils/throttle.html' },
        { text: 'useScheduler', link: '/utils/useScheduler.html' },
      ],
    },
    {
      text: 'Collision utils',
      link: '/utils/collision/',
      items: [
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
      items: [
        { text: 'addClass', link: '/utils/css/addClass.html' },
        { text: 'addStyle', link: '/utils/css/addStyle.html' },
        { text: 'animate', link: '/utils/css/animate.html' },
        { text: 'getOffsetSizes', link: '/utils/css/getOffsetSizes.html' },
        { text: 'matrix', link: '/utils/css/matrix.html' },
        { text: 'removeClass', link: '/utils/css/removeClass.html' },
        { text: 'removeStyle', link: '/utils/css/removeStyle.html' },
        { text: 'toggleClass', link: '/utils/css/toggleClass.html' },
        { text: 'transform', link: '/utils/css/transform.html' },
        { text: 'transition', link: '/utils/css/transition.html' },
      ],
    },
    {
      text: 'History utils',
      link: '/utils/history/',
      items: [
        { text: 'historyPush', link: '/utils/history/historyPush.html' },
        { text: 'historyReplace', link: '/utils/history/historyReplace.html' },
        { text: 'objectToURLSearchParams', link: '/utils/history/objectToURLSearchParams.html' },
      ],
    },
    {
      text: 'Math utils',
      // link: '/utils/math/',
      items: [
        { text: 'clamp', link: '/utils/math/clamp.html' },
        { text: 'clamp01', link: '/utils/math/clamp01.html' },
        { text: 'createEaseInOut', link: '/utils/math/createEaseInOut.html' },
        { text: 'createEaseOut', link: '/utils/math/createEaseOut.html' },
        { text: 'damp', link: '/utils/math/damp.html' },
        { text: 'ease', link: '/utils/math/ease.html' },
        { text: 'inertiaFinalValue', link: '/utils/math/inertiaFinalValue.html' },
        { text: 'lerp', link: '/utils/math/lerp.html' },
        { text: 'map', link: '/utils/math/map.html' },
        { text: 'round', link: '/utils/math/round.html' },
      ],
    },
    {
      text: 'String utils',
      link: '/utils/string/',
      items: [
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
