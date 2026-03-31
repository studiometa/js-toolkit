# Counter component

A simple reactive counter that increments and decrements a displayed number. This is the simplest possible js-toolkit component, making it a great starting point.

## What we're building

A counter with two buttons (+ and −) and a number display. Clicking the buttons updates the count in real time. This demonstrates **refs** for DOM access and **event handling** via the `on<Ref><Event>` naming convention.

## HTML markup

The HTML uses `data-component` to mark the root element and `data-ref` to expose three child elements to the component:

```html
<div data-component="Counter">
  <button data-ref="remove">-</button>
  <div data-ref="counter">0</div>
  <button data-ref="add">+</button>
</div>
```

## JavaScript component

The component declares its refs in `static config`. A getter/setter pair on `count` reads from and writes to the `counter` ref. Click handlers are auto-bound by naming them `on<Ref>Click`:

```js
import { Base } from '@studiometa/js-toolkit';

export default class Counter extends Base {
  static config = {
    name: 'Counter',
    refs: ['add', 'remove', 'counter'],
  };

  get count() {
    return Number(this.$refs.counter.innerHTML);
  }

  set count(value) {
    this.$refs.counter.innerHTML = value;
  }

  onAddClick() {
    this.count += 1;
  }

  onRemoveClick() {
    this.count -= 1;
  }
}
```

## App setup

Register the component so js-toolkit auto-mounts it on any matching `data-component="Counter"` element:

```js
import { registerComponent } from '@studiometa/js-toolkit';
import Counter from './Counter.js';

registerComponent(Counter);
```

## Live demo

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

## Further reading

- [Refs guide](/guide/introduction/managing-refs.html) — learn how `data-ref` connects HTML to your component
- [Events guide](/guide/introduction/working-with-events.html) — the `on<Ref><Event>` naming convention
- [Base class API](/api/) — full reference for the `Base` class
