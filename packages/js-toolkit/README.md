# @studiometa/js-toolkit

[![NPM Version](https://img.shields.io/npm/v/@studiometa/js-toolkit/next.svg?style=flat&colorB=3e63dd&colorA=414853)](https://www.npmjs.com/package/@studiometa/js-toolkit/v/next)
[![Downloads](https://img.shields.io/npm/dm/@studiometa/js-toolkit?style=flat&colorB=3e63dd&colorA=414853)](https://www.npmjs.com/package/@studiometa/js-toolkit/)
[![License](https://img.shields.io/npm/l/@studiometa/js-toolkit?style=flat&colorB=3e63dd&colorA=414853)](./LICENSE)

> A JavaScript data-attributes driven micro-framework shipped with plenty of useful utility functions to boost your project.

> [!WARNING]
> **This is the 4.0 alpha.** It is published under the `next` dist-tag, and it is a breaking major: `latest` still installs 3.x. The API is stable and documented, but the version is an alpha because it has not yet been run on a production project. Expect the occasional break until 4.0.0 ships.
>
> For 3.x, install `@studiometa/js-toolkit@latest` and read [js-toolkit.studiometa.dev](https://js-toolkit.studiometa.dev).

## Installation

```bash
npm install @studiometa/js-toolkit@next
```

## What is it?

Write components as classes and bind them to the DOM with `data-…` attributes. A component declares the elements it needs, and the framework mounts it wherever it appears in the page — including elements added later.

```html
<div data-component="Counter" data-option-step="2">
  <button data-ref="add">Add</button>
  <span data-ref="count">0</span>
</div>
```

```js
import { Base, registerComponent } from '@studiometa/js-toolkit';

class Counter extends Base {
  static config = {
    name: 'Counter',
    refs: ['add', 'count'],
    options: { step: { type: Number, default: 1 } },
  };

  onAddClick() {
    this.$refs.count.textContent = Number(this.$refs.count.textContent) + this.$options.step;
  }
}

registerComponent(Counter);
```

There is no build step to adopt: the same class runs from a `<script type="module">` and an import map.

## Documentation

[js-toolkit-v4.studiometa.dev](https://js-toolkit-v4.studiometa.dev) — the guide, the full API reference, and the [v3 to v4 migration guide](https://js-toolkit-v4.studiometa.dev/guide/migration/v3-to-v4.html).

The design record lives in the repository: [DESIGN.md](./DESIGN.md) states what v4 does, and [RATIONALE.md](./RATIONALE.md) states why, which options were refused, and what the measurements are.

## Contributing

See the [repository README](https://github.com/studiometa/js-toolkit#contributing). Fixes for the 3.x line go to the [`3.x` branch](https://github.com/studiometa/js-toolkit/tree/3.x).

## License

[MIT](./LICENSE)
