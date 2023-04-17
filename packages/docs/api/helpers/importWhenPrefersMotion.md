# importWhenPrefersMotion

Use this function to import components when the user accepts motion.

## Usage

```js
import { importWhenPrefersMotion } from '@studiometa/js-toolkit';

// Import Component.js if the user accepts motion.
importWhenPrefersMotion(() => import('./components/Component.js'));
```

**Parameters**

- `importFn` (`() => Promise<Base>`): the function to import components

**Returns**

- `Promise<Base>`: a promise resolving to the the component's class

## Example

```js{1,7}
import { Base, importWhenPrefersMotion } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component: () => importWhenPrefersMotion(() => import('./components/Component.js')),
    },
  };
}
```
