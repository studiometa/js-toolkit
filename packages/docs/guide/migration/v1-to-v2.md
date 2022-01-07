# Migrating from v1 to v2

Apply the following steps to your project to ensure a smooth upgrade from v1 to v2.

[[toc]]

## Update imports

Exports have been simplified in the v2 version, there are now 2 main entry points: `@studiometa/js-toolkit` and `@studiometa/js-toolkit/utils`. Nested import can still be used but will certainly be removed in a later version, so use them with caution.

All deep nested imports can be rewritten to import the named exports from one of these two entrypoints. The `Base` class, the decorators, the services and the helpers can be imported from the root entry:

```diff
- import Base from '@studiometa/js-toolkit';
- import { withMountWhenInView } from '@studiometa/js-toolkit/decorators';
- import { useScroll } from '@studiometa/js-toolkit/services';
- import { importWhenVisible } from '@studiometa/js-toolkit/helpers';
+ import {
+   Base,
+   withMountWhenInView,
+   useScroll,
+   importWhenVisible
+ } from '@studiometa/js-toolkit';
```

All utilities can be imported from the `@studiometa/js-toolkit/utils` entry:

```diff
- import debounce from '@studiometa/js-toolkit/utils/debounce';
- import throttle from '@studiometa/js-toolkit/utils/throttle';
+ import { debounce, throttle } from '@studiometa/js-toolkit/utils';
```

**math utilities**

```diff
- import damp from '@studiometa/js-toolkit/utils/math/damp';
- import clamp01 from '@studiometa/js-toolkit/utils/math/clamp01';
+ import { damp, clamp01 } from '@studiometa/js-toolkit/utils';
```

**css utilities**

```diff
- import matrix from '@studiometa/js-toolkit/utils/css/matrix';
- import transition from '@studiometa/js-toolkit/utils/css/transition';
+ import { matrix, transition } from '@studiometa/js-toolkit/utils';
```

:::warning Deleted exports
The `styles` and `classes` exports of the `/utils/css/` namespace have been deleted as they are internal utils.
:::

**object utilities**

:::warning Deleted exports
The `autoBind`, `getAllProperties` and `isObject` exports of the `/utils/object` namespace have been deleted as they are internal utils.
:::

**history API utilities**

```diff
- import { push, replace, objectToURLSearchParams } from '@studiometa/js-toolkit/utils/history';
+ import {
+   historyPush,
+   historyReplace,
+   objectToURLSearchParams ,
+ } from '@studiometa/js-toolkit/utils';
```

## Define all refs

In the v1, all elements with a `data-ref="refName"` inside the scope of a `data-component` were registered as refs with the `config.refs` definition used to display warnings when a ref was found but not defined.

The v2 is more strict and will only look up refs defined in [the `config.refs` property](/api/configuration.html#config-refs), without warning if some extra refs exists in the scope of the component.

**HTML**

```html
<div data-component="Foo">
  <div data-ref="one"></div>
  <div data-ref="two"></div>
</div>
```

**v1**

```js {4,8}
class Foo extends Base {
  static config = {
    name: 'Foo',
    refs: ['one'],
  };

  mounted() {
    console.log(this.$refs); // Before: { one: HTMLElement, two: HTMLElement }
  }
}
```

**v2**

```js {4,8}
class Foo extends Base {
  static config = {
    name: 'Foo',
    refs: ['one'],
  };

  mounted() {
    console.log(this.$refs); // Before: { one: HTMLElement }
  }
}
```

To fix this issue, make sure to define all the refs used by a component:

```diff
  class Foo extends Base {
    static config = {
      name: 'Foo',
-     refs: ['one'],
+     refs: ['one', 'two'],
    };
```

## Update `$on` callbacks

The `$on` instance method can be used to listen to events emitted by a component. The v2 uses the `EventTarget` API with `addEventListener` and `removeEventListener` to manage these events.

Custom data attached to an emitted event can now be found in the `event.detail` propery:

```diff
- this.$on('event', (one, two) => {
+ this.$on('event', (event) => {
+   const [one, two] = event.detail;
    console.log({ one, two })
  });

  this.$emit('event', 1, 2);
```

:::tip Tip
When using the [Events Hooks API](/api/methods-hooks-events.html), the value of `event.detail` is used as parameters for each method. The changes are only for the [`$on(event, callback)` instance method](/api/instance-methods.html#on-event-callback-options).
:::

## Replace `$once`

The `$once` instance method has been removed since the `EventTarget` API implements this functionnality by passing a `once` option to the `addEventListener` method.

```diff
- this.$once('event', () => {
+ this.$on('event', () => {
    // do something once.
- })
+ }, { once: true })
```

## Use `$children` instead of `$refs` to access child component instances

Before the v2, `$refs` properties could be instances or array of instances of children components when setting the `data-ref="refName"` attribute on a child component root element. This is no longer the case as [`$refs` properties](/api/instance-properties.html#refs) are now either a single DOM element or an array of DOM elements.

**HTML**

```html
<div data-component="Parent">
  <div data-ref="child" data-component="Child"></div>
</div>
```

**v1**

```js {4,11-12}
class Parent extends Base {
  static config = {
    name: 'Parent',
    refs: ['child'],
    components: {
      Child,
    },
  };

  mounted() {
    console.log(this.$refs); // { child: Child }
    console.log(this.$refs.child instanceof Child); // true
  }
}
```

**v2**

```js {4,11-12}
class Parent extends Base {
  static config = {
    name: 'Parent',
    refs: ['child'],
    components: {
      Child,
    },
  };

  mounted() {
    console.log(this.$refs); // { child: HTMLDivElement }
    console.log(this.$refs.child instanceof Child); // false
  }
}
```

## Bind `this` to some methods

The v1 had a feature that automatically bound a class method to its instance to make sure that `this` was always the class instance. This feature came with a negative performance impact when working with large number of instances.

This should only have an impact on callback function use in the `$on(event, callback)` method if a method was directly used as the callback:

```js
this.$on('custom-event', this.handleCustomEvent);
```

To fix this, you can bind the method to `this` before using it:

```diff
+ this.handleCustomEvent = this.handleCustomEvent.bind(this);
  this.$on('custom-event', this.handleCustomEvent);
```

Or, better, you can use the [`EventListener.handleEvent()` method](https://developer.mozilla.org/en-US/docs/Web/API/EventListener/handleEvent) and directly use `this` as the callback:

```js {7-8,12-13,16-20,22}
class Component extends Base {
  static config = {
    name: 'Component',
  };

  mounted() {
    // The method `handleEvent` of `this` will be called
    this.$on('custom-event', this);
  }

  destroyed() {
    // Always make sure to unbind what has been binded
    this.$off('custom-event', this);
  }

  handleEvent(event) {
    if (event.type === 'custom-event') {
      this.handleCustomEvent(event);
    }
  }

  handleCustomEvent(event) {}
}
```

:::tip Going further
Make sure to read "[DOM handleEvent: a cross-platform standard since year 2000](https://webreflection.medium.com/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38)" to learn more on how to best leverage the [`EventListener.handleEvent()` API](https://developer.mozilla.org/en-US/docs/Web/API/EventListener/handleEvent).
:::

## Replace legacy config from getter to static

Using a getter for the `config` was marked a legacy in the v1 and is not supported anymore in the v2.

```diff
  class Component extends Base {
-   get config() {
-     return {
-       name: 'Component',
-     };
-   }
+   static config = {
+     name: 'Component',
+   };
  }
```

## Replace legacy `data-options` attribute

Defining custom values for an instance options with a single `data-options="{}"` attribute has been marked as legacy in the v1 and is no longer supported in the v2. Custom values for options should be defined with `data-option-<option-name>​="value"` attributes.

```diff
  <div
    data-component="Component"
-   data-options="{ one: 1, two: 2 }">
+   data-option-one="1"
+   data-option-two="2">
```

## Replace `get:...` event handlers

The internal `get:options`, `get:refs`, `get:children` and `get:services` events have been removed, they can be replaced with getters in child classes:

**Before**
```js
class Foo extends Base {
  mounted() {
    this.$on('get:refs', (refs) => {
      refs.body = document.body;
    });
  }
```

**After**
```js
class Foo extends Base {
  get $refs() {
    const $refs = super.$refs;
    $refs.body = document.body;
    return $refs;
  }
}
```

## Define emitted events

Events emitted from a component must be defined in the static `config` property.

```diff
  class Component extends Base {
    static config = {
      name: 'Component'
+     emits: ['open', 'close'],
    }

    open() {
      this.$emit('open');
    }

    close() {
      this.$emit('close');
    }
  }
```
