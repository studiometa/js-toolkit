# Configuration

The static `config` property is required on each class extending the `Base` class. It should be used to configure the class.

## `config.name`

- Type: `String`

The **required** name of the component.

```js{3}
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

```js
class Component extends Base {
  static config = {
    name: 'Component',
    options: {
      stringOption: String, // default to ''
      stringWithDefault: { type: String, default: 'Default value' },
      numberOption: Number, // default to 0
      numberWithDefault: { type: Number, default: 10 },
      booleanOption: Boolean, // default to false
      arrayOption: Array, // default to []
      arrayWithDefault: { type: Array, default: () => [1, 2] },
      objectOption: Object, // default to {}
      objectWithDefault: { type: Object, default: () => ({ foo: 'foo' }) },
    },
  };

  mounted() {
    this.$options.stringOption; // ''
    this.$options.stringWithDefault; // 'Default value'
    this.$options.numberOption; // 0
    this.$options.numberWithDefault; // 10
    this.$options.booleanOption; // false
    this.$options.arrayOption; // []
    this.$options.arrayWithDefault; // [1,2]
    this.$options.objectOption; // {}
    this.$options.objectWithDefault; // { foo: 'foo' }

    this.$el.hasAttribute('data-boolean-option'); // false
    this.$options.booleanOption = true;
    this.$el.hasAttribute('data-boolean-option'); // true
  }
}
```

## `config.components`

- Type: `Object`
- Default: `{}`

The children components of the current one that will automatically be mounted and destroyed accordion to the state of the current component. Children components can be defined like the following:

```js
import ComponentOne from './ComponentOne';
import ComponentThree from './ComponentThree';

class App extends Base {
  static config = {
    return {
      name: 'App',
      components: {
        // Direct reference, ComponentOne instances will be mounted
        // on every `[data-component="ComponentOne"]` elements.
        ComponentOne,
        // Async loading, the ComponentTwo component will be loaded only if there
        // is one or more `[data-component="ComponentTwo"]` element in the DOM.
        ComponentTwo: () => import('./ComponentTwo'),
        // Custom selector, ComponentThree instances will be mounted
        // on every `.custom-selector` elements.
        '.custom-selector': ComponentThree,
        // Custom selector with async loading, the ComponentFour component will be loaded
        // only if there is one or more `.other-custom-selector` element in the DOM.
        '.other-custom-selector': () => import('./ComponentFour'),
      },
    };
  }
}
```

::: tip
The [lazy import helpers](/api/helpers/#lazy-import-helpers) can be used to manage more precisely the components' imports.
:::

## `config.refs`

- Type : `Array<String>`
- Default : `[]`

Define the refs of the components by specifying their name in the configuration. Multiple refs should be suffixed with `[]`.

```html
<div data-component="Component">
  <button data-ref="btn">Click me</button>
  <ul>
    <li data-ref="items[]">#1</li>
  </ul>
  <ul>
    <li data-ref="otherItems[]">#1</li>
    <li data-ref="otherItems[]">#2</li>
  </ul>
</div>
```

```js
class Component extends Base {
  static config = {
    name: 'Component',
    refs: ['btn', 'items[]', 'otherItems[]'],
  };

  mounted() {
    this.$refs.btn; // <button data-ref="btn">Click me</button>
    this.$refs.items; // [<li data-ref="items[]">#1</li>]
    this.$refs.otherItems; // [<li data-ref="otherItems[]">#1</li>, <li data-ref="otherItems[]">#2</li>]
  }
}
```

## `config.emits`

- Type: `string[]`
- Default: `undefined`

Define the events emitted by the component by specifying their name.

```js
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

```js
const { DefinePlugin } = require('webpack');

module.exports = {
  plugins: [
    new DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    }),
  ],
};
```

:::
