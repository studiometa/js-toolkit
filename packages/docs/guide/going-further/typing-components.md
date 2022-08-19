---
outline: deep
---

# Typing components

To improve DX and autocompletion of a components' properties, it is possible to type the `$options`, `$refs` and `$children` properties either with JSDoc comments or directly in TypeScript. The `Base` class type accepts a [type parameter](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#type-parameters) with the following format:

```ts
class Base<BaseInterface extends {
  $el: HTMLElement;
  $options: Record<string, any>;
  $refs: Record<string, HTMLElement | HTMLElement[]>;
  $children: Record<string, Base | Promise<Base>>;
}>
```

See below for an example of how to define the type parameter in JSDoc or in TypeScript.

::: warning Knowledge requirements
This guide assumes that you are familiar with [TypeScript types](https://www.typescriptlang.org/), make sure to read the basics before going any further.
:::

## Basic types

### With JSDoc comments

```js
import { Base } from '@studiometa/js-toolkit';
import { Figure } from '@studiometa/ui';

/**
 * @typedef {{ name: string, lazy: boolean }} ComponentOptions
 * @typedef {{ btn: HTMLButtonElement, items: HTMLElement[] }} ComponentRefs
 * @typedef {{ Figure: Figure, LazyComponent: Promise<LazyComponent> }} ComponentChildren
 * @typedef {{ $el: HTMLAnchorElement, $options: ComponentOptions, $refs: ComponentRefs, $children: ComponentChildren }} ComponentInterface
 * @extends {Base<ComponentInterface>}
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
    this.$el; // HTMLAnchorElement
    this.$refs.btn; // HTMLButtonElement
    this.$refs.items; // HTMLElement[]
    this.$options.name; // string
    this.$options.lazy; // boolean
    this.$children.Figure; // Figure[]
    this.$children.LazyComponent; // Promise<LazyComponent>[]
  }
}
```

### With TypeScript

```ts
import { Base } from '@studiometa/js-toolkit';
import { Figure } from '@studiometa/ui';
import type LazyComponent from './LazyComponent.js';

type ComponentInterface = {
  $el: HTMLAnchorElement;
  $options: {
    name: string;
    lazy: boolean;
  };
  $refs: {
    btn: HTMLButtonElement;
    items: HTMLElement[];
  };
  $children: {
    Figure: Figure;
    LazyComponent: Promise<LazyComponent>;
  };
};

export default class Component extends Base<ComponentInterface> {
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
    this.$el; // HTMLAnchorElement
    this.$refs.btn; // HTMLButtonElement
    this.$refs.items; // HTMLElement[]
    this.$options.name; // string
    this.$options.lazy; // boolean
    this.$children.Figure; // Figure[]
    this.$children.LazyComponent; // Promise<LazyComponent>[]
  }
}
```

## Typing for extensibility

If you create a component that can be extended by other component, you will need to define a type parameter for it.

### With JSDoc comments

You will need to declare types in a separate comment from the class and import the `BaseTypeParameter` type from the `@studiometa/js-toolkit` package.

```js {2,10,11}
/**
 * @typedef {import('@studiometa/js-toolkit').BaseTypeParameter} BaseTypeParameter
 * @typedef {{ name: string, lazy: boolean }} ComponentOptions
 * @typedef {{ btn: HTMLButtonElement, items: HTMLElement[] }} ComponentRefs
 * @typedef {{ Figure: Figure, LazyComponent: Promise<LazyComponent> }} ComponentChildren
 * @typedef {{ $el: HTMLAnchorElement, $options: ComponentOptions, $refs: ComponentRefs, $children: ComponentChildren }} ComponentInterface
 */

/**
 * @template {BaseTypeParameter} [Interface={}]
 * @extends {Base<Interface & ComponentInterface>}
 */
export default class Component extends Base {
  // ...
}
```

You will then be able to use the `Component` class like the `Base` class:

```js
import Component from './Component.js';

/**
 * @extends {Component<{ $el: HTMLButtonElement >}}
 */
export default class ChildComponent extends Component {
  // ...
}
```

### With TypeScript

```ts
import { Base } from '@studiometa/js-toolkit';
import type { BaseTypeParameter } from '@studiometa/js-toolkit';

export default class Component<Interface extends BaseTypeParameter = {}> extends Base<
  Interface & ComponentInterface
> {
  // ...
}
```

```ts
import Component from './Component.js';

export default class ChildComponent extends Component<{ $el: HTMLButtonElement }> {
  // ...
}
```
