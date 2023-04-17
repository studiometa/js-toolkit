# Scroll linked animation

This example demonstrate the usage of the [`scrolled` service](/api/methods-hooks-services.html#scrolled) and the [`ticked` service](/api/methods-hooks-services.html#ticked) to simply add some scroll-linked animations.

<script setup>
  import { onMounted, onUnmounted, nextTick } from 'vue';
  import ScrollLinkedAnimationHtmlRaw from './ScrollLinkedAnimation.html?raw';

  const tabs = [
    {
      label: 'ScrollLinkedAnimation.js',
    },
    {
      label: 'ScrollLinkedAnimation.html',
    },
    {
      label: 'app.js',
    },
  ];

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

<div class="bg-vp-bg-alt rounded">
  <div v-html="ScrollLinkedAnimationHtmlRaw" />
  <p class="text-gray-400 text-xs text-center p-10 mt-10">Pictures from <a href="https://picsum.photos">picsum.photos</a></p>
</div>

<Tabs :items="tabs">
  <template #content-1>

<<< ./guide/recipes/scroll-linked-animation/ScrollLinkedAnimation.js

  </template>
  <template #content-2>

<<< ./guide/recipes/scroll-linked-animation/ScrollLinkedAnimation.html

  </template>
  <template #content-3>

```js
import { Base, createApp } from '@studiometa/js-toolkit';
import ScrollLinkedAnimation from './ScrollLinkedAnimation.js';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      ScrollLinkedAnimation,
    },
  };
}

export default createApp(App, document.body);
```

  </template>
</Tabs>
