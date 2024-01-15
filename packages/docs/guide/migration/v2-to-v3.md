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

```diff
- export default createApp(App, document.body);
+ export default createApp(App, {
+   root: document.body,
+   screens: {
+     s: '30rem',
+     m: '60rem',
+     l: '90rem',
+   },
+ });
```

## The `focusTrap` export has been refactored

In v2 you had to import the `focusTrap` function and then execute it to get the `trap` and `untrap` functions.

The `trap` and `untrap` functions are now exported directly as `trapFocus` and `untrapFocus`.

```diff
- import { trapFocus } from '@studiometa/js-toolkit/utils';
+ import { trapFocus, untrapFocus } from '@studiometa/js-toolkit/utils';

- const { trap, untrap } = trapFocus();
- trap(element, event);
- untrap();
+ trapFocus(element, event);
+ untrapFocus();
```
