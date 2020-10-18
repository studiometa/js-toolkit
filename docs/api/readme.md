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
  get config() {
    return {
      name: 'App',
      components: {
        Modal,
        Component,
      },
    };
  }
}

export default new App(document.body);
```

Create a component to be used by another component:

```js
import Base from '@studiometa/js-toolkit';

export default class Component extends Base {
  get config() {
    return {
      name: 'Component',
    };
  }

  mounted() {
    this.$log('mounted');
  }

  onClick() {
    this.$log('clicked');
  }
}
```

### `defineComponent(options)`

Define a component without having to extend the `Base` class.

**Parameters**
- `options.config` (`Object`): see the [config getter](#config)
- `options.methods` (`Object`): used for functions other than the [`Base` class methods](#class-methods)
- `options[<name>]` (`Function`): [class methods](#class-methods) of the component

**Returns**

- A constructor function for the component

**Examples**

For legacy projects, use the UMD build:

```html
<script src="https://unpkg.com/@studiometa/js-toolkit/index.umd.js"></script>
<script>
  var Component = Base.defineComponent({
    config: {
      name: 'Component',
    },
    mounted: function() {
      this.$log('mouted');
    },
    methods: {
      onClick: function() {
        this.$log('clicked');
      },
    },
  });

  new Component(document.body);
</script>
```

For modern projects, prefer using the NPM package:

```js
import { defineComponent } from '@studiometa/js-toolkit';

const Component = defineComponent({
  config: {
    name: 'Component',
  },
  mounted() {
    this.$log('mounted');
  },
  methods: {
    onClick() {
      this.$log('clicked');
    },
  },
});

new Component(document.body);
```

:::warning
The `defineComponent(options)` function is aimed at legacy projects which can not use classes. Modern projects should use the class based approach.
:::

### `createBase(element, options)`

Define a component and instantiate it on the given element.

**Parameters**
- `element` (`HTMLElement`): the root element for the component's instance
- `options` (`Object`): the component's configuration, see the [`defineComponent` function documentation](#definecomponent-options)

**Returns**

- `Base`: The given component's instance mounted on the given element, or first element in the DOM when given a CSS selector.

**Examples**

For legacy projects, use the UMD build:

```html
<script src="https://unpkg.com/@studiometa/js-toolkit/index.umd.js"></script>
<script>
  var app = Base.createBase(document.body, {
    config: {
      name: 'App',
    },
  });
</script>
```

For modern projects, prefer using the NPM package:

```js
import { createBase } from '@studiometa/js-toolkit';

const app = createBase(document.body, {
  config: {
    name: 'App',
  },
});
```

:::warning
The `createBase(elementOrSelector, options)` function is aimed at legacy projects which can not use classes. Modern projects should use the class based approach.
:::

## Static methods

### `$factory(nameOrSelector)`

Use the `$factory` method to instantiate a class on each elements matching the given component's name or CSS selector. This methods works like the [child component resolution](#components).

**Parameters**

- `nameOrSelector` (`String`): the name of the component or a CSS selector

**Returns**

- `Base[]`: an array of instances of the component that triggered the method

## Instance properties

### `$options`

An object containing the full options of the instance. It is a merge of the [`config`](#config) getter and the `data-options` attribute.

Any change to this property will be merged with the `data-options` attribute and saved in the DOM in the same attribute.

### `$refs`

An object containing references to all the component's refs, with each key being the name of the ref, and each value either the DOM element or a list of DOM elements.

```ts
interface RefsInterface {
  readonly [refName: string]: HTMLElement | Array<HTMLElement>;
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

@todo

## Interface getters

### `config`
#### `name`

- Type: `String`

The **required** name of the component.

#### `components`

- Type: `Object`
- Default: `{}`

The children components of the current one that will automatically be mounted and destroyed accordion to the state of the current component. Children components can be defined like the following:

```js
import ComponentOne from './ComponentOne';
import ComponentThree from './ComponentThree';

class App extends Base {
  get config() {
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

#### `log`

- Type: `Boolean`
- Default: `false`

Enable the `this.$log(...args)` method when `true`.

#### `debug`

- Type: `Boolean`
- Default: `false`

When `true`, the lifecycle hooks and services hooks will be logged to the console.

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
