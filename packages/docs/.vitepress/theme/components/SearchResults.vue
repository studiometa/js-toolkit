<script setup lang="ts">
  import { useKBarMatches, KBarResults } from '@bytebase/vue-kbar';
  import { useRouter } from 'vitepress';

  const router = useRouter();
  // Visit the latest matches
  const matches = useKBarMatches();

  // Tell KBarResults the height of each item will be rendered
  const itemHeight = () => 32;

  function clickHandler(event, item) {
    if (item.id.startsWith('/')) {
      event.preventDefault();
      router.go(item.id);
    } else {
      event.stopPropagation();
    }
  }
</script>

<template>
  <KBarResults :items="matches.results" class="w-full max-h-96 overflow-hidden">
    <!-- KBarResults creates a virtual list to manage mass of actions -->
    <!-- It also reacts to up/down/enter keystroke for activeIndex management -->
    <!-- You still may use your own component if you really want to customize the result list -->
    <template #item="{ item, index, active }">
      <div v-if="typeof item === 'string'" class="p-4 pt-3 pb-1 leading-none">
        <!-- string items are section headers -->
        <!-- now we just render them as plain texts -->
        <small class="uppercase font-bold text-xs">{{ item }}</small>
      </div>
      <a
        v-else
        :href="item.id"
        :target="item.id.startsWith('/') ? '_self' : '_blank'"
        :rel="item.id.startsWith('/') ? undefined : 'noopener'"
        @click="clickHandler($event, item)"
        class="flex justify-between items-center px-4 py-4 leading-none"
        :class="{ 'bg-gray-100': active }"
      >
        {{ item.link.text }}
        <span v-if="active">⏎</span>
      </a>
    </template>
  </KBarResults>
</template>
