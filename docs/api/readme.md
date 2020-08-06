---
sidebar: auto
sidebarDepth: 5
prev: /guide/
next: /components/
---

## Instance properties

### `$options`

An object containing the full options of the instance. It is a merge of the [`config`](#config) getter and the `data-options` attribute.

### `$refs`
### `$children`

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
