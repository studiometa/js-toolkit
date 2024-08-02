# Working with events

The `Base` class helps you manage event handler with automatic binding of all class methods prefixed with `on`. These methods can listen to events on different targets:

- the component itself with `on<CustomEventName>`
- the root element of the component with `on<NativeEventName>`
- the global `window` object with `onWindow<NativeEventName>`
- the global `document` object with `onDocument<NativeEventName>`
- any refs defined with `on<RefName><NativeEventName>`
- any child component with `on<ChildName><CustomEventName>`

The following methods can be used:

```js
import { Base } from '@studiometa/js-toolkit';
import Child from './Child.js';

class App extends Base {
  static config = {
    name: 'App',
    emits: ['custom-event'],
    refs: ['btn'],
    components: {
      Child,
    }
  };

  // Will be triggered when `this.$el` is clicked
  onClick({ event, index, target, args }) {}

  // Will be triggered when the `custom-event` is emitted on the instance
  onCustomEvent({ event, index, target, args }) {}

  // Will be triggered when the `window` is clicked
  onWindowClick({ event, index, target, args }) {}

  // Will be triggered when the `document` is clicked
  onDocumentClick({ event, index, target, args }) {}

  // Will be triggered when the `btn` ref is clicked
  onBtnClick({ event, index, target, args }) {}

  // Will be triggered when any `Child` component is clicked
  onChildClick({ event, index, target, args }) {}
}
```

All methods will be given the same unique `context` parameter when called. This parameter is an object of type:

```ts
type EventHooksCallbackParams = {
  /**
   * The event emitted
   */
  event: Event;
  /**
   * If the event is emitted on a component, given arguments
   * can be accessed with the `args` property.
   */
  args: Array<any>;
  /**
   * If the event is emitted on multiple refs or children, the `index`
   * property will be the index of the current target.
   */
  index: number;
  /**
   * The target that emitted the event.
   */
  target: Element | Base | Promise<Base> | typeof window | typeof document;
};
```
