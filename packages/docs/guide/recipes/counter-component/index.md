# Counter component

Find below the JavaScript and HTML implementation of a counter component.

<script setup>
  import { onMounted, onUnmounted, nextTick } from 'vue';
  import CounterHtmlRaw from './Counter.html?raw';

  const tabs = [
    {
      label: 'Counter.js',
    },
    {
      label: 'Counter.html',
    },
    {
      label: 'app.js',
    },
  ];
  let counter;
  onMounted(async () => {
    const { default: Counter } = await import('./Counter.js');
    await nextTick();
    [counter] = Counter.$register();
  });
  onUnmounted(() => {
    counter.$destroy();
  });
</script>

<div class="my-4 p-10 rounded bg-vp-bg-alt text-center" v-html="CounterHtmlRaw"></div>

::: code-group

<<< ./Counter.js

<<< ./Counter.html

```js [app.js]
import { Base, createApp } from '@studiometa/js-toolkit';
import Counter from './Counter.js';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Counter,
    },
  };
}

export default createApp(App);
```

:::
