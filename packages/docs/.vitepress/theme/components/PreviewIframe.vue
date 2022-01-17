<script setup lang="ts">
  import { ref } from 'vue';
  import Loader from './Loader.vue';

  const { src } = defineProps({
    src: String,
  });

  const isLoading = ref(true);
</script>

<template>
  <div class="relative my-4 rounded bg-gray-100 overflow-hidden">
    <Loader v-if="isLoading" />
    <iframe
      @load="isLoading = false"
      class="block border-0 bg-gray-100 transition duration-300"
      :class="{ 'opacity-0': isLoading }"
      :src="src"
      width="100%"
      style="height: 60vh"
    />
  </div>
</template>
