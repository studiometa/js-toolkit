# js-toolkit

[![NPM Version](https://img.shields.io/npm/v/@studiometa/js-toolkit.svg?style=flat&colorB=3e63dd&colorA=414853)](https://www.npmjs.com/package/@studiometa/js-toolkit/)
[![Downloads](https://img.shields.io/npm/dm/@studiometa/js-toolkit?style=flat&colorB=3e63dd&colorA=414853)](https://www.npmjs.com/package/@studiometa/js-toolkit/)
[![Size](https://img.shields.io/bundlephobia/minzip/@studiometa/js-toolkit?style=flat&colorB=3e63dd&colorA=414853&label=size)](https://bundlephobia.com/package/@studiometa/js-toolkit)
[![Dependency Status](https://img.shields.io/librariesio/release/npm/@studiometa/js-toolkit?style=flat&colorB=3e63dd&colorA=414853)](https://david-dm.org/studiometa/js-toolkit)
![Codecov](https://img.shields.io/codecov/c/github/studiometa/js-toolkit?style=flat&colorB=3e63dd&colorA=414853)

> A JavaScript data-attributes driven micro-framework shipped with plenty of useful utility functions to boost your project.

This is the monorepo for `@studiometa/js-toolkit` and its companion packages.

## What is it?

The toolkit lets you write components as classes and bind them to the DOM with `data-…` attributes. A component declares the elements it needs, and the framework mounts it wherever it appears in the page.

```html
<div data-component="Counter" data-option-step="2">
  <button data-ref="add">Add</button>
  <button data-ref="remove">Remove</button>
  <input data-ref="count" type="number" value="0" />
</div>
```

```js
import { Base, registerComponent } from '@studiometa/js-toolkit';

class Counter extends Base {
  static config = {
    name: 'Counter',
    refs: ['add', 'remove', 'count'],
    options: { step: { type: Number, default: 1 } },
  };

  onAddClick() {
    this.$refs.count.value = this.$refs.count.valueAsNumber + this.$options.step;
  }
}

registerComponent(Counter);
```

Its main objectives are:

- Enforcing best-practice and consistency between projects
- Using elements from the DOM easily
- Enabling custom behaviours on component initialization or other user events
- Disabling custom behaviours on component destruction or other user events
- Initializing components in the right place at the right time
- Defining dependencies between components

Visit [js-toolkit-v4.studiometa.dev](https://js-toolkit-v4.studiometa.dev) to learn more, jump to [ui.studiometa.dev](https://ui.studiometa.dev) to discover existing components, or open [the playground](https://ui.studiometa.dev/-/play/) to test it live.

## Branches

| Branch                                                     | Line                | npm      | Documentation                                                        |
| ---------------------------------------------------------- | ------------------- | -------- | -------------------------------------------------------------------- |
| `main`                                                     | 4.x                 | `next`   | [js-toolkit-v4.studiometa.dev](https://js-toolkit-v4.studiometa.dev) |
| [`3.x`](https://github.com/studiometa/js-toolkit/tree/3.x) | 3.x, in maintenance | `latest` | [js-toolkit.studiometa.dev](https://js-toolkit.studiometa.dev)       |

4.0 is a breaking major and is currently an alpha, so `latest` still installs 3.x. The two domains swap when 4.0.0 ships. Open a fix for the 3.x line against the `3.x` branch, and anything about 4.x against `main`.

## Packages

| Package                                                             | Description                                                                      |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`@studiometa/js-toolkit`](./packages/js-toolkit/)                  | The framework and its utility functions.                                         |
| [`@studiometa/eslint-plugin-js-toolkit`](./packages/eslint-plugin/) | Oxlint/ESLint rules enforcing the framework's best practices.                    |
| [`packages/js-toolkit/docs`](./packages/js-toolkit/docs/)           | Sources of [js-toolkit-v4.studiometa.dev](https://js-toolkit-v4.studiometa.dev). |
| [`packages/js-toolkit/demo`](./packages/js-toolkit/demo/)           | A playground application used during development.                                |
| [`packages/js-toolkit/migration`](./packages/js-toolkit/migration/) | `@studiometa/ui` families ported onto v4 to measure what a migration costs.      |

## Installation

```bash
npm install @studiometa/js-toolkit@next
```

See the [package README](./packages/js-toolkit/README.md) for a longer introduction, or the [Getting Started guide](https://js-toolkit-v4.studiometa.dev/guide/).

## Contributing

This project follows the [Git Flow](https://github.com/petervanderdoes/gitflow-avh) methodology to manage its branches and features. The packages and their dependencies are managed with NPM workspaces. The files are linted with Oxlint, type checked with TypeScript, formatted with oxfmt, tested with Vitest and built with tsdown.

```bash
npm install     # install the workspace
npm run build   # build every package
npm test        # run the test suite
npm run lint    # lint, format check and type check
```

## License

See [LICENSE](./LICENSE).
