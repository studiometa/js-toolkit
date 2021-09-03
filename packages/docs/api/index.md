---
sidebar: auto
sidebarDepth: 6
prev: /guide/
next: /components/
---

# API

## Global API

### `class ＜Name＞ extends Base`

Create components with ease by extending the `Base` class.

**Constructor parameters**
- `element` (`HTMLElement`): the root element of the component/application

**Examples**

Create an app using the [`Modal` component](/components/Modal.html) and instantiate it:

```js
import Base from '@studiometa/js-toolkit';
import Modal from '@studiometa/js-toolkit/components/Modal';
import Component from './components/Component';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Modal,
      Component,
    },
  };
}

const app = new App(document.body);
app.$mount();

export default app;
```

Create a component to be used by another component:

```js
import Base from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    this.$log('mounted');
  }

  onClick() {
    this.$log('clicked');
  }
}
```

## Static methods

### `$factory(nameOrSelector)`

Use the `$factory` method to instantiate a class on each elements matching the given component's name or CSS selector. This methods works like the [child component resolution](#components).

**Parameters**

- `nameOrSelector` (`String`): the name of the component or a CSS selector

**Returns**

- `Base[]`: an array of instances of the component that triggered the method

## Interface static properties

### `config`

The static `config` property must is required on each class extending the `Base` class.

### `config.name`

- Type: `String`

The **required** name of the component.

```js{3}
class Component extends Base {
  static config = {
    name: 'Component',
  };
}
```

### `config.options`

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
      arrayWithDefault: { type: Array, default: () => ([1, 2]) },
      objectOption: Object,
      objectWithDefault: { type: Object, default: () => ({ foo: 'foo' }) },
    }
  }

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

### `config.components`

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

### `config.refs`

- Type : `Array<String>`
- Default : `[]`

Define the refs of the components by specifying their name in the configuration. Multiple refs should be suffixed with `[]`.

```js
/**
 * Given the following HTML:
 *
 * ```html
 * <div data-component="Component">
 *   <button data-ref="btn">Click me</button>
 *   <ul>
 *     <li data-ref="items[]">#1</li>
 *   </ul>
 *   <ul>
 *     <li data-ref="otherItems[]">#1</li>
 *     <li data-ref="otherItems[]">#2</li>
 *   </ul>
 * </div>
 * ```
 */
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

### `config.log`

- Type: `Boolean`
- Default: `false`

Enable the `this.$log(...args)` method when `true`.

### `config.debug`

- Type: `Boolean`
- Default: `false`

When `true`, the lifecycle hooks and services hooks will be logged to the console.

The debug logs are conditionnally rendered base on a `__DEV__` global variable which will default to `false`. To enable it in dev mode, you can use the [`DefinePlugin`](https://webpack.js.org/plugins/define-plugin/) with Webpack or the [`@rollup/plugin-replace`](https://github.com/rollup/plugins/tree/master/packages/replace) with Rollup.

#### Example Webpack configuration
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

## Interface methods

### `mounted()` <Badge vertical="middle" text="Lifecycle hooks" />
### `loaded()` <Badge vertical="middle" text="Lifecycle hooks" />
### `destroyed()` <Badge vertical="middle" text="Lifecycle hooks" />
### `terminated()` <Badge vertical="middle" text="Lifecycle hooks" />
### `scrolled(props)` <Badge vertical="middle" text="Service hooks" />
### `resized(props)` <Badge vertical="middle" text="Service hooks" />
### `keyed(props)` <Badge vertical="middle" text="Service hooks" />
### `moved(props)` <Badge vertical="middle" text="Service hooks" />
### `ticked(props)` <Badge vertical="middle" text="Service hooks" />

### `on＜Event＞(event)` <Badge vertical="middle" text="Event handlers" />

Methods following this pattern will be executed when the event is triggered on the instance's `$el` element.

**Arguments**
- `event` ([`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event)): the event object

**Example**
```js{8-9}
class Foo extends Base {
  get config() {
    return {
      name: 'Foo',
    };
  }

  // Will be triggered when clicking on `this.$el`
  onClick(event) {}

  // The same behaviour can be implemented by doing the following:
  mounted() {
    this.$el.addEventListener('click', this.onClick);
  }

  destroyed() {
    this.$el.removeEventListener('click', this.onClick);
  }
}
```

### `on＜RefOrChildName＞＜Event＞(event, index)` <Badge vertical="middle" text="Event handlers" />

Methods following this pattern will be executed when the corresponding event is triggered on the corresponding ref or child element.

**Arguments**
- `event|...args` ([`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) or `mixed`): the event object when triggered from a native DOM event, the event arguments when triggered by a component
- `index` (`Number`): the index of the ref triggering the event when multiple refs exists

:::warning
Native DOM events will only be binded to ref elements and component's events to child components.
:::

**Examples**
```html{2-3,14-17}
<div data-component="Foo">
  <button data-ref="btn">Open</btn>
  <button data-ref="btn">Close</btn>
</div>

<script>
  class Foo extends Base {
    get config() {
      return {
        name: 'Foo',
      };
    }

    // Will be triggered when clicking on one of `this.$refs.btn`
    // `event` is the click event's object
    // `index` is the index of the ref that triggered the event
    onBtnClick(event, index) {}
  }

  new Foo(document.querySelector('[data-component="Foo"]'));
</script>
```

```html{2,18-20,24-25}
<div data-component="Foo">
  <div data-component="Baz"></div>
</div>

<script>
  class Baz extends Base {
    get config() {
      return {
        name: 'Baz',
      };
    }
  }

  class Foo extends Base {
    get config() {
      return {
        name: 'Foo',
        components: {
          Baz,
        },
      };
    }

    // Will be triggered when the component emits the `mounted` event
    onBazMounted() {}
  }

  new Foo(document.querySelector('[data-component="Foo"]'));
</script>
```

## Instance properties

### `$options`

An object containing the full options of the instance as defined in the [`config.options`](#options) property. Additionnally to the options defined in the config, the following properties are also available:

- `$options.name` The name of the component
- `$options.log` Wether the `$log` method is silent or not
- `$options.debug` Wether the debug is active on this instance or not

The values for the `$options` object are read from and written to the `data-option-<option-name>` attribute of the root element.

:::tip
Boolean options with `true` as a default value can be negated with a `data-option-no-<option-name>` attribute.
:::

### `$refs`

An object containing references to all the component's refs, with each key being the name of the ref, and each value either the DOM element or a list of DOM elements.

```ts
interface RefsInterface {
  readonly [refName: string]: HTMLElement | Base | HTMLElement[] | Base[] ;
}
```

Refs are resolved with the selector `data-ref="<refName>"` within the component's scope. Refs of [children components](#components) are excluded, even if the child has not been registered via the [`config.components`](#components) object.

:::tip
You can force a ref to be an `Array` even when only one corresponding element exists in the DOM by appending `[]` to its name:

```html
<ul>
  <li data-ref="item[]"></li>
</ul>
```
:::

### `$children`

An object containing references to all the children component instances, with each key being the name of the child component, and each value a list of its corresponding instances.

```ts
interface ChildrenInterface {
  readonly [ComponentName: string]: Array<Base>;
}
```

### `$parent`

The parent instance when the current instance has been mounted as [child component](#components), defaults to `null` if the component as been instantiated as a stand-alone component.

### `$services`

A [Service](https://github.com/studiometa/js-toolkit/blob/master/src/abstracts/Base/classes/Services.js) instance to manage the [`scrolled`](#scrolled-props), [`resized`](#resized-props), [`ticked`](#ticked-props), [`moved`](#moved-props), [`keyed`](#keyed-props), [`loaded`](#loaded) services hooks.

The following methods are available:

- `has(service: string): boolean`: test if the current component instance has the service method defined and if it is currently enabled
- `enable(service: string): () => void`: enable the given service if the current component instance has the service method defined, returns a function to disable the service
- `disable(service: string): void`: disable the given service
- `enableAll(): Array<() => void>`: enable all services which are defined
- `disableAll(): void`: disable all services

#### Example

```js
class Component extends Base {
  static config = {
    name: 'Component',
    refs: ['btn'],
  };

  onBtnClick() {
    if (this.$services.has('ticked')) {
      this.$services.enable('ticked');
    } else {
      this.$services.disable('ticked');
    }
  }

  ticked() {
    // Do something on each frame...
  }
}
```

## Instance methods

### `$log(…content)`

Can be used to log content to the console when the `instance.$options.log` options is set to true, either via the `config` getter or via the `data-options` attribute.

### `$on(event, callback)`

Bind a callback function to an event emitted by the instance. Returns a function to unbind the callback from the event.

### `$once(event, callback)`

Similar as the `$on` method, but the callback function will be detached from the event after being called once.

### `$off(event[, callback])`

Unbind a callback function from an event emitted by the instance. If no callback function is provided, all previously binded callbacks will be removed.

### `$emit(event[, …args])`

Emit an event from the current instance, with optional custom arguments.

### `$mount()`

Mount the component and its children, will trigger the `mounted` lifecycle method.

### `$update()`

Update the chidlren list from the DOM, and mount the new ones. This method can be used when inserting new content loaded over Ajax.

### `$destroy()`

Destroy the component and its children, will trigger the `destroyed` lifecycle method.

### `$terminate()`

Terminate the component, its instance is made available to garbage collection. A terminated component can not be re-mounted, use with precaution.

## Events

### `mounted`
### `loaded`
### `scrolled`
### `resized`
### `keyed`
### `moved`
### `ticked`
### `updated`
### `destroyed`
### `terminated`
### `get:options`
### `get:refs`
### `get:children`

