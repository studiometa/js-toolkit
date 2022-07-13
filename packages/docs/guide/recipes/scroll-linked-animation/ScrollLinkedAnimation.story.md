---
sidebar: false
navbar: false
layout: page
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
<p class="text-gray-400 text-xs text-center p-10">Pictures from <a href="https://picsum.photos">picsum.photos</a></p>

<style>
  body {
    @apply bg-gray-100;
  }

  .VPNav,
  .VPFooter {
    display: none !important;
  }

  .VPContent {
    padding: 2rem !important;
  }
</style>
