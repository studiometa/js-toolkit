# JS Toolkit

[![NPM Version](https://img.shields.io/npm/v/@studiometa/js-toolkit.svg?style=flat-square)](https://www.npmjs.com/package/@studiometa/js-toolkit/)
[![Dependency Status](https://img.shields.io/david/studiometa/js-toolkit.svg?label=deps&style=flat-square)](https://david-dm.org/studiometa/js-toolkit)
[![devDependency Status](https://img.shields.io/david/dev/studiometa/js-toolkit.svg?label=devDeps&style=flat-square)](https://david-dm.org/studiometa/js-toolkit?type=dev)
![Codecov](https://img.shields.io/codecov/c/github/studiometa/js-toolkit?style=flat-square)

> A set of useful little bits of JavaScript to boost your project! 🚀

## Installation

Install the latest version via NPM:

```bash
npm install @studiometa/js-toolkit
```

Two modern builds are also provided for prototyping purpose, they can be used as follow:

```html
<script type="module">
  // Import the Base class
  import Base from 'https://unpkg.com/@studiometa/js-toolkit/index.modern.js';
  // Import the full toolkit
  import { utils, services, components, decorators } from 'https://unpkg.com/@studiometa/js-toolkit/full.modern.js';
</script>
```

## Usage

Use the `Base` class to create your components:

```js
import Base from '@studiometa/js-toolkit';
import Modal from '@studiometa/js-toolkit/components/Modal';

class App extends Base {
  get config() {
    return {
      name: 'App',
      log: true,
      components: {
        Modal,
      },
    };
  }

  mounted() {
    this.$log('mounted');
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
