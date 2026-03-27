# Utils

A collection of tree-shakeable utility functions to help you build interactive components. Only the functions you import are included in your bundle.

## Most commonly used

| Function | Description |
|---|---|
| [`animate`](/utils/css/animate.html) | Animate CSS properties with easing |
| [`transition`](/utils/css/transition.html) | CSS transition helper (enter/leave) |
| [`tween`](/utils/tween.html) | Tween numeric values over time |
| [`scrollTo`](/utils/scrollTo.html) | Smooth scroll to an element or position |
| [`debounce`](/utils/debounce.html) / [`throttle`](/utils/throttle.html) | Rate-limit function calls |
| [`lerp`](/utils/math/lerp.html) / [`damp`](/utils/math/damp.html) | Linear interpolation and damping |
| [`addClass`](/utils/css/addClass.html) / [`removeClass`](/utils/css/removeClass.html) | Class manipulation helpers |
| [`createStorage`](/utils/storage/createStorage.html) | Browser storage with unified API |
| [`nextFrame`](/utils/nextFrame.html) / [`nextTick`](/utils/nextTick.html) | Scheduling helpers |

## All utilities by category

<script setup>
  import { useData } from 'vitepress';

  const { theme } = useData();
  const sidebar = theme.value.sidebar['/utils/'];
</script>

<template v-for="section in sidebar">

### {{ section.text }}

<ul>
  <li v-for="link in section.items" :key="link.link">
    <a :href="link.link">{{ link.text }}</a>
  </li>
</ul>

</template>
