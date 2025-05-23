import { defineConfig } from 'vitepress';
import { transformerTwoslash } from '@shikijs/vitepress-twoslash';
import pkg from '../package.json' with { type: 'json' };

export default defineConfig({
  lang: 'en-US',
  title: '@studiometa/js-toolkit',
  description:
    'The JS Toolkit by Studio Meta is a JavaScript data-attributes driven micro-framework shipped with plenty of useful utility functions to boost your project.',
  lastUpdated: true,
  head: [['link', { rel: 'icon', type: 'image/x-icon', href: '/logo.png' }]],
  markdown: {
    codeTransformers: [transformerTwoslash()],
    // Explicitly load these languages for types hightlighting
    languages: ['js', 'jsx', 'ts', 'tsx'],
  },
  themeConfig: {
    outline: 'deep',
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
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/studiometa/js-toolkit' }],
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Utils Reference', link: '/utils/' },
      {
        text: `<span class="VPBadge font-bold bg-[var(--vp-button-brand-bg)] text-[var(--vp-button-brand-text)]">v${pkg.version}</span>`,
        items: [
          {
            text: 'Release Notes',
            link: 'https://github.com/studiometa/js-toolkit/blob/master/CHANGELOG.md',
          },
          { text: 'Demo', link: 'https://studiometa-js-toolkit-demo.netlify.app/' },
          { text: 'v2.x', link: 'https://support-2-x--studiometa-js-toolkit.netlify.app/' },
        ],
      },
    ],
    sidebar: {
      '/guide/': getGuideSidebar(),
      '/api/services/': getApiSidebar({ expanded: 'services' }),
      '/api/decorators/': getApiSidebar({ expanded: 'decorators' }),
      '/api/helpers/': getApiSidebar({ expanded: 'helpers' }),
      '/api/html/': getApiSidebar({ expanded: 'html' }),
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
        {
          text: 'Typing components',
          link: '/guide/going-further/typing-components.html',
          keywords: ['types', 'typings', 'typescript', 'jsdoc'],
        },
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
        {
          text: 'v2 → v3',
          link: '/guide/migration/v2-to-v3.html',
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
      collapsed: true,
      items: expanded === 'api' ? getBaseSidebar() : getBaseSidebar(),
    },
    {
      text: 'HTML',
      link: '/api/html/',
      collapsed: true,
      items: expanded === 'html' ? getHtmlSidebar() : getHtmlSidebar(),
    },
    {
      text: 'Helpers',
      link: '/api/helpers/',
      collapsed: true,
      items: expanded === 'helpers' ? getHelpersSidebar() : getHelpersSidebar(),
    },
    {
      text: 'Services',
      link: '/api/services/',
      collapsed: true,
      items: expanded === 'services' ? getServicesSidebar() : getServicesSidebar(),
    },
    {
      text: 'Decorators',
      link: '/api/decorators/',
      collapsed: true,
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

function getHtmlSidebar() {
  return [
    { text: 'data-component', link: '/api/html/data-component.html' },
    { text: 'data-ref', link: '/api/html/data-ref.html' },
    { text: 'data-option-<​name>', link: '/api/html/data-option.html' },
  ];
}

function getServicesSidebar() {
  return [
    { text: 'useDrag', link: '/api/services/useDrag.html' },
    { text: 'useKey', link: '/api/services/useKey.html' },
    { text: 'useLoad', link: '/api/services/useLoad.html' },
    { text: 'useMutation', link: '/api/services/useMutation.html' },
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
    { text: 'withMountOnMediaQuery', link: '/api/decorators/withMountOnMediaQuery.html' },
    { text: 'withMountWhenInView', link: '/api/decorators/withMountWhenInView.html' },
    { text: 'withMountWhenPrefersMotion', link: '/api/decorators/withMountWhenPrefersMotion.html' },
    { text: 'withMutation', link: '/api/decorators/withMutation.html' },
    { text: 'withRelativePointer', link: '/api/decorators/withRelativePointer.html' },
    { text: 'withResponsiveOptions', link: '/api/decorators/withResponsiveOptions.html' },
    { text: 'withScrolledInView', link: '/api/decorators/withScrolledInView.html' },
  ];
}

function getHelpersSidebar() {
  return [
    { text: 'createApp', link: '/api/helpers/createApp.html' },
    { text: 'getClosestParent', link: '/api/helpers/getClosestParent.html' },
    { text: 'getDirectChildren', link: '/api/helpers/getDirectChildren.html' },
    { text: 'getInstanceFromElement', link: '/api/helpers/getInstanceFromElement.html' },
    { text: 'getInstances', link: '/api/helpers/getInstances.html' },
    { text: 'importOnInteraction', link: '/api/helpers/importOnInteraction.html' },
    { text: 'importOnMediaQuery', link: '/api/helpers/importOnMediaQuery.html' },
    { text: 'importWhenIdle', link: '/api/helpers/importWhenIdle.html' },
    { text: 'importWhenPrefersMotion', link: '/api/helpers/importWhenPrefersMotion.html' },
    { text: 'importWhenVisible', link: '/api/helpers/importWhenVisible.html' },
    { text: 'isDirectChild', link: '/api/helpers/isDirectChild.html' },
  ];
}

function getUtilsSidebar() {
  return [
    {
      text: 'Utils',
      link: '/utils/',
      collapsed: true,
      items: [
        { text: 'cache', link: '/utils/cache.html' },
        { text: 'createElement', link: '/utils/createElement.html' },
        { text: 'debounce', link: '/utils/debounce.html' },
        { text: 'domScheduler', link: '/utils/domScheduler.html' },
        { text: 'keyCodes', link: '/utils/keyCodes.html' },
        { text: 'loadElement', link: '/utils/loadElement.html' },
        { text: 'loadIframe', link: '/utils/loadIframe.html' },
        { text: 'loadImage', link: '/utils/loadImage.html' },
        { text: 'loadLink', link: '/utils/loadLink.html' },
        { text: 'loadScript', link: '/utils/loadScript.html' },
        { text: 'memo', link: '/utils/memo.html' },
        { text: 'memoize', link: '/utils/memoize.html' },
        { text: 'nextFrame', link: '/utils/nextFrame.html' },
        { text: 'nextMicrotask', link: '/utils/nextMicrotask.html' },
        { text: 'nextTick', link: '/utils/nextTick.html' },
        { text: 'Queue', link: '/utils/Queue.html' },
        { text: 'randomInt', link: '/utils/randomInt.html' },
        { text: 'randomItem', link: '/utils/randomItem.html' },
        { text: 'scrollTo', link: '/utils/scrollTo.html' },
        { text: 'SmartQueue', link: '/utils/SmartQueue.html' },
        { text: 'throttle', link: '/utils/throttle.html' },
        { text: 'trapFocus', link: '/utils/trapFocus.html' },
        { text: 'tween', link: '/utils/tween.html' },
        { text: 'useScheduler', link: '/utils/useScheduler.html' },
      ],
    },
    {
      text: 'Value utils',
      link: '/utils/is/',
      collapsed: true,
      items: [
        { text: 'isArray', link: '/utils/is/isArray.html' },
        { text: 'isBoolean', link: '/utils/is/isBoolean.html' },
        { text: 'isDefined', link: '/utils/is/isDefined.html' },
        { text: 'isEmpty', link: '/utils/is/isEmpty.html' },
        { text: 'isEmptyString', link: '/utils/is/isEmptyString.html' },
        { text: 'isNull', link: '/utils/is/isNull.html' },
        { text: 'isDev', link: '/utils/is/isDev.html' },
        { text: 'isFunction', link: '/utils/is/isFunction.html' },
        { text: 'isNumber', link: '/utils/is/isNumber.html' },
        { text: 'isObject', link: '/utils/is/isObject.html' },
        { text: 'isString', link: '/utils/is/isString.html' },
      ],
    },
    {
      text: 'Collision utils',
      link: '/utils/collision/',
      collapsed: true,
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
      collapsed: true,
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
      collapsed: true,
      items: [
        { text: 'historyPush', link: '/utils/history/historyPush.html' },
        { text: 'historyReplace', link: '/utils/history/historyReplace.html' },
        { text: 'objectToURLSearchParams', link: '/utils/history/objectToURLSearchParams.html' },
      ],
    },
    {
      text: 'Math utils',
      // link: '/utils/math/',
      collapsed: true,
      items: [
        { text: 'clamp', link: '/utils/math/clamp.html' },
        { text: 'clamp01', link: '/utils/math/clamp01.html' },
        { text: 'createEaseInOut', link: '/utils/math/createEaseInOut.html' },
        { text: 'createEaseOut', link: '/utils/math/createEaseOut.html' },
        { text: 'createRange', link: '/utils/math/createRange.html' },
        { text: 'damp', link: '/utils/math/damp.html' },
        { text: 'ease', link: '/utils/math/ease.html' },
        { text: 'inertiaFinalValue', link: '/utils/math/inertiaFinalValue.html' },
        { text: 'lerp', link: '/utils/math/lerp.html' },
        { text: 'map', link: '/utils/math/map.html' },
        { text: 'mean', link: '/utils/math/mean.html' },
        { text: 'round', link: '/utils/math/round.html' },
      ],
    },
    {
      text: 'String utils',
      link: '/utils/string/',
      collapsed: true,
      items: [
        { text: 'camelCase', link: '/utils/string/camelCase.html' },
        { text: 'dashCase', link: '/utils/string/dashCase.html' },
        { text: 'pascalCase', link: '/utils/string/pascalCase.html' },
        { text: 'snakeCase', link: '/utils/string/snakeCase.html' },
        { text: 'lowerCase', link: '/utils/string/lowerCase.html' },
        { text: 'upperCase', link: '/utils/string/upperCase.html' },
        { text: 'startsWith', link: '/utils/string/startsWith.html' },
        { text: 'endsWith', link: '/utils/string/endsWith.html' },
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
