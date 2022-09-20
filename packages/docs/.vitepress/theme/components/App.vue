<script setup>
  import Theme from 'vitepress/theme';
  import { useKBarHandler } from '@bytebase/vue-kbar';

  const { Layout } = Theme;
  const handler = useKBarHandler();
</script>

<template>
  <Layout>
    <template #navbar-search>
      <button
        class="ml-6 px-6 py-2 text-gray-500 text-sm font-medium cursor-pointer rounded-full bg-gray-100 hover:bg-white border-0 ring-2 ring-inset ring-brand ring-opacity-0 hover:ring-opacity-1 focus:ring-opacity-1 focus:outline-none transition"
        @click="handler.show"
      >
        <span class="whitespace-nowrap">Search (⌘+K)</span>
      </button>
    </template>
  </Layout>
</template>
