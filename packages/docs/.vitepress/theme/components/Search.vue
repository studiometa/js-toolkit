<script setup lang="ts">
  import { ref, unref, computed } from 'vue';
  import {
    KBarProvider,
    KBarPortal,
    KBarPositioner,
    KBarAnimator,
    KBarSearch,
    defineAction,
  } from '@bytebase/vue-kbar';
  import { useRouter, useRoute } from 'vitepress';
  import { useAllLinks } from '../composables/useAllLinks.ts';
  import SearchResults from './SearchResults.vue';

  const router = useRouter();
  const { links } = useAllLinks();

  function createHeaderLink(text, link, parent) {
    return {
      text,
      link: parent.link + '#' + link,
      parent,
    };
  }

  const parents = {
    configuration: {
      text: 'API Reference → Base class → Configuration',
      link: '/api/configuration.html',
    },
    lifecycleHooks: {
      text: 'API Reference → Base class → Lifecycle hooks',
      link: '/api/methods-hooks-lifecycle.html',
    },
    servicesHooks: {
      text: 'API Reference → Base class → Services hooks',
      link: '/api/methods-hooks-services.html',
    },
    eventsHooks: {
      text: 'API Reference → Base class → Events hooks',
      link: '/api/methods-hooks-events.html',
    },
    instanceProperties: {
      text: 'API Reference → Base class → Instance properties',
      link: '/api/instance-properties.html',
    },
    instanceMethods: {
      text: 'API Reference → Base class → Instance methods',
      link: '/api/instance-methods.html',
    },
    instanceEvents: {
      text: 'API Reference → Base class → Instance events',
      link: '/api/instance-events.html',
    },
    staticMethods: {
      text: 'API Reference → Base class → Static methods',
      link: '/api/static-methods.html',
    },
  };

  const headers = [
    // Configuration
    createHeaderLink('config.name', 'config-name', parents.configuration),
    createHeaderLink('config.options', 'config-options', parents.configuration),
    createHeaderLink('config.components', 'config-components', parents.configuration),
    createHeaderLink('config.refs', 'config-refs', parents.configuration),
    createHeaderLink('config.emits', 'config-emits', parents.configuration),
    createHeaderLink('config.log', 'config-log', parents.configuration),
    createHeaderLink('config.debug', 'config-debug', parents.configuration),
    // Lifecycle hooks
    createHeaderLink('mounted', 'mounted', parents.lifecycleHooks),
    createHeaderLink('updated', 'updated', parents.lifecycleHooks),
    createHeaderLink('destroyed', 'destroyed', parents.lifecycleHooks),
    createHeaderLink('terminated', 'terminated', parents.lifecycleHooks),
    // Services hooks
    createHeaderLink('scrolled', 'scrolled', parents.servicesHooks),
    createHeaderLink('resized', 'resized', parents.servicesHooks),
    createHeaderLink('keyed', 'keyed', parents.servicesHooks),
    createHeaderLink('moved', 'moved', parents.servicesHooks),
    createHeaderLink('ticked', 'ticked', parents.servicesHooks),
    createHeaderLink('loaded', 'loaded', parents.servicesHooks),
    // Events hooks
    createHeaderLink('on<Event>', 'on-event', parents.eventsHooks),
    createHeaderLink('on<RefOrChildName><Event>', 'on-reforchildname-event', parents.eventsHooks),
    // Instance properties
    createHeaderLink('$options', 'options', parents.instanceProperties),
    createHeaderLink('$refs', 'refs', parents.instanceProperties),
    createHeaderLink('$children', 'children', parents.instanceProperties),
    createHeaderLink('$parent', 'parent', parents.instanceProperties),
    createHeaderLink('$root', 'root', parents.instanceProperties),
    createHeaderLink('$services', 'services', parents.instanceProperties),
    // Instance methods
    createHeaderLink('$log(...content)', 'log-content', parents.instanceMethods),
    createHeaderLink(
      '$on(event, callback[, options])',
      'on-event-callback-options',
      parents.instanceMethods,
    ),
    createHeaderLink(
      '$off(event, callback[, options])',
      'off-event-callback-options',
      parents.instanceMethods,
    ),
    createHeaderLink('$emit(event[, ...args])', 'emit-event-args', parents.instanceMethods),
    createHeaderLink('$mount()', 'mount', parents.instanceMethods),
    createHeaderLink('$update()', 'update', parents.instanceMethods),
    createHeaderLink('$destroy()', 'destroy', parents.instanceMethods),
    createHeaderLink('$terminate()', 'terminate', parents.instanceMethods),
    // Instance events
    createHeaderLink('mounted', 'mounted', parents.instanceEvents),
    createHeaderLink('updated', 'updated', parents.instanceEvents),
    createHeaderLink('destroyed', 'destroyed', parents.instanceEvents),
    createHeaderLink('terminated', 'terminated', parents.instanceEvents),
    createHeaderLink('keyed', 'keyed', parents.instanceEvents),
    createHeaderLink('loaded', 'loaded', parents.instanceEvents),
    createHeaderLink('moved', 'moved', parents.instanceEvents),
    createHeaderLink('resized', 'resized', parents.instanceEvents),
    createHeaderLink('scrolled', 'scrolled', parents.instanceEvents),
    createHeaderLink('ticked', 'ticked', parents.instanceEvents),
    // Static methods
    createHeaderLink('$factory(nameOrSelector)', 'factory-nameorselector', parents.staticMethods),
  ];

  const actions = computed(() => {
    return unref(links)
      .concat(headers)
      .map((link) =>
        defineAction({
          id: link.link,
          name: [link.text, link.parent?.text ?? '', link.root?.text ?? ''].join(' '),
          link,
          section: link.parent
            ? link.root
              ? [link.root.text, link.parent.text].join(' → ')
              : link.parent.text
            : link.link.startsWith('/')
            ? 'Documentation'
            : 'External',
          perform: link.link.startsWith('/')
            ? async () => {
                await router.go(link.link);
                const activeSidebarLink = document.querySelector('.sidebar-link-item.active');
                if (activeSidebarLink && typeof activeSidebarLink.scrollIntoView === 'function') {
                  activeSidebarLink.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }
            : () => (window.location.href = link.link),
        }),
      );
  });
</script>

<template>
  <KBarProvider :actions="actions" :options="{ placeholder: 'Search docs' }">
    <ClientOnly>
      <KBarPortal>
        <KBarPositioner class="z-goku">
          <div class="z-under absolute inset-0 bg-vp-text-1 dark:bg-vp-bg-soft opacity-80"></div>
          <KBarAnimator
            class="bg-vp-bg shadow-lg rounded-lg w-full h-full max-w-lg max-h-lg overflow-hidden divide-y"
          >
            <KBarSearch class="p-4 text-lg w-full box-border outline-none border-none" />
            <SearchResults />
            <!-- see below -->
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
    </ClientOnly>

    <!-- you application entrance here -->
    <slot />
  </KBarProvider>
</template>
