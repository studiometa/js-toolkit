# Configuration

The static `config` property is required on each class extending the `Base` class. It should be used to configure the class.

## `config.name`

- Type: `String`

The **required** name of the component.

```js {3} twoslash
import { Base } from '@studiometa/js-toolkit';
// ---cut---
class Component extends Base {
  static config = {
    name: 'Component',
  };
}
```

## `config.options`

- Type: `Object`
- Default: `{}`

Define values configurable with `data-option-...` attributes for the component.

```js twoslash
import { Base } from '@studiometa/js-toolkit';
// ---cut---
class Component extends Base {
  static config = {
    name: 'Component',
    options: {
      stringOption: String, // default to ''
      stringWithDefault: { type: String, default: 'Default value' },
      stringWithDefaultAsAFunction: {
        type: String,
        default: (component) => component.$el.id,
      },
      numberOption: Number, // default to 0
      numberWithDefault: { type: Number, default: 10 },
      numberWithDefaultAsAFunction: {
        type: Number,
        default: (component) => component.$el.childElementCount,
      },
      booleanOption: Boolean, // default to false
      // default to true, can be negated with the `data-option-no-boolean-with-default` attribute
      booleanWithDefault: {
        type: Boolean,
        default: true,
      },
      booleanWithDefaultAsAFunction: {
        type: Boolean,
        default: (component) => component.$el.classList.has('bool'),
      },
      arrayOption: Array, // default to []
      arrayWithDefault: { type: Array, default: () => [1, 2] },
      objectOption: Object, // default to {}
      objectWithDefault: {
        type: Object,
        default: () => ({ foo: 'foo' }),
        merge: true, // Optional, wether to merge values or not
      },
    },
  };

  mounted() {
    this.$options.stringOption; // ''
    this.$options.stringWithDefault; // 'Default value'
    this.$options.numberOption; // 0
    this.$options.numberWithDefault; // 10
    this.$options.booleanOption; // false
    this.$options.booleanWithDefault; // true
    this.$options.arrayOption; // []
    this.$options.arrayWithDefault; // [1,2]
    this.$options.objectOption; // {}
    this.$options.objectWithDefault; // { foo: 'foo' }

    this.$el.hasAttribute('data-option-boolean-option'); // false
    this.$options.booleanOption = true;
    this.$el.hasAttribute('data-option-boolean-option'); // true
  }
}
```

## `config.components`

- Type: `Object`
- Default: `{}`

The children components of the current one that will automatically be mounted and destroyed accordion to the state of the current component. Children components can be defined like the following:

::: code-group

```js twoslash [app.js]
import { Base } from '@studiometa/js-toolkit';
import { Figure, PrefetchWhenOver } from '@studiometa/ui';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      // Direct reference, Figure instances will be mounted
      // on every `[data-component="Figure"]` elements.
      Figure,
      // Async loading, the Slider component will be loaded only if there
      // is one or more `[data-component="Slider"]` element in the DOM.
      Slider: () => import('@studiometa/ui').then(({ Slider }) => Slider),
      // Custom selector, ComponentThree instances will be mounted
      // on every `a[href]` elements.
      'a[href]': PrefetchWhenOver,
      // Custom selector with async loading, the Component component will be loaded
      // only if there is one or more `.other-custom-selector` element in the DOM.
      '.other-custom-selector': () => import('./Component.js'),
    },
  };
}
```

```js twoslash [Component.js]
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
  };
}
```

::: tip
The [lazy import helpers](/api/helpers/#lazy-import-helpers) can be used for more fine-grained imports.
:::

## `config.refs`

- Type : `Array<String>`
- Default : `[]`

Define the refs of the components by specifying their name in the configuration. Multiple refs should be suffixed with `[]`. Refs names can be configured and used in HTML following the `dash-case` pattern, and will be available in the `this.$refs` object following the `camelCase` pattern.

```html
<div data-component="Component">
  <button data-ref="btn">Click me</button>
  <ul>
    <li data-ref="items[]">#1</li>
  </ul>
  <ul>
    <li data-ref="other-items[]">#1</li>
    <li data-ref="other-items[]">#2</li>
  </ul>
  <!-- Refs can be prefixed by the name of their component (in HTML only)  -->
  <input data-ref="Component.input" type="text" />
</div>
```

```js twoslash
import { Base } from '@studiometa/js-toolkit';
// ---cut---
class Component extends Base {
  static config = {
    name: 'Component',
    refs: ['btn', 'items[]', 'other-items[]'],
  };

  mounted() {
    this.$refs.btn; // <button data-ref="btn">Click me</button>
    this.$refs.items; // [<li data-ref="items[]">#1</li>]
    this.$refs.otherItems; // [<li data-ref="other-items[]">#1</li>, <li data-ref="other-items[]">#2</li>]
  }
}
```

## `config.emits`

- Type: `string[]`
- Default: `undefined`

Define the events emitted by the component by specifying their name.

```js twoslash
import { Base } from '@studiometa/js-toolkit';
// ---cut---
class Component extends Base {
  static config = {
    name: 'Component',
    emits: ['open', 'close'],
  };

  open() {
    this.$emit('open');
  }

  close() {
    this.$emit('close');
  }

  toggle() {
    this.$emit('toggle'); // will not be emitted and will trigger a warning
  }
}
```

## `config.log`

- Type: `Boolean`
- Default: `false`

Enable the `this.$log(...args)` method when `true`.

## `config.debug`

- Type: `Boolean`
- Default: `false`

When `true`, the lifecycle hooks and services hooks will be logged to the console.

:::tip
The debug logs are conditionnally rendered base on a `__DEV__` global variable which will default to `false`. To enable it in dev mode, you can use the [`DefinePlugin`](https://webpack.js.org/plugins/define-plugin/) with Webpack or the [`@rollup/plugin-replace`](https://github.com/rollup/plugins/tree/master/packages/replace) with Rollup.

**Example Webpack configuration**

```js twoslash
import webpack from 'webpack';

export default {
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    }),
  ],
};
```

:::
