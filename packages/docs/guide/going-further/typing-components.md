---
outline: deep
---

# Typing components

To improve DX and autocompletion of a components' properties, it is possible to type the `$options`, `$refs` and `$children` properties either with JSDoc comments or directly in TypeScript. The `Base` class type accepts a [type parameter](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#type-parameters) with the following format:

```ts
class Base<BaseInterface extends {
  $options: BaseOptions;
  $refs: BaseRefs;
  $children: BaseChildren;
}>
```

See below for an example of how to define the type parameter in JSDoc or in TypeScript.

::: warning Knowledge requirements
This guide assumes that you are familiar with [TypeScript types](https://www.typescriptlang.org/), make sure to read the basics before going any further.
:::

## With JSDoc comments

```js
import { Base } from '@studiometa/js-toolkit';
import { Figure } from '@studiometa/ui';

/**
 * @typedef {{ name: string, lazy: boolean }} ComponentOptions
 * @typedef {{ btn: HTMLButtonElement, items: HTMLElement[] }} ComponentRefs
 * @typedef {{ Figure: Figure, LazyComponent: Promise<LazyComponent> }} ComponentChildren
 * @extends {Base<{ $options: ComponentOptions, $refs: ComponentRefs, $children: ComponentChildren }>}
 */
export default class Component extends Base {
  static config = {
    name: 'Component',
    refs: ['btn', 'items[]'],
    options: {
      name: String,
      lazy: Boolean,
    },
    components: {
      Figure,
      LazyComponent: () => import('./LazyComponent.js'),
    },
  };

  mounted() {
    this.$refs.btn; // HTMLButtonElement
    this.$refs.items; // HTMLElement[]
    this.$options.name; // string
    this.$options.lazy; // boolean
    this.$children.Figure; // Figure[]
    this.$children.LazyComponent; // Promise<LazyComponent>[]
  }
}
```

## With TypeScript

```ts
import { Base } from '@studiometa/js-toolkit';
import { Figure } from '@studiometa/ui';
import type LazyComponent from './LazyComponent.js';

type ComponentOptions {
  name: string;
  lazy: boolean;
}

type ComponentRefs {
  btn: HTMLButtonElement;
  items: HTMLElement[];
}

type ComponentChildren {
  Figure: Figure;
  LazyComponent: Promise<LazyComponent>
}

export default class Component extends Base<{
  $options: ComponentOptions,
  $refs: ComponentRefs,
  $children: ComponentChildren,
}> {
  static config = {
    name: 'Component',
    refs: ['btn', 'items[]'],
    options: {
      name: String,
      lazy: Boolean,
    },
    components: {
      Figure,
      LazyComponent: () => import('./LazyComponent.js'),
    },
  };

  mounted() {
    this.$refs.btn; // HTMLButtonElement
    this.$refs.items; // HTMLElement[]
    this.$options.name; // string
    this.$options.lazy; // boolean
    this.$children.Figure; // Figure[]
    this.$children.LazyComponent; // Promise<LazyComponent>[]
  }
}
```
