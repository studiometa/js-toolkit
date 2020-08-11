---
sidebar: auto
sidebarDepth: 5
prev: /guide/
next: /components/
---

## Instance properties

### `$options`

An object containing the full options of the instance. It is a merge of the [`config`](#config) getter and the `data-options` attribute.

Any change to this property will be merged with the `data-options` attribute and saved in the DOM in the same attribute.

### `$refs`

An object containing references to all the component's refs, with each key being the name of the ref, and each value either the DOM element or a list of DOM elements.

```js
{
  <RefName>: <HTMLElement> || [...<HTMLElement>]
}
```

### `$children`

An object containing references to all the children component instances, with each key being the name of the child component, and each value a list of its corresponding instances.

```js
{
  <ComponentName>: [...<componentInstance>]
}
```

### `$parent`

The parent instance when the current instance has been mounted as [child component](#components), defaults to `null` if the component as been instantiated as a stand-alone component.

## Instance methods

### `$log(content)`

Can be used to log content to the console when the `instance.$options.log` options is set to true, either via the `config` getter or via the `data-options` attribute.

### `$mount()`

Mount the component and its children, will trigger the `mounted` lifecycle method.

### `$destroy()`

Destroy the component and its children, will trigger the `destroyed` lifecycle method.

## Class getters

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

## Class methods

### Lifecycle hooks

#### `mounted`
#### `loaded`
#### `destroyed`

### Services hooks

#### `scrolled`
#### `resized`
#### `keyed`
#### `moved`
#### `ticked`

### Event handlers

#### `on<Event>`
#### `on<Refname><Event>`

## Events

### `mounted`
### `loaded`
### `scrolled`
### `resized`
### `keyed`
### `moved`
### `ticked`
### `destroyed`
### `get:options`
### `get:refs`
### `get:children`
