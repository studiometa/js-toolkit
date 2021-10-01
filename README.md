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

## Usage

Import the `Base` class and extend it to create your components:

```js
import { Base } from '@studiometa/js-toolkit';
import Modal from '@studiometa/ui/Modal';

class Component {
  static config = {
    name: 'Component',
  }
}

class App extends Base {
  static config = {
    name: 'App',
    log: true,
    debug: true,
    components: {
      Modal,
      Component,
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


