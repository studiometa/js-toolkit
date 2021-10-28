# importWhenVisible

Use this function to import component when an element is visible.

## Usage

```js
import { importWhenVisible } from '@studiometa/js-toolkit';

importWhenVisible(
  () => import('./components/Component.js'),
  'Component'
);
```

**Parameters**

- `importFn` (`() => Promise<Base>`): the function to import components
- `selector` (`string`): the name of the component or a CSS selector, the same logic as [components resolution](#config-components) will be used
- `parent` (`Base?`): the parent Base instance used to query the `selector`, if not specified `selector` will be searched in the whole document.
- `observerOptions` ([`IntersectionObserverInit?`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver)): options for the `IntersectionObserver` instance

**Returns**

- `Promise<Base>`: a promise resolving to the the component's class

## Examples

Import the class when the root element of the component is visible:

```js{1,7-11}
import { Base, importWhenVisible } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component: (app) => importWhenVisible(
        () => import('./components/Component.js'),
        'Component',
        app
      ),
    }
  }
}
```

Import the class when the `#import-component-trigger` element, which can be anywhere in the DOM, is visible:

```js{1,7-10}
import { Base, importWhenVisible } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component: () => importWhenVisible(
        () => import('./components/Component.js'),
        '#import-component-trigger'
      ),
    }
  }
}
```
Import the class when the app's `btn` ref is visible:

```js{1,8-11}
import { Base, importWhenVisible } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    refs: ['btn'],
    components: {
      Component: (app) => importWhenVisible(
        () => import('./components/Component.js'),
        app.$refs.btn
      ),
    },
  };
}
```
