# JS Toolkit

[![NPM Version](https://img.shields.io/npm/v/@studiometa/js-toolkit.svg?style=flat-square)](https://www.npmjs.com/package/@studiometa/js-toolkit/)
[![Size](https://img.shields.io/bundlephobia/minzip/@studiometa/js-toolkit?label=size&style=flat-square)](https://bundlephobia.com/package/@studiometa/js-toolkit)
[![Dependency Status](https://img.shields.io/librariesio/release/npm/@studiometa/js-toolkit?style=flat-square)](https://david-dm.org/studiometa/js-toolkit)
![Codecov](https://img.shields.io/codecov/c/github/studiometa/js-toolkit?style=flat-square)

> A set of useful little bits of JavaScript to boost your project! 🚀

## Installation

Install the latest version via NPM:

```bash
npm install @studiometa/js-toolkit
```

The package can be used directly with the [Skypack CDN](https://www.skypack.dev) as follow:

```html
<script type="module">
  // Import the Base class
  import Base from 'https://cdn.skypack.dev/@studiometa/js-toolkit/';
  // Import the full toolkit
  import * as components from 'https://cdn.skypack.dev/@studiometa/js-toolkit/components';
  import * as decorators from 'https://cdn.skypack.dev/@studiometa/js-toolkit/decorators';
  import * as services from 'https://cdn.skypack.dev/@studiometa/js-toolkit/services';
  import * as utils from 'https://cdn.skypack.dev/@studiometa/js-toolkit/utils';
</script>
```

## Usage

### Modern JS with bundler

Import the `Base` class to create your components from your `node_modules`:

```js
import Base from '@studiometa/js-toolkit';
import Modal from '@studiometa/js-toolkit/components/Modal';

class App extends Base {
  static config = {
    name: 'App',
    log: true,
    debug: true,
    components: {
      Modal,
    },
    refs: ['btn', 'items[]'],
    options: {
      foo: String,
      bar: { type: String, default: 'bar' },
    }
  };

  mounted() {
    this.$log('mounted');

    // Options
    this.$options.name; // 'App'
    this.$options.log; // true
    this.$options.debug; // true
    this.$options.foo // ''
    this.$options.bar // 'bar'

    // Children
    this.$children.Modal; // Array<Modal>

    // DOM references
    this.$refs.btn; // <button data-ref="btn"></button>
    this.$refs.items; // <li data-ref="items[]"></li>
  }

  destroyed() {
    this.$log('destroyed');
  }

  scrolled(props) {
    this.$log('scrolled', props);
  }

  resized(props) {
    this.$log('resized', props);
  }
}

export default new App(document.querySelector('#app'));
```

Read the [documentation](https://js-toolkit.meta.fr/) to learn more.

### Modern JS in browser

Two modern builds are provided for prototyping purpose, they can be used as follow:

```html
<script type="module">
  // Import the Base class
  import Base from 'https://cdn.skypack.dev/@studiometa/js-toolkit/';
  // Import the full toolkit
  import Modal from 'https://cdn.skypack.dev/@studiometa/js-toolkit/components/Modal';
</script>
```

### Legacy JS

Two UMD builds are also provided to be used in legacy projects.

```html
<div id="app">
  <button data-ref="btn">Add more</button>
  <input data-ref="input" value="0" readonly />
  <div data-component="Component"></div>
</div>
<script src="https://unpkg.com/@studiometa/js-toolkit/index.umd.js"></script>
<script>
  var Component = Base.defineComponent({
    config: {
      name: 'Component',
    },
  });

  Base.createBase(document.querySelector('#app'), {
    config: {
      name: 'App',
      log: true,
      components: {
        Component: Component,
      },
    },
    mounted: function() {
      this.$log('mounted');
    },
    methods: {
      onBtnClick: function() {
        this.$refs.input.value = Number(this.$refs.input.value) + 1;
      },
    },
  });
</script>
```
