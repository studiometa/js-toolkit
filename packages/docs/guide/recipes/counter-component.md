# Counter component

Find below the JavaScript and HTML implementation of a counter component.

<script setup>
  import { onMounted, onUnmounted, nextTick } from 'vue';
  import Counter from './Counter.js';
  import CounterRaw from './Counter.js?raw';
  import CounterHtmlRaw from './Counter.html?raw';

  const tabs = [
    {
      label: 'Counter.js',
      lang: 'js',
      content: CounterRaw,
    },
    {
      label: 'Counter.html',
      lang: 'html',
      content: CounterHtmlRaw,
    },
    {
      label: 'App.js',
      lang: 'js',
      content: `
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

export default createApp(App, document.body);
`
    },
  ];
  let counter;
  onMounted(async () => {
    await nextTick();
    [counter] = Counter.$factory('Counter');
  });
  onUnmounted(() => {
    counter.$destroy();
  });
</script>

<div class="my-4 p-10 rounded bg-gray-100 text-center" v-html="CounterHtmlRaw"></div>

<Tabs :items="tabs" />