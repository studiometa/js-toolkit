<script setup>
  import { ref, unref, computed } from 'vue';
  const { items } = defineProps({ items: Array });

  const selectedIndex = ref(0);
</script>

<template>
  <div class="my-4 rounded-md overflow-hidden">
    <div class="flex bg-vp-code-block-bg border-0 border-b-2 border-solid border-white border-opacity-20 transition duration-500">
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
    <div class="tabs__content" v-for="(item, index) in items" :key="item.label + 'content'" v-show="index === selectedIndex">
      <slot :name="`content-${index + 1}`" />
    </div>
  </div>
</template>

<style>
  .tabs__content div[class*='language-'] {
    margin: 0 !important;
    border-radius: 0;
  }
</style>
