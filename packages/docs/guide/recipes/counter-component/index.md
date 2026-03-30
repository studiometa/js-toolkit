# Counter component

Find below the JavaScript and HTML implementation of a counter component.

<script setup>
  import { onMounted, onUnmounted, nextTick } from 'vue';
  import CounterHtmlRaw from './Counter.html?raw';

  let counter;

  onMounted(async () => {
    const { default: Counter } = await import('./Counter.ts');
    await nextTick();
    [counter] = Counter.$register();
  });

  onUnmounted(() => {
    counter.$destroy();
  });

</script>

<div class="my-4 p-10 rounded bg-vp-bg-alt text-center" v-html="CounterHtmlRaw"></div>

::: code-group

<<< ./Counter.ts

<<< ./Counter.html
