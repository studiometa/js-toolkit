# @studiometa/js-toolkit

[![NPM Version](https://img.shields.io/npm/v/@studiometa/js-toolkit.svg?style=flat&colorB=3e63dd&colorA=414853)](https://www.npmjs.com/package/@studiometa/js-toolkit/)
[![Downloads](https://img.shields.io/npm/dm/@studiometa/js-toolkit?style=flat&colorB=3e63dd&colorA=414853)](https://www.npmjs.com/package/@studiometa/js-toolkit/)
[![Size](https://img.shields.io/bundlephobia/minzip/@studiometa/js-toolkit?style=flat&colorB=3e63dd&colorA=414853&label=size)](https://bundlephobia.com/package/@studiometa/js-toolkit)
[![Dependency Status](https://img.shields.io/librariesio/release/npm/@studiometa/js-toolkit?style=flat&colorB=3e63dd&colorA=414853)](https://david-dm.org/studiometa/js-toolkit)
![Codecov](https://img.shields.io/codecov/c/github/studiometa/js-toolkit?style=flat&colorB=3e63dd&colorA=414853)

> A JavaScript data-attributes driven micro-framework shipped with plenty of useful utility functions to boost your project.

## Installation

Install the latest version via NPM:

```bash
npm install @studiometa/js-toolkit
```

## What is it?

This project is a JavaScript micro-framework (along with its utility functions) whose main objectives are:

- Enforcing best-practice and consistency between projects
- Using elements from the DOM easily
- Enabling custom behaviours on component initialization or other user events
- Disabling custom behaviours on component destruction or other user events
- Initializing components in the right place at the right time
- Defining dependencies between components

Visit [js-toolkit.studiometa.dev](https://js-toolkit.studiometa.dev) to learn more, jump directly to [ui.studiometa.dev](https://ui.studiometa.dev) to discover existing components, or open [the playground](https://ui.studiometa.dev/-/play/) to test it live.

## Quick overview

This framework lets you define components as classes, and bind them to the DOM with `data-…` attributes. For example, here is how a `Counter` component would be defined in JavaScript:

```js
import { Base } from '@studiometa/js-toolkit';

export default class Counter extends Base {
  static config = {
    name: 'Counter',
    refs: ['add', 'remove', 'count'],
  };

  get counter() {
    return this.$refs.count.valueAsNumber;
  }

  set counter(value) {
    this.$refs.count.value = value;
  }

  onAddClick() {
    this.counter += 1;
  }

  onRemoveClick() {
    this.counter -= 1;
  }
}
```

And its accompanying HTML would be sprinkled with `data-…` attributes to bind elements from the DOM to the JavaScript class.

```html
<div data-component="Counter">
  <button data-ref="add">Add</button>
  <button data-ref="remove">Remove</button>
  <input data-ref="count" type="number" value="0" />
</div>
```

You can define options that can be specified with `data-option-...` attributes as well. First in JavaScript:

```diff
  class Counter extends Base {
    static config = {
      name: 'Counter',
      refs: ['add', 'remove', 'count'],
+     options: {
+       step: {
+         type: Number,
+         default: 1,
+       },
+     },
    };

    onAddClick() {
-     this.counter += 1;
+     this.counter += this.$options.step;
    }

    onRemoveClick() {
-     this.counter -= 1;
+     this.counter -= this.$options.step;
    }
  }
```

And then adjust it as you wish in your HTML:

```diff
- <div data-component="Counter">
+ <div data-component="Counter" data-option-step="2">
    <button data-ref="add">Add</button>
    <button data-ref="remove">Remove</button>
    <input data-ref="count" type="number" value="0">
  </div>
```

Like Web Components, components based on the `Base` class can be registered. Any matching component found in the DOM from the moment it is registered to any future change will be mounted.

```js
import { registerComponent } from '@studiometa/js-toolkit';
import Counter from './components/Counter.js';

registerComponent(Counter);
```

Visit our ["Getting Started" guide](https://js-toolkit.studiometa.dev/guide/) to learn more and try the above component by visiting [the playground](https://ui.studiometa.dev/-/play/#script=eNqVkjFPwzAQhff%2BijcguRVtEGurSpTuDKyIwdiXYprYkX2pQFX%2BO7bjlg6A1EiJndO97873bNrOecYRjzLQHMqTZNp0HQbU3rUQD4F7bVxLLO8%2BwoKda%2FaGxWoyUY0MAVvXWyYP%2BmSyOmQOjhMgsGSjoJytzQ7rHAOsbGkJUVRinoOe6rDEi5BaizmEp9YdKO1UShOvY5br2DgbE0dSqkDdzx%2FAX11kP%2FXtG%2FlRkh5NtewbXuL%2BFBvGzRC%2FQzwHsCOOfeaOprMC9MS9t%2BB3E6qb1GCVM6qDbHrahLHKKiESIVwQcsYJ87s%2BjiOvZ72zG623jVH7cwNZWZi4XRdSGUKVzn6hfs4j%2Bwew%2BBsQEaOVyfbrbIyKYqFy8SJZsnzhTzG5TDstcdyp2umSTeM7W30DtazCdQ%3D%3D&html=eNqFkEsKwzAMRPc9hdDe5EOXcaD0Br2BEyvBkMjGkUN7%2Byb1ogkUupJAmjfMNNatYI0Y1fs5eCYWjXefWChiPvggzrNahILGGqGfzLJoDOoKw0RPGM22YnsBaLok4jnLIg0ajbUHQQ3dqLopkarKEuLmYslie7O2KbL0NyXS7Ff6D3p8%2Fk4sxyHJAdXv0RDkFUgjp7nbY65mQ2ksTw7R8aiqPBwvJF%2BfS1NstbVv4jxoZA%3D%3D&style=eNpLyk%2BpVKjmUlAoSExJycxLt1IwLErNteaqBQBpsgf8). Discover our existing library of components by checking out the [@studiometa/ui](https://github.com/studiometa/ui) package.

## Contributing

This projects follows the [Git Flow](https://github.com/petervanderdoes/gitflow-avh) methodology to manage its branches and features. The packages and their dependencies are managed with NPM workspaces. The files are linted with ESLint, type checked with TypeScript and formatted with Prettier.

## License

See [LICENSE](./LICENSE).
