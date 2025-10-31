---
outline: deep
---

# Typing components

To improve DX and autocompletion of a components' properties, it is possible to type the `$el`, `$options`, `$refs` and `$children` properties either with JSDoc comments or directly in TypeScript. The `Base` class type accepts a [type parameter](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#type-parameters) with the following format:

```ts
interface BaseProps {
  $el: HTMLElement;
  $options: Record<string, any>;
  $refs: Record<string, HTMLElement | HTMLElement[]>;
  $children: Record<string, Base | Promise<Base>>;
}

declare class Base<T extends BaseProps = BaseProps> {}
```

See below for an example of how to define the type parameter in JSDoc or in TypeScript.

::: warning Knowledge requirements
This guide assumes that you are familiar with [TypeScript types](https://www.typescriptlang.org/), make sure to read the basics before going any further.
:::

::: tip Learn with examples
Both [`@studiometa/js-toolkit`](https://github.com/studiometa/js-toolkit) and [`@studiometa/ui`](https://github.com/studiometa/ui) packages are written in TypeScript, their source code can be a good reference to follow to type your first components.
:::

## Basic types for a class

### With JSDoc comments

```js
import { Base } from '@studiometa/js-toolkit';
import { Figure } from '@studiometa/ui';

/**
@typedef {{
  $el: HTMLAnchorElement;
  $options: {
    lazy: boolean;
  };
  $refs: {
    btn: HTMLButtonElement;
    items: HTMLElement[];
  };
  $children: {
    Figure: Figure[],
    LazyComponent: Promise<LazyComponent>[];
  },
}} ComponentProps
*/

/**
 * @extends {Base<ComponentProps>}
 */
export default class Component extends Base {
  /**
   * @type {import('@studiometa/js-toolkit').BaseConfig}
   */
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

  /**
   * @param {import('@studiometa/js-toolkit').ResizeServiceProps} props
   * @returns {void}
   */
  resized(props) {
    this.$log(props.orientation); // 'square' | 'portrait' | 'landscape'
  }
}
```

### With TypeScript

```ts
import { Base } from '@studiometa/js-toolkit';
import type {
  BaseProps,
  BaseConfig,
  ResizeServiceProps,
} from '@studiometa/js-toolkit';
import { Figure } from '@studiometa/ui';
import type LazyComponent from './LazyComponent.js';

interface ComponentProps extends BaseProps {
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
}

export default class Component extends Base<ComponentProps> {
  static config: BaseConfig = {
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

  resized(props: ResizeServiceProps) {
    this.$log(props.orientation); // 'square' | 'portrait' | 'landscape'
  }
}
```

## Autocomplete for class method

If you want to have autocompletion for a component's method, you can use the `BaseInterface` interface.

::: warning JS vs TS
This feature works best with TypeScript, as it can enable autocompletion for whole method signatures. In JavaScript, only the method name will be autocompleted.
:::

### With JavaScript

```js
import { Base } from '@studiometa/js-toolkit';

/**
 * @import { BaseInterface, ScrollServiceProps } from '@studiometa/js-toolkit'
 * @implements {BaseInterface}
 */
export default class Component extends Base {
  /**
   * @inheritdoc
   * @param {ScrollServiceProps} props
   * @returns {void}
   */
  scrolled(props) {
    props.y; // number
    props.changed; // { x: number, y: number }
  }
}
```

### With TypeScript

```ts
import { Base } from '@studiometa/js-toolkit';
import type {
  BaseInterface,
  ScrollServiceProps,
} from '@studiometa/js-toolkit';

export default class Component extends Base implements BaseInterface {
  scrolled(props: ScrollServiceProps) {
    props.y; // number
    props.changed; // { x: number, y: number }
  }
}
```

## Typing decorators

When using one of the decorators from the package, you will need to use some specific types to keep correct types in the class extending the decorator.

### With JSDoc comments

```js
import { Base, withIntersectionObserver } from '@studiometa/js-toolkit';
import Component from './Component.js';

/**
 * @typedef {import('@studiometa/js-toolkit').BaseProps} BaseProps
 */

/** @type {ReturnType<typeof withIntersectionObserver<Component>>} */
const WithIntersectionObserver = withIntersectionObserver(Component);

/**
 * @template {BaseProps} [T=BaseProps]
 * @extends {WithIntersectionObserver<T & { $options: { isChildComponent: true } }>}
 */
export class ChildComponent extends WithIntersectionObserver {
  mounted() {
    this.$log(this.$observer); // IntersectionObserver
    this.$log(this.$options.intersectionObserver); // IntersectionObserverInit
    this.$log(this.$options.isChildComponent); // true
    this.componentMethod(); // boolean
    this.childComponentMethod(); // boolean
  }

  childComponentMethod() {
    return false;
  }
}
```

### With TypeScript

With TypeScript, you can directly use the type parameter on the returned value of the decorator function.

```ts
import { Base, withIntersectionObserver } from '@studiometa/js-toolkit';
import type { BaseProps } from '@studiometa/js-toolkit';
import Component from './Component.js';

export interface ChildComponentProps extends BaseProps {
  $options: {
    isChildComponent: true;
  };
}

export class ChildComponent<
  T extends BaseProps = BaseProps,
> extends withIntersectionObserver<Component>(Component)<
  T & ChildComponentProps
> {
  mounted() {
    this.$log(this.$observer); // IntersectionObserver
    this.$log(this.$options.intersectionObserver); // IntersectionObserverInit
    this.$log(this.$options.isChildComponent); // true
    this.componentMethod(); // boolean
    this.childComponentMethod(); // boolean
  }

  childComponentMethod() {
    return false;
  }
}
```

## Typing for extensibility

If you create a component that can be extended by other component, you will need to define a type parameter for it and specify that the static `config` property is of type `BaseConfig` (there might be some conflicts otherwise).

### With JSDoc comments

You will need to declare types in a separate comment from the class and import the `BaseProps` type from the `@studiometa/js-toolkit` package.

```js {2,10,11}
/**
 * @typedef {import('@studiometa/js-toolkit').BaseProps} BaseProps
 * @typedef {import('@studiometa/js-toolkit').BaseConfig} BaseConfig
 * @typedef {{ name: string, lazy: boolean }} ComponentOptions
 * @typedef {{ btn: HTMLButtonElement, items: HTMLElement[] }} ComponentRefs
 * @typedef {{ Figure: Figure, LazyComponent: Promise<LazyComponent> }} ComponentChildren
 * @typedef {{ $el: HTMLAnchorElement, $options: ComponentOptions, $refs: ComponentRefs, $children: ComponentChildren }} ComponentProps
 */

/**
 * @template {BaseProps} [T=BaseProps]
 * @extends {Base<T & ComponentProps>}
 */
export class Component extends Base {
  /**
   * @type {BaseConfig}
   */
  static config = {
    name: 'Component',
    // ...
  };

  // ...
}
```

You will then be able to use the `Component` class like the `Base` class:

```js
import Component from './Component.js';

/**
 * @extends {Component<{ $el: HTMLButtonElement >}}
 */
export class ChildComponent extends Component {
  // ...
}
```

### With TypeScript

```ts
import { Base } from '@studiometa/js-toolkit';
import type { BaseProps, BaseConfig } from '@studiometa/js-toolkit';

export interface ComponentProps extends BaseProps {
  // ...
}

export class Component<T extends BaseProps = BaseProps> extends Base<
  T & ComponentProps
> {
  static config: BaseConfig = {
    name: 'Component',
  };

  // ...
}
```

```ts
import Component from './Component.js';

export class ChildComponent extends Component<{ $el: HTMLButtonElement }> {
  // ...
}
```
