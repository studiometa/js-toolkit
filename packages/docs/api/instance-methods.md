# Instance methods

## `$log(...content)`

Can be used to log content to the console when the `instance.$options.log` options is set to true, either via the `config` getter or via the `data-options` attribute.

**Parameters**

- `...args` (`any[]`): The content to log

**Example**

```js {6,10} twoslash
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    this.$log('mounted');
  }
}
```

## `$warn(...content)`

Can be used to handle a warning to the console when the `instance.$options.log` options is set to true, either via the `config` getter or via the `data-options` attribute.

**Parameters**

- `...args` (`any[]`): The content to warn

**Example**

```js {6,10} twoslash
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    this.$warn('Warning!'); // [Component-1] Warning!
  }
}
```

## `$on(event, callback[, options])`

Bind a callback function to an event emitted by the instance. Returns a function to unbind the callback from the event.

**Parameters**

- `event` (`string`): The name of the event.
- `callback` (`EventListenerOrEventListenerObject`): A callback function or an object implementing the [`EventListener` interface](https://developer.mozilla.org/en-US/docs/Web/API/EventListener).
- `options` (`boolean|AddEventListenerOptions`): Options for the `addEventListener` method, defaults to `undefined`.

**Return value**

- `() => void`: A function to unbind the callback from the event.

**Example**

```js {10-15} twoslash
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    const removeEventListener = this.$on('updated', () => {
      this.$log('updated');
    });

    // Remove the event listener
    removeEventListener();
  }
}
```

:::tip Tip
Use the `options.once` parameter to run the callback only once.

```js
this.$on('updated', () => {}, { once: true });
```

:::

## `$off(event, callback[, options])`

Unbind a callback function from an event emitted by the instance. If no callback function is provided, all previously binded callbacks will be removed.

**Parameters**

- `event` (`string`): The name of the event.
- `callback` (`EventListenerOrEventListenerObject`): The callback function or the object implementing the [`EventListener` interface](https://developer.mozilla.org/en-US/docs/Web/API/EventListener) which was bound to the event.
- `options` (`boolean|AddEventListenerOptions`): Options for the `removeEventListener` method, defaults to `undefined`.

**Example**

```js {10-15} twoslash
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    const callback = () => this.$log('updated');

    this.$on('updated', callback);

    // Removes the binded callback
    this.$off('updated', callback);
  }
}
```

## `$emit(event[, ...args])`

Emit an event from the current instance, with optional custom arguments. The event will be dispatched on the instance root element, allowing other components or scripts to listen to it.

**Parameters**

- `event` (`string | Event`): The name of the event or an `Event` instance.
- `...args` (`any[]`): The data to send with the event.

**Example**

```js {10-11} twoslash
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    this.$on('custom-event', (a, b) => this.$log(a + b)); // 3
    this.$emit('custom-event', 1, 2);
  }
}
```

## `$mount()`

Mount the component and its children, will trigger the `mounted` lifecycle method.

**Return value**

- `Promise<this>`: returns the current instance when all children components are mounted

## `$update()`

Update the children list from the DOM, and mount the new ones. This method can be used when inserting new content loaded over Ajax.

**Return value**

- `Promise<this>`: returns the current instance when all children components are updated

## `$destroy()`

Destroy the component and its children, will trigger the `destroyed` lifecycle method.

**Return value**

- `Promise<this>`: returns the current instance when all children components are destroyed

## `$terminate()`

Terminate the component, its instance is made available to garbage collection.

**Return value**

- `Promise<void>`: returns a promise resolving when all children components are terminated

:::warning
A terminated component can not be re-mounted, use with precaution.
:::
