<script setup>
  import { ref, onMounted } from 'vue';
  import Theme from 'vitepress/theme';
  import { useKBarHandler } from '@bytebase/vue-kbar';

  const { Layout } = Theme;
  const handler = useKBarHandler();
  const searchIsOpen = ref(false);
  onMounted(() => {
    window.addEventListener('load', () => {
      new PagefindUI({ element: "#pagefind-search" });
    });
  });
</script>

<template>
  <div id="pagefind-search"></div>
  <Layout>
    <template #navbar-search>
      <button
        class="ml-6 px-6 py-2 text-gray-500 text-sm font-medium cursor-pointer rounded-full bg-gray-100 hover:bg-white border-0 ring-2 ring-inset ring-brand ring-opacity-0 hover:ring-opacity-1 focus:ring-opacity-1 focus:outline-none transition"
        @click="searchIsOpen"
      >
        <span class="whitespace-nowrap">Search (⌘+K)</span>
      </button>
    </template>
  </Layout>
</template>

<style type="text/css">
  #pagefind-search {
    position: fixed;
    top: 0;
    left: 0;
    width: 300px;
    height: auto;
  }
</style>
