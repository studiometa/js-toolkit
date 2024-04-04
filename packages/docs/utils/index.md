# Utils

Find below functions that can help you in your projects.

<script setup>
  import { useData } from 'vitepress';

  const { theme } = useData();
  const sidebar = theme.value.sidebar['/utils/'];
</script>

<template v-for="section in sidebar">

## {{ section.text }}

<ul>
  <li v-for="link in section.items" :key="link.link">
    <a :href="link.link">{{ link.text }}</a>
  </li>
</ul>

</template>
