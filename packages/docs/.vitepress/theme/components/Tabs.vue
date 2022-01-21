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
    <div class="flex bg-code-bg border-0 border-b-2 border-solid border-white border-opacity-20">
      <div v-for="(item, index) in items" :key="item.label">
        <button
          :class="{
            'opacity-50 hover:opacity-100': index !== selectedIndex,
          }"
          class="group relative p-3 py-3 text-sm text-white font-bold cursor-pointer transition bg-transparent appearance-none border-0"
          @click="selectedIndex = index"
        >
          {{ item.label }}
          <span
            :class="{
              'opacity-100': index === selectedIndex,
              'group-hover:opacity-40 opacity-0': index !== selectedIndex,
            }"
            class="absolute inset-0 top-full bg-brand-light transition"
            style="height: 2px"
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
