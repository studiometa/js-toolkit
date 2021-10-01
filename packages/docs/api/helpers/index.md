---
sidebar: true
prev: /api/
next: /decorators/
---

# Helpers

The following helper functions can be used to achieve advanced setup of your application.

## App helper

<div id="createApp"></div>

### `createApp(AppClass, rootElement)`

Use the `createApp` function to instantiate your application on page load while being able to use the instance in other files.

**Parameters**

- `AppClass` (`typeof Base`): the class for your app
- `rootElement` (`HTMLElement`): the root element for your app

**Returns**

- `useApp` (`() => Promise<Base>`): a function returning a promise which resolves to the app instance

**Example**

```js{3,11}
// app.js
import { Base, createApp } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

export default createApp(App, document.body);
```

```js{5-6}
// other.js
import useApp from './app.js';

(async () => {
  const app = await useApp();
  console.log(app.$el); // document.body
})()
```

## Lazy import helpers

Some components might not need to be imported and instantiated immediately on page load. The following functions will help you define custom scenarios for when to import these components.

<div id="importOnInteraction"></div>

### `importOnInteraction(importFn, selector, events, parent)`

Use the `importOnInteraction` function to import component when the user interacts with an element.

**Parameters**

- `importFn` (`() => Promise<typeof Base>`): the function to import components
- `selector` (`string`): the name of the component or a CSS selector, the same logic as [components resolution](/api/#config-components) will be used
- `events` (`string|string[]`): one or many events which should trigger the import
- `parent` (`Base`): the parent Base instance used to query the `selector`, if not specified `selector` will be searched in the whole document.

**Returns**

- `Promise<typeof Base>`: a promise resolving to the the component's class

**Example**

```js{2,8-14,16-22,24-29}
import { Base, importOnInteraction } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      // Import the class when clicking on the root element of the component.
      Component: (app) => importOnInteraction(
        () => import('./components/Component.js'),
        'Component',
        'click',
        app
      ),

      // Import the class when clicking on the `#import-other-component-trigger`
      // element which can be anywhere in the DOM.
      OtherComponent: () => importOnInteraction(
        () => import('./components/Othercomponents.js'),
        '#import-other-component-trigger',
        'click',
      ),

      // Import the class when clicking on the app's `btn` ref
      ThirdComponent: (app) => importOnInteraction(
        () => import('./components/ThirdComponent.js'),
        app.$refs.btn,
        'click'
      ),
    },
    refs: ['btn'],
  };
}
```
<div id="importWhenIdle"></div>

### `importWhenIdle(importFn, options)`

Use this function to import components when the [`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) function is called.

**Parameters**

- `importFn` (`() => Promise<Base>`): the function to import components
- `options` (`{ timeout?: number }`): the time to wait before forcing the import to be made

**Returns**

- `Promise<Base>`: a promise resolving to the the component's class

**Example**

```js{8}
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

<div id="importWhenVisible"></div>

### `importWhenVisible(importFn, selector, parent, observerOptions)`

Use this function to import component when an element is visible.

**Parameters**

- `importFn` (`() => Promise<Base>`): the function to import components
- `selector` (`string`): the name of the component or a CSS selector, the same logic as [components resolution](#config-components) will be used
- `parent` (`Base`): the parent Base instance used to query the `selector`, if not specified `selector` will be searched in the whole document.
- `observerOptions` ([`IntersectionObserverInit`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver)): options for the `IntersectionObserver` instance

**Returns**

- `Promise<Base>`: a promise resolving to the the component's class

**Example**

```js{2,8-13,15-20,22-27}
import { Base, importWhenVisible } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      // Import the class when the root element of the component is visible.
      Component: (app) => importWhenVisible(
        () => import('./components/Component.js'),
        'Component',
        app
      ),

      // Import the class when the `#import-other-component-trigger`
      // element, which can be anywhere in the DOM, is visible.
      OtherComponent: () => importWhenVisible(
        () => import('./components/Othercomponents.js'),
        '#import-other-component-trigger'
      ),

      // Import the class when the app's `btn` ref is visible.
      ThirdComponent: (app) => importWhenVisible(
        () => import('./components/ThirdComponent.js'),
        app.$refs.btn
      ),
    },
    refs: ['btn'],
  };
}
```

