# Getting Started

This guide will walk you through installing js-toolkit and building your first component.

`@studiometa/js-toolkit` is a data-attributes driven micro-framework for building JavaScript components. Write classes, add `data-*` attributes to your HTML, and let the framework handle the rest.

## Installation

### npm

```bash
npm install @studiometa/js-toolkit
```

### CDN

```html
<script type="module">
  import { Base, registerComponent } from 'https://esm.sh/@studiometa/js-toolkit';
</script>
```

## Hello World

Create a component by extending the `Base` class:

```html
<!-- index.html -->
<div data-component="Hello">
  <button data-ref="btn">Say hello</button>
</div>
<script type="module" src="./main.js"></script>
```

```js
// main.js
import { Base, registerComponent } from '@studiometa/js-toolkit';

class Hello extends Base {
  static config = {
    name: 'Hello',
    refs: ['btn'],
  };

  onBtnClick() {
    alert('Hello, world!');
  }
}

registerComponent(Hello);
```

That's it — `registerComponent` finds all `[data-component="Hello"]` elements and mounts them automatically, including any added to the DOM later.

::: tip
Using Vite or Webpack? Set the `__DEV__` global for debug logs. See [Installation](/guide/introduction/installation.html) for build tool setup.
:::

