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

## The `on...` method arguments have been refactored

The number of arguments passed to the `on...` methods and their order were different for each type of target: a child component, a ref, the current instance, etc. In v3, all `on...` methods receive a single `context` argument of the following type:

```ts
type EventHooksCallbackParams = {
  event: Event;
  args: Array<any>;
  index: number;
  target: Element | Base | Promise<Base> | typeof window | typeof document;
};
```

To migrate from v2 to v3, update the arguments of all your `on...` methods:

```js
class Component extends Base {
  onClick(event) { // [!code --]
  onClick({ event }) { // [!code ++]
    event.preventDefault();
  }

  onCustomEvent(event, arg1, arg2) { // [!code --]
  onCustomEvent({ args: [arg1, arg2] }) { // [!code ++]
    console.log(arg1, arg2);
  }

  onRefClick(event, index) { // [!code --]
  onRefClick({ target }) { // [!code ++]
    const target = this.$refs.Ref[index]; // [!code --]
    target.classList.toggle('is-active');
  }

  onChildCustomEvent(event, arg1, index) { // [!code --]
  onChildCustomEvent({ target }) { // [!code ++]
    const target = this.$children.Child[index]; // [!code --]
    target.doSomething()
  }
}
```

## Lifecycle methods are now async

The `$mount`, `$update`, `$destroy` and `$terminate` methods are now async and can be awaited. This should not have a big impact on existing projects, but in case you are trying to access a newly mounted child component after calling the `$update()` method, you should await its result to be sure the component is mounted.

```js
this.$update(); // [!code --]
await this.$update(); // [!code ++]
this.$children.Component[0].toggle();
```

## Unconfigured events are not listenable anymore

In v2, custom events that were not configured via the [static `config` property](/api/configuration.html) were still taken in consideration when adding event listeners with the [`$on` method](/api/instance-methods.html#on-event-callback-options) or the [`on...` event hooks](/api/methods-hooks-events.html). This behavior is removed in v3, meaning that each component must define the events it will emit.

To migrate, make sure to add the events that will be emitted to the static `config` object with the `emits` property.

```js
class MyComponent extends Base {
  static config = {
    name: 'MyComponent',
    emits: ['custom-event'], // [!code ++]
  };

  mounted() {
    this.$emit('custom-event');
  }

  onCustomEvent() {
    // ...
  }
}
```

## Custom events are now emitted on the root element

In v2, events defined on an instance were dispatched on the instance itself. With v3, the custom events defined in the [`config.emits` configuration](/api/configuration.html#config-emits) are now dispatched on the instance root element.

This is considered a breaking change for the following reason:

- The `Base` class no longer extends the `EventTarget` class
- Custom event emitted might conflict with native events

## The `useService` export has been deleted

The services implementation have been refactored as classes instead of the previous functional style. The `useService` function that could be used to create additional services has been removed in favor of the `AbstractService` class.

::: code-group

```js [v2]
import { useService } from '@studiometa/js-tookit';

export function useCustomService() {
  const { add, remove, has, get } = useService({
    props: {},
    init() {},
    kill() {},
  });

  return {
    add,
    remove,
    has,
    get,
    props: () => props,
  };
}
```

```js [v3]
import { AbstractService } from '@studiometa/js-tookit';

class CustomService extends AbstractService {
  props = {};

  init() {}

  kill() {}
}

export function useCustomService() {
  return CustomService.getInstance();
}
```

:::
