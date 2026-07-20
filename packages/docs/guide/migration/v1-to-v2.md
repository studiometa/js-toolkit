# Migrating from v1 to v2

Apply the following steps to your project to ensure a smooth upgrade from v1 to v2.

[[toc]]

## Update imports

Replace deep imports with the two entry points `@studiometa/js-toolkit` and `@studiometa/js-toolkit/utils`. (v2 simplified the exports.) Nested imports still work but may be removed in a later version, so avoid them.

Rewrite all deep nested imports to named exports from one of these two entry points. Import the `Base` class, the decorators, the services and the helpers from the root entry:

```js
import Base from '@studiometa/js-toolkit'; // [!code --]
import { withMountWhenInView } from '@studiometa/js-toolkit/decorators'; // [!code --]
import { useScroll } from '@studiometa/js-toolkit/services'; // [!code --]
import { importWhenVisible } from '@studiometa/js-toolkit/helpers'; // [!code --]
import {
  // [!code ++]
  Base, // [!code ++]
  withMountWhenInView, // [!code ++]
  useScroll, // [!code ++]
  importWhenVisible, // [!code ++]
} from '@studiometa/js-toolkit'; // [!code ++]
```

Import all utilities from the `@studiometa/js-toolkit/utils` entry:

```js
import debounce from '@studiometa/js-toolkit/utils/debounce'; // [!code --]
import throttle from '@studiometa/js-toolkit/utils/throttle'; // [!code --]
import { debounce, throttle } from '@studiometa/js-toolkit/utils'; // [!code ++]
```

**math utilities**

```js
import damp from '@studiometa/js-toolkit/utils/math/damp'; // [!code --]
import clamp01 from '@studiometa/js-toolkit/utils/math/clamp01'; // [!code --]
import { damp, clamp01 } from '@studiometa/js-toolkit/utils'; // [!code ++]
```

**css utilities**

```js
import matrix from '@studiometa/js-toolkit/utils/css/matrix'; // [!code --]
import transition from '@studiometa/js-toolkit/utils/css/transition'; // [!code --]
import { matrix, transition } from '@studiometa/js-toolkit/utils'; // [!code ++]
```

:::warning Deleted exports
The `styles` and `classes` exports of the `/utils/css/` namespace have been deleted as they are internal utils.
:::

**object utilities**

:::warning Deleted exports
The `autoBind`, `getAllProperties` and `isObject` exports of the `/utils/object` namespace have been deleted as they are internal utils.
:::

**history API utilities**

```js
import {
  push,
  replace,
  objectToURLSearchParams,
} from '@studiometa/js-toolkit/utils/history'; // [!code --]
import {
  // [!code ++]
  historyPush, // [!code ++]
  historyReplace, // [!code ++]
  objectToURLSearchParams, // [!code ++]
} from '@studiometa/js-toolkit/utils'; // [!code ++]
```

## Define all refs

In the v1, all elements with a `data-ref="refName"` inside the scope of a `data-component` were registered as refs with the `config.refs` definition used to display warnings when a ref was found but not defined.

The v2 is stricter: it looks up only refs defined in [the `config.refs` property](/api/configuration.html#config-refs) and does not warn about extra refs in the component scope.

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

Define every ref used by the component:

```js
class Foo extends Base {
  static config = {
    name: 'Foo',
    refs: ['one'], // [!code --]
    refs: ['one', 'two'], // [!code ++]
  };
```

## Update `$on` callbacks

The `$on` instance method listens to events emitted by a component. The v2 uses the `EventTarget` API with `addEventListener` and `removeEventListener` to manage these events.

Read custom data attached to an emitted event from the `event.detail` property:

```js
this.$on('event', (one, two) => { // [!code --]
this.$on('event', (event) => { // [!code ++]
  const [one, two] = event.detail; // [!code ++]
  console.log({ one, two })
});

this.$emit('event', 1, 2);
```

:::tip Tip
When using the [Events Hooks API](/api/methods-hooks-events.html), the value of `event.detail` is used as parameters for each method. The changes are only for the [`$on(event, callback)` instance method](/api/instance-methods.html#on-event-callback-options).
:::

## Replace `$once`

Replace `$once` with the `once` option of `addEventListener`. (The `$once` instance method has been removed because the `EventTarget` API covers it.)

```js
this.$once(
  'event',
  () => {
    // [!code --]
    this.$on('event', () => {
      // [!code ++]
      // do something once.
    }); // [!code --]
  },
  { once: true },
); // [!code ++]
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

Bind the method to `this` before using it:

```js
this.handleCustomEvent = this.handleCustomEvent.bind(this); // [!code ++]
this.$on('custom-event', this.handleCustomEvent);
```

Or use the [`EventListener.handleEvent()` method](https://developer.mozilla.org/en-US/docs/Web/API/EventListener/handleEvent) and pass `this` as the callback:

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

Replace the `config` getter with a static property. (The v1 marked the getter as legacy; the v2 no longer supports it.)

```js
class Component extends Base {
  get config() {
    // [!code --]
    return {
      // [!code --]
      name: 'Component', // [!code --]
    }; // [!code --]
  } // [!code --]
  static config = {
    // [!code ++]
    name: 'Component', // [!code ++]
  }; // [!code ++]
}
```

## Replace legacy `data-options` attribute

Define custom option values with `data-option-<option-name>​="value"` attributes. (The single `data-options="{}"` attribute was legacy in the v1 and is no longer supported in the v2.)

```html
<div data-component="Component" data-options="{ one: 1, two: 2 }">
  <!-- [!code --] -->
  data-option-one="1"
  <!-- [!code ++] -->
  data-option-two="2">
  <!-- [!code ++] -->
</div>
```

## Replace `get:...` event handlers

Replace the internal `get:options`, `get:refs`, `get:children` and `get:services` events with getters in child classes. (These events have been removed.)

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

Define every event emitted from a component in the static `config` property.

```js
class Component extends Base {
  static config = {
    name: 'Component', // [!code ++]
    emits: ['open', 'close'], // [!code ++]
  };

  open() {
    this.$emit('open');
  }

  close() {
    this.$emit('close');
  }
}
```
