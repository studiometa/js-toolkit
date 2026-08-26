import { defineConfig } from 'vitepress';
import { createTwoslashWithInlineCache } from '@shikijs/vitepress-twoslash/cache-inline';

const withTwoslashInlineCache = createTwoslashWithInlineCache();

export default withTwoslashInlineCache(
  defineConfig({
    vite: {
      build: {
        chunkSizeWarningLimit: 600,
      },
    },
    lang: 'en-US',
    title: '@studiometa/js-toolkit v4',
    description:
      'v4 of the JS Toolkit by Studio Meta: one registry, one mutation engine and one scheduler behind a data-attributes driven micro-framework.',
    lastUpdated: true,
    head: [['link', { rel: 'icon', type: 'image/x-icon', href: '/logo.png' }]],
    markdown: {
      // Explicitly load these languages for types hightlighting
      languages: ['js', 'jsx', 'ts', 'tsx', 'bash', 'html'],
    },
    themeConfig: {
      outline: 'deep',
      repo: 'studiometa/js-toolkit',
      docsDir: 'packages/v4/docs',
      lastUpdated: {
        text: 'Last updated',
      },
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
        { text: 'Concepts', link: '/guide/concepts/philosophy.html' },
        {
          text: `<span class="VPBadge font-bold bg-[var(--vp-button-brand-bg)] text-[var(--vp-button-brand-text)]">v4</span>`,
          items: [
            { text: 'Migrating from v3', link: '/guide/migration/v3-to-v4.html' },
            {
              text: 'Design document',
              link: 'https://github.com/studiometa/js-toolkit/blob/main/packages/v4/DESIGN.md',
            },
            {
              text: 'Rationale',
              link: 'https://github.com/studiometa/js-toolkit/blob/main/packages/v4/RATIONALE.md',
            },
            { text: 'v3.x documentation', link: 'https://js-toolkit.studiometa.dev/' },
          ],
        },
      ],
      sidebar: {
        '/guide/': getGuideSidebar(),
        '/api/html/': getApiSidebar({ expanded: 'html' }),
        '/api/registry/': getApiSidebar({ expanded: 'registry' }),
        '/api/context/': getApiSidebar({ expanded: 'context' }),
        '/api/services/': getApiSidebar({ expanded: 'services' }),
        '/api/decorators/': getApiSidebar({ expanded: 'decorators' }),
        '/api/scheduler/': getApiSidebar({ expanded: 'scheduler' }),
        '/api/dom/': getApiSidebar({ expanded: 'dom' }),
        '/api/storage/': getApiSidebar({ expanded: 'storage' }),
        '/api/diagnostics/': getApiSidebar({ expanded: 'diagnostics' }),
        '/api/test/': getApiSidebar({ expanded: 'test' }),
        '/api/': getApiSidebar({ expanded: 'api' }),
        '/utils/': getUtilsSidebar(),
      },
    },
  }),
);

function getGuideSidebar() {
  return [
    { text: 'Getting Started', link: '/guide/' },
    { text: 'Installation', link: '/guide/introduction/installation.html' },
    { text: 'Components', link: '/guide/introduction/managing-components.html' },
    { text: 'Refs', link: '/guide/introduction/managing-refs.html' },
    { text: 'Options', link: '/guide/introduction/managing-options.html' },
    { text: 'Lifecycle', link: '/guide/introduction/lifecycle-hooks.html' },
    { text: 'Events', link: '/guide/introduction/working-with-events.html' },
    { text: 'Services', link: '/guide/introduction/using-services.html' },
    {
      text: 'Going further',
      collapsed: false,
      items: [
        { text: 'Mount strategies', link: '/guide/going-further/mount-strategies.html' },
        { text: 'Autoloading', link: '/guide/going-further/autoloading.html' },
        { text: 'Shared state', link: '/guide/going-further/sharing-state.html' },
        { text: 'Decorators', link: '/guide/going-further/using-decorators.html' },
        { text: 'The scheduler', link: '/guide/going-further/scheduling-work.html' },
        { text: 'Swapping content', link: '/guide/going-further/swapping-content.html' },
        { text: 'Storage', link: '/guide/going-further/using-storage.html' },
        { text: 'Diagnostics', link: '/guide/going-further/handling-diagnostics.html' },
        { text: 'Testing', link: '/guide/going-further/testing-components.html' },
        {
          text: 'TypeScript',
          link: '/guide/going-further/typing-components.html',
          keywords: ['types', 'typings', 'typescript', 'jsdoc'],
        },
      ],
    },
    {
      text: 'Concepts',
      collapsed: false,
      items: [
        { text: 'Philosophy', link: '/guide/concepts/philosophy.html' },
        { text: 'The registry', link: '/guide/concepts/the-registry.html' },
        { text: 'The attribute grammar', link: '/guide/concepts/attribute-grammar.html' },
        { text: 'The mutation engine', link: '/guide/concepts/mutation-engine.html' },
      ],
    },
    {
      text: 'Migration',
      collapsed: false,
      items: [{ text: 'v3 → v4', link: '/guide/migration/v3-to-v4.html' }],
    },
  ];
}

function getApiSidebar({ expanded = 'api' } = {}) {
  return [
    {
      text: 'Base class',
      link: '/api/',
      collapsed: expanded !== 'api',
      items: getBaseSidebar(),
    },
    {
      text: 'HTML',
      link: '/api/html/',
      collapsed: expanded !== 'html',
      items: getHtmlSidebar(),
    },
    {
      text: 'Registry',
      link: '/api/registry/',
      collapsed: expanded !== 'registry',
      items: getRegistrySidebar(),
    },
    {
      text: 'Shared state',
      link: '/api/context/',
      collapsed: expanded !== 'context',
      items: getContextSidebar(),
    },
    {
      text: 'Services',
      link: '/api/services/',
      collapsed: expanded !== 'services',
      items: getServicesSidebar(),
    },
    {
      text: 'Decorators',
      link: '/api/decorators/',
      collapsed: expanded !== 'decorators',
      items: getDecoratorsSidebar(),
    },
    {
      text: 'Scheduler',
      link: '/api/scheduler/',
      collapsed: expanded !== 'scheduler',
      items: getSchedulerSidebar(),
    },
    {
      text: 'DOM',
      link: '/api/dom/',
      collapsed: expanded !== 'dom',
      items: getDomSidebar(),
    },
    {
      text: 'Storage',
      link: '/api/storage/',
      collapsed: expanded !== 'storage',
      items: getStorageSidebar(),
    },
    {
      text: 'Diagnostics',
      link: '/api/diagnostics/',
      collapsed: expanded !== 'diagnostics',
      items: getDiagnosticsSidebar(),
    },
    {
      text: 'Testing',
      link: '/api/test/',
      collapsed: expanded !== 'test',
      items: getTestSidebar(),
    },
  ];
}

function getBaseSidebar() {
  return [
    { text: 'Configuration', link: '/api/configuration.html' },
    { text: 'Lifecycle hooks', link: '/api/methods-hooks-lifecycle.html' },
    { text: 'Options hooks', link: '/api/methods-hooks-options.html' },
    { text: 'Events hooks', link: '/api/methods-hooks-events.html' },
    { text: 'Services hooks', link: '/api/methods-hooks-services.html' },
    { text: 'Instance properties', link: '/api/instance-properties.html' },
    { text: 'Instance methods', link: '/api/instance-methods.html' },
    { text: 'Instance events', link: '/api/instance-events.html' },
  ];
}

function getHtmlSidebar() {
  return [
    { text: 'data-component', link: '/api/html/data-component.html' },
    { text: 'data-mount', link: '/api/html/data-mount.html' },
    { text: 'data-ref', link: '/api/html/data-ref.html' },
    { text: 'data-option-<​name>', link: '/api/html/data-option.html' },
  ];
}

function getRegistrySidebar() {
  return [
    { text: 'registerComponent', link: '/api/registry/registerComponent.html' },
    { text: 'registerComponents', link: '/api/registry/registerComponents.html' },
    { text: 'registerManifest', link: '/api/registry/registerManifest.html' },
    { text: 'defineManifest', link: '/api/registry/defineManifest.html' },
    { text: 'fromMetaGlob', link: '/api/registry/fromMetaGlob.html' },
    { text: 'fromWebpackContext', link: '/api/registry/fromWebpackContext.html' },
    { text: 'getInstance', link: '/api/registry/getInstance.html' },
    { text: 'getInstances', link: '/api/registry/getInstances.html' },
    { text: 'getMountedInstances', link: '/api/registry/getMountedInstances.html' },
    { text: 'getUnmountedInstances', link: '/api/registry/getUnmountedInstances.html' },
  ];
}

function getContextSidebar() {
  return [
    { text: 'createContext', link: '/api/context/createContext.html' },
    { text: 'signal', link: '/api/context/signal.html' },
    { text: 'provideContext', link: '/api/context/provideContext.html' },
    { text: 'provideRootContext', link: '/api/context/provideRootContext.html' },
    { text: 'injectContext', link: '/api/context/injectContext.html' },
    { text: 'injectContextSync', link: '/api/context/injectContextSync.html' },
    { text: 'subscribeContext', link: '/api/context/subscribeContext.html' },
    { text: 'createGroup', link: '/api/context/createGroup.html' },
  ];
}

function getServicesSidebar() {
  return [
    { text: 'useRaf', link: '/api/services/useRaf.html' },
    { text: 'useScroll', link: '/api/services/useScroll.html' },
    { text: 'useWindowScroll', link: '/api/services/useWindowScroll.html' },
    { text: 'useScrollProgress', link: '/api/services/useScrollProgress.html' },
    { text: 'useResize', link: '/api/services/useResize.html' },
    { text: 'useWindowSize', link: '/api/services/useWindowSize.html' },
    { text: 'usePointer', link: '/api/services/usePointer.html' },
    { text: 'useDrag', link: '/api/services/useDrag.html' },
    { text: 'useKey', link: '/api/services/useKey.html' },
    { text: 'useInView', link: '/api/services/useInView.html' },
    { text: 'useMutation', link: '/api/services/useMutation.html' },
    { text: 'useBreakpoint', link: '/api/services/useBreakpoint.html' },
    { text: 'useMediaQuery', link: '/api/services/useMediaQuery.html' },
    { text: 'usePrefersReducedMotion', link: '/api/services/usePrefersReducedMotion.html' },
    { text: 'Mixins (with*)', link: '/api/services/mixins.html' },
    { text: 'createService', link: '/api/services/createService.html' },
    { text: 'createServiceMixin', link: '/api/services/createServiceMixin.html' },
    { text: 'perTarget', link: '/api/services/perTarget.html' },
    { text: 'toggle', link: '/api/services/toggle.html' },
    { text: 'until', link: '/api/services/until.html' },
  ];
}

function getDecoratorsSidebar() {
  return [
    { text: '@component', link: '/api/decorators/component.html' },
    { text: '@on', link: '/api/decorators/on.html' },
    { text: '@provide', link: '/api/decorators/provide.html' },
    { text: '@inject', link: '/api/decorators/inject.html' },
    { text: '@children', link: '/api/decorators/children.html' },
    { text: '@read / @write', link: '/api/decorators/read-write.html' },
  ];
}

function getSchedulerSidebar() {
  return [
    { text: 'defaultScheduler', link: '/api/scheduler/defaultScheduler.html' },
    { text: 'nextFrame', link: '/api/scheduler/nextFrame.html' },
    { text: 'viewTransition', link: '/api/scheduler/viewTransition.html' },
  ];
}

function getDomSidebar() {
  return [
    { text: 'swap', link: '/api/dom/swap.html' },
    { text: 'domUpdate', link: '/api/dom/domUpdate.html' },
    { text: 'emitExtendable', link: '/api/dom/emitExtendable.html' },
    { text: 'watchAttributes', link: '/api/dom/watchAttributes.html' },
    { text: 'watchAttributeNamespace', link: '/api/dom/watchAttributeNamespace.html' },
    { text: 'whenDOMSettled', link: '/api/dom/whenDOMSettled.html' },
    { text: 'Breakpoints', link: '/api/dom/breakpoints.html' },
  ];
}

function getStorageSidebar() {
  return [
    { text: 'createStorage', link: '/api/storage/createStorage.html' },
    { text: 'Presets', link: '/api/storage/presets.html' },
    { text: 'Providers', link: '/api/storage/providers.html' },
  ];
}

function getDiagnosticsSidebar() {
  return [
    { text: 'EVENTS', link: '/api/diagnostics/EVENTS.html' },
    { text: 'DIAGNOSTICS', link: '/api/diagnostics/DIAGNOSTICS.html' },
    { text: 'reportDiagnostic', link: '/api/diagnostics/reportDiagnostic.html' },
    { text: 'warn', link: '/api/diagnostics/warn.html' },
  ];
}

function getTestSidebar() {
  return [{ text: 'Test helpers', link: '/api/test/' }];
}

function getUtilsSidebar() {
  return [
    { text: 'Overview', link: '/utils/' },
    { text: 'Type guards', link: '/utils/is.html' },
    { text: 'Strings', link: '/utils/strings.html' },
    { text: 'Math', link: '/utils/math.html' },
    { text: 'Easings', link: '/utils/easings.html' },
    { text: 'Motion', link: '/utils/motion.html' },
    { text: 'CSS', link: '/utils/css.html' },
    { text: 'Transitions', link: '/utils/transitions.html' },
    { text: 'DOM', link: '/utils/dom.html' },
    { text: 'Focus', link: '/utils/focus.html' },
    { text: 'Scroll', link: '/utils/scroll.html' },
    { text: 'History', link: '/utils/history.html' },
    { text: 'Loading', link: '/utils/load.html' },
    { text: 'Timing', link: '/utils/timing.html' },
    { text: 'Objects & random', link: '/utils/objects.html' },
  ];
}
