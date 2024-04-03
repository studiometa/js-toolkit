# Migrating from v2 to v3

Make sure to read through the following steps to ensure a smooth upgrade from v2 to v3 of this package.

[[toc]]

## The package is ESM only

Introduced in [#394](https://github.com/studiometa/js-toolkit/pull/394), the package is now ESM only and does not include CJS files anymore.

This should have no impact on most projects as files are handled by bundlers most of the time.

## The `withVue2` decorator is removed

The `withVue2` decorator is removed, along with the package's dependency to the `vue@2` package.

If your project is using this decorator, you can copy the [latest version](https://github.com/studiometa/js-toolkit/blob/support/2.x/packages/js-toolkit/decorators/withVue2.ts) from the package in your project and keep using it.

See pull-request [#395](https://github.com/studiometa/js-toolkit/pull/395) for more details.

## Breakpoints are no longer read from the DOM

In the previous versions, breakpoints values for the [resize service](/api/services/useResize.html) were read from the DOM by looking for a `[data-breakpoint]` element. In v3, this is no longer supported, breakpoints should be defined when creating your app with [the `createApp()` function](/api/helpers/createApp.html).

```diff
- <div data-breakpoint>…</div>
```

```js
export default createApp(App, document.body); // [!code --]
export default createApp(App, { // [!code ++]
  root: document.body, // [!code ++]
  screens: { // [!code ++]
    s: '30rem', // [!code ++]
    m: '60rem', // [!code ++]
    l: '90rem', // [!code ++]
  }, // [!code ++]
}); // [!code ++]
```

## The `focusTrap` export has been refactored

In v2 you had to import the `focusTrap` function and then execute it to get the `trap` and `untrap` functions.

The `trap` and `untrap` functions are now exported directly as `trapFocus` and `untrapFocus`.

```js
import { trapFocus } from '@studiometa/js-toolkit/utils'; // [!code --]
import { trapFocus, untrapFocus } from '@studiometa/js-toolkit/utils'; // [!code ++]

const { trap, untrap } = trapFocus(); // [!code --]
trap(element, event); // [!code --]
untrap(); // [!code --]
trapFocus(element, event); // [!code ++]
untrapFocus(); // [!code ++]
```

## The `loaded` hook has been removed

In the previous versions, a `loaded` hook was present on any component extending the `Base` class. It was triggered by the `load` event on the `window`. Due to its ease of implementation and its low usage, it has been removed.

```js
import { Base } from '@studiometa/js-toolkit';}

class Component extends Base {
  static config = {
    name: 'Component',
  };

  loaded() { // [!code --]
    console.log('page is loaded') // [!code --]
  mounted() { // [!code ++]
    window.addEventListener('load', () => { // [!code ++]
      console.log('page is loaded'); // [!code ++]
    }); // [!code ++]
  }
}
```

You can still use the [`useLoad` service](/api/services/useLoad.html) as a replacement if needed, as it handles the possibility of the `load` event having been fired already.

## The return value of the `scrollTo` function has changed

Previously, the `scrollTo` function could only be used to scroll vertically. It can now scroll horizontally as well. With this new feature, we had to change the return type of the function from `Promise<number>` to `Promise<{ top: number, left: number }>`.

```js
import { scrollTo } from '@studiometa/js-toolkit/utils';

const scrollY = await scrollTo('#target'); // [!code --]
const { left: scrollY } = await scrollTo('#target'); // [!code ++]
```
