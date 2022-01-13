<script setup lang="ts">
  import { withBase, useData } from 'vitepress';
  import Badge from './Badge.vue';

  const { site, theme, localePath } = useData();
</script>

<template>
  <div class="flex">
    <a class="nav-bar-title" :href="localePath" :aria-label="`${site.title}, back to home`">
      <img v-if="theme.logo" class="logo" :src="withBase(theme.logo)" alt="Logo" />
      {{ site.title }}
    </a>
    <Badge class="nav-bar-badge">v{{ theme.version }}</Badge>
  </div>
</template>

<style scoped>
  .flex {
    display: flex;
    align-items: center;
  }

  .nav-bar-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--c-text);
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .nav-bar-title:hover {
    text-decoration: none;
  }

  .logo {
    margin-right: 0.75rem;
    height: 1.3rem;
    vertical-align: bottom;
  }

  .nav-bar-badge {
    margin-left: 10px;
  }
</style>
