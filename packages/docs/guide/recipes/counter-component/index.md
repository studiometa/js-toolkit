---
outline: deep
---

# Counter component

Find below the JavaScript and HTML implementation of a counter component.

## HTML Structure

A counter component can be layed out like the following:

<div class="flex justify-center my-4 p-6 rounded bg-vp-bg-alt text-center">
  <div class="flex gap-4">
    <button>-</button>
    <div>0</div>
    <button>+</button>
  </div>
</div>

```html
<div>
  <button>-</button>
  <div>0</div>
  <button>+</button>
</div>
```

To make it interactive with js-toolkit, add the following data-attribute:

```html
<div> // [!code --]
<div data-component="Counter"> // [!code ++]
  <button>-</button>
  <div>0</div>
  <button>+</button>
</div>
```

## JS Files

### App.js

Create a js file to instantiate your app and mount your components, like so:

```js
import { Base, createApp } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

export default createApp(App);

```
::: tip 👀 Check out the docs
See the [create App](/api/helpers/createApp.html#createapp.html) to learn more about this helper

:::

### Component.js

Create the js file for your component, with the following config:

```js
import { Base } from '@studiometa/js-toolkit';

export default class Counter extends Base {
  static config = {
    name: 'Counter';
  }
}
```
Add your newly created componant to the app file to mount it:

```js

import { Base, createApp } from '@studiometa/js-toolkit';
import Counter from './Counter.js'; // [!code ++]

class App extends Base {
  static config = {
    name: 'App',
    components: { // [!code ++]
      Counter, // [!code ++]
    }, // [!code ++]
  };
}

export default createApp(App);
```

### Add the refs

Back to our component file, we add the config for refs, which will allow us to acces the targeted DOM elements with `this.$refs.<NAME>` within our class methods:

```js
import { Base } from '@studiometa/js-toolkit';

export default class Counter extends Base {
  static config = {
    name: 'Counter';
    refs: ['add', 'remove', 'counter'], // [!code ++]
  }
}
```

::: tip 📖 Check out the docs
See the [Managing refs](/guide/introduction/managing-refs.html) section to learn more about them.
:::

Then, add to your HTML the data attribute to the targeted DOM elements:

``` html
<div data-component="Counter">
  <button>-</button> // [!code --]
  <button data-ref="remove">-</button> // [!code ++]
  <div>0</div>// [!code --]
  <div data-ref="counter">0</div>// [!code ++]
  <button>+</button>// [!code --]
  <button data-ref="add">+</button>// [!code ++]
</div>
```

### Add logic

Now that everything is connected we can start playing around, by adding method:

``` js
import { Base } from '@studiometa/js-toolkit';

export default class Counter extends Base {
  static config = {
    name: 'Counter';
    refs: ['add', 'remove', 'counter'],
  }

  // Get the DOM element value thanks to the ref.
  get count() { // [!code ++]
    return Number(this.$refs.counter.innerHTML);// [!code ++]
  }// [!code ++]

  // Update the ref value.
  set count(value) { // [!code ++]
    this.$refs.counter.innerHTML = value; // [!code ++]
  } // [!code ++]
}

```
We can now attach an event to a ref with `on<Refname><Event>`:

``` js
import { Base } from '@studiometa/js-toolkit';

export default class Counter extends Base {
  static config = {
    name: 'Counter';
    refs: ['add', 'remove', 'counter'],
  }

  get count() {
    return Number(this.$refs.counter.innerHTML);
  }

  set count(value) {
    this.$refs.counter.innerHTML = value;
  }

  // Attaching a `click` event listener to the `add` ref.
   onAddClick() {// [!code ++]
    this.count += 1;// [!code ++]
  }// [!code ++]

  // Attaching a `click` event listener to the `remove` ref.
  onRemoveClick() {// [!code ++]
    this.count -= 1;// [!code ++]
  }// [!code ++]
}

```

::: tip 📖 Check out the docs
See the [working with events](guide/introduction/working-with-events.html) section to learn more.
:::


## Result

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
    [counter] = Counter.$factory('Counter');
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
