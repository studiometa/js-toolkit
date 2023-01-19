<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import Loader from './Loader.vue';
  import useObserver from '../composables/useObserver.js';

  const { src } = defineProps({
    src: String,
  });

  const isLoading = ref(true);
  const iframe = ref();

  function onLoad() {
    isLoading.value = false;
    iframe.value.contentDocument.documentElement.classList.add('story');
  }

  onMounted(() => {
    const { observe, cleanup } = useObserver((mutations) => {
      mutations
        .filter((mutation) => {
          return (
            mutation.target === document.documentElement &&
            mutation.type === 'attributes' &&
            mutation.attributeName === 'class'
          );
        })
        .forEach((mutation) => {
          iframe.value.contentDocument.documentElement.classList.toggle(
            'dark',
            mutation.oldValue !== 'dark',
          );
        });
    });

    observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
      attributeOldValue: true,
    });

    onUnmounted(() => {
      cleanup();
    });
  });
</script>

<template>
  <div
    class="relative my-4 rounded bg-vp-sidebar-bg overflow-hidden"
    style="height: 60vh; border: 1px solid var(--vp-c-divider)"
  >
    <Loader v-if="isLoading" />
    <iframe
      ref="iframe"
      @load="onLoad"
      class="block border-0 bg-vp-sidebar-bg transition duration-300"
      :class="{ 'opacity-0': isLoading }"
      :src="src"
      width="100%"
      style="
        width: calc(100% * 1.5);
        height: calc(60vh * 1.5);
        transform-origin: top left;
        transform: scale(0.6666);
      "
    />
  </div>
</template>
