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

## Concept

[] todo

## Usage

Import the `Base` class and extend it to create your components:

```js
import { Base, createApp } from '@studiometa/js-toolkit';

class Component extends Base {
  static config = {
    name: 'Component',
  }

  sayHello() {
    console.log('Hello!');
  }
}

class App extends Base {
  static config = {
    name: 'App',
    components: {
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
    this.$options.debug; // false
    this.$options.foo // ''
    this.$options.bar // 'bar'

    // Children
    this.$children.Component; // Array<Component>

    // DOM references
    this.$refs.btn; // <button data-ref="btn"></button>
    this.$refs.items[0]; // <li data-ref="items[]"></li>
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

export default createApp(App, document.body);
```

Read the [documentation](https://js-toolkit.studiometa.dev/) to learn more.

## Contribution

This projects follows the [Git Flow](https://github.com/petervanderdoes/gitflow-avh) methodology to manage its branches and features.

The packages from this project are managed with NPM workspaces.

The files are linted with ESLint, type checked with TypeScript and formatted with Prettier.
