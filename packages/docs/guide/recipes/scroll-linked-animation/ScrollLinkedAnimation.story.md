---
sidebar: false
navbar: false
customLayout: true
---

<script setup>
  import { onMounted, onUnmounted, nextTick } from 'vue';
  import ScrollLinkedAnimationHtmlRaw from './ScrollLinkedAnimation.html?raw';

  let scrollLinkedAnimations;
  onMounted(async () => {
    const { default: ScrollLinkedAnimation } = await import('./ScrollLinkedAnimation.js');
    await nextTick();
    scrollLinkedAnimations = ScrollLinkedAnimation.$factory('ScrollLinkedAnimation');
  });
  onUnmounted(() => {
    scrollLinkedAnimations.forEach(instance => instance.$destroy());
  });
</script>

<div class="rounded bg-gray-100 text-center" v-html="ScrollLinkedAnimationHtmlRaw"></div>

<style>
  html {
    @apply bg-gray-100;
  }
</style>
