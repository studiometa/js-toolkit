# registerComponent

Use the `registerComponent` function to register a component in the global registry and mount it on the current matching elements in the DOM. This function can be used to instantiate components without having to use the parent → child relationship of the [`config.components` configuration](/api/configuration.md#config-components).

This function is inspired by the [`customElements.define()` function](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) of Web Components.

::: tip 💡 Naming components
When using the `registerComponent` function to load and mount components, the [`config.name` property](/api/configuration.md#config-name) of the component is used to register and look for components.
:::

## Usage

```js twoslash
import { registerComponent, importWhenVisible } from '@studiometa/js-toolkit';
import Component from './Component.js';
import Link from './Link.js';

// Sync
registerComponent(Component);

// Async
registerComponent(import('./AsyncComponent.js'));

// Lazy
registerComponent(
  importWhenVisible(() => import('./LazyComponent.js'), 'LazyComponent'),
);

// Custom selector
registerComponent(Link, 'a[href^="https"]');
```

**Parameters**

- `ctor` (`typeof Base | Promise<typeof Base>`): a component class
- `nameOrSelector` (`string`): an optional name or selector to use to find components in the DOM instead of the `config.name` property

**Return value**

- `instances` (`Promise<Base>[]`): a list of promise resolving to the created instances of the component

## Examples

### Basic usage

Use the `registerComponent` function to register a component globally.

```js twoslash
import { Base, registerComponent } from '@studiometa/js-toolkit';

class Component extends Base {
  static config = {
    name: 'Component',
  };
}

registerComponent(Component);
```

### Async components

Register components asynchroneously by providing a dynamic import as parameter.

```js
import { registerComponent } from '@studiometa/js-toolkit';

importWhenVisible(import('./AsyncComponent.js'));
```

### Lazy components

You can use the lazy import helpers such as [`importWhenVisible`](./importWhenVisible.md) to register lazy components.

```js twoslash
import { registerComponent, importWhenVisible } from '@studiometa/js-toolkit';

registerComponent(
  importWhenVisible(() => import('./LazyComponent.js'), 'LazyComponent'),
);
```
