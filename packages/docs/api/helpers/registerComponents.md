# registerComponents

Registers and mounts multiple components at once. It is a thin wrapper around [`registerComponent`](./registerComponent.md), looping over each given constructor so you do not have to call `registerComponent` repeatedly.

::: tip 💡 Naming components
As with [`registerComponent`](./registerComponent.md), the [`config.name` property](/api/configuration.md#config-name) of each component is used to register and look for components in the DOM. Use `registerComponent` directly when you need a custom name or selector.
:::

## Usage

```js
import { registerComponents } from '@studiometa/js-toolkit';
import Action from './Action.js';
import DataBind from './DataBind.js';
import Figure from './Figure.js';

registerComponents(Action, DataBind, Figure);
```

This is equivalent to:

```js
import { registerComponent } from '@studiometa/js-toolkit';
import Action from './Action.js';
import DataBind from './DataBind.js';
import Figure from './Figure.js';

registerComponent(Action);
registerComponent(DataBind);
registerComponent(Figure);
```

Async, factory and lazy components are supported too, since each argument is forwarded to [`registerComponent`](./registerComponent.md):

```js
import {
  registerComponents,
  importWhenVisible,
} from '@studiometa/js-toolkit';
import Action from './Action.js';

registerComponents(
  Action,
  import('./DataBind.js'),
  () => import('./Table.js'),
  importWhenVisible(() => import('./Figure.js'), 'Figure'),
);
```

**Parameters**

- `...ctors` (`(typeof Base | Promise<typeof Base | { default: typeof Base }> | (() => Promise<typeof Base | { default: typeof Base }>))[]`): a list of components, each accepting the same forms as [`registerComponent`](./registerComponent.md)'s `ctor` parameter

**Return value**

- `instances` (`Promise<Base[]>`): a promise resolving to a flat array of the created instances

## Error handling

Components are registered independently, down to each instance. A failure — a rejected dynamic `import(...)`, or a single element that fails to mount — does not prevent the other components or instances from being registered, and the returned array contains every instance that mounted successfully. Failures are skipped and logged with `console.error` in development.

```js
import { registerComponents } from '@studiometa/js-toolkit';
import Action from './Action.js';

// `Action` is still registered even though the lazy import fails.
const instances = await registerComponents(
  Action,
  () => import('./Missing.js'),
);
```
