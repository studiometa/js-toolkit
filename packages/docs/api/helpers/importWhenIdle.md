---
outline: deep
---

# importWhenIdle

Use this function to import components when the [`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) function is called.

## Usage

```js twoslash
import { importWhenIdle } from '@studiometa/js-toolkit';

importWhenIdle(() => import('./components/Component.js'), { timeout: 1000 });
```

**Parameters**

- `importFn` (`() => Promise<Base>`): the function to import components
- `options` (`{ timeout?: number }`): the time to wait in milliseconds before forcing the import to be made, defaults to `1`

**Returns**

- `Promise<Base>`: a promise resolving to the the component's class

## Example

```js {1,7} twoslash
import { Base, importWhenIdle } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component: () => importWhenIdle(() => import('./components/Component.js')),
    },
  };
}
```
