# importOnInteraction

Use the `importOnInteraction` function to import component when the user interacts with an element.

## Usage

```js
import { importOnInteraction } from '@studiometa/js-toolkit';

importOnInteraction(
  () => import('./components/Component.js'),
  'Component',
  'click',
);
```

**Parameters**

- `importFn` (`() => Promise<typeof Base>`): the function to import components
- `selector` (`string`): the name of the component or a CSS selector, the same logic as [components resolution](/api/#config-components) will be used
- `events` (`string|string[]`): one or many events which should trigger the import
- `parent` (`Base`): the parent Base instance used to query the `selector`, if not specified `selector` will be searched in the whole document.

**Returns**

- `Promise<typeof Base>`: a promise resolving to the the component's class

## Examples

Import the class when clicking on the root element of the component:

```js{1,7-12}
import { Base, importOnInteraction } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component: (app) => importOnInteraction(
        () => import('./components/Component.js'),
        'Component',
        'click',
        app
      ),
    }
  }
}
```
Import the class when clicking on the `#import-component-trigger` element which can be anywhere in the DOM:

```js{1,7-11}
import { Base, importOnInteraction } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component: () => importOnInteraction(
        () => import('./components/Component.js'),
        '#import-component-trigger',
        'click',
      ),
    }
  }
}
```

Import the class when clicking on the app's `btn` ref:

```js{1,7-11}
import { Base, importOnInteraction } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component: (app) => importOnInteraction(
        () => import('./components/Component.js'),
        app.$refs.btn,
        'click'
      ),
    },
    refs: ['btn'],
  };
}
```
