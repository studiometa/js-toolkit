<script setup>
  import { ref, unref, computed } from 'vue';
  import Prism from 'prismjs';
  const { items } = defineProps({ items: Array });

  const selectedIndex = ref(0);
  const selectedItem = computed(() => items[unref(selectedIndex)]);

  const renderedContent = computed(() => {
    const item = unref(selectedItem);

    if (!item.lang) {
      return item.content;
    }

    const language = Prism.languages[item.lang];
    return Prism.highlight(item.content, language, item.lang);
  });
</script>

<template>
  <div class="my-4 rounded-md overflow-hidden">
    <div
      class="flex pt-3 px-6 bg-code-bg border-0 border-b border-solid border-white border-opacity-20"
    >
      <div v-for="(item, index) in items" :key="item.label">
        <button
          :class="{
            'opacity-50 hover:opacity-80': index !== selectedIndex,
          }"
          class="relative px-6 py-3 text-sm font-medium cursor-pointer text-white transition rounded-t bg-transparent appearance-none border-0"
          @click="selectedIndex = index"
        >
          {{ item.label }}
          <span
            v-if="index === selectedIndex"
            class="absolute inset-0 rounded-t border border-b-0 border-solid border-white opacity-20"
          ></span>
          <span
            :class="{ 'opacity-0': index !== selectedIndex }"
            class="absolute top-full left-px right-px h-px bg-code-bg"
          ></span>
        </button>
      </div>
    </div>
    <div :class="`language-${selectedItem.lang}`">
      <pre><code v-html="renderedContent"></code></pre>
    </div>
  </div>
</template>

<style scoped>
  div[class*='language-'] {
    margin: 0;
    border-radius: 0;
  }
</style>
