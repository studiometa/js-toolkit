# importOnMediaQuery

Use this function to import components according to a specified [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media#media_features).

## Usage

```js{6}
import { importOnMediaQuery } from '@studiometa/js-toolkit';

// Import Component.js if the device is in portrait.
importOnMediaQuery(
  () => import('./components/Component.js'),
  '(orientation: portrait)',
);
```

**Parameters**

- `importFn` (`() => Promise<Base>`): the function to import components
- `media` (`string`): a [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media#media_features)

**Returns**

- `Promise<Base>`: a promise resolving to the the component's class

## Example

```js{1,7,9}
import { Base, importOnMediaQuery } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component: () => importOnMediaQuery(
        () => import('./components/Component.js'),
        '(orientation: portrait)',
      ),
    },
  };
}
```
