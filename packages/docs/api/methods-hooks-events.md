# Event hooks

## `on<Event>`

Methods following this pattern will be executed when the event is triggered on the instance's `$el` element.

**Arguments**

- `event|...args` ([`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) or `any[]`): The event object when triggered from a native DOM event, the event arguments when triggered by a component.

**Example**

```js {8-9,11-12}
import { Base } from '@studiometa/js-toolkit';

class Foo extends Base {
  static config = {
    name: 'Foo',
  };

  // Will be triggered when clicking on `this.$el`
  onClick(event) {}

  // Will be triggered when emitting the `customEvent` or `custom-event` event
  onCustomEvent(arg1, arg2) {}
}
```

## `on<RefOrChildName><Event>`

Methods following this pattern will be executed when the corresponding event is triggered on the corresponding ref or child element.

**Arguments**

- `event|...args` ([`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) or `any[]`): The event object when triggered from a native DOM event, the event arguments when triggered by a component.
- `index` (`Number`): The index of the ref triggering the event when multiple refs exists.

:::warning
Native DOM events will only be binded to ref elements and component's events to child components.
:::

**Examples**

```html{2-3,14-17}
<div data-component="Foo">
  <button data-ref="btn">Open</btn>
  <button data-ref="btn">Close</btn>
</div>

<script>
  class Foo extends Base {
    static config = {
      name: 'Foo',
    };

    // Will be triggered when clicking on one of `this.$refs.btn`
    // `event` is the click event's object
    // `index` is the index of the ref that triggered the event
    onBtnClick(event, index) {}
  }

  new Foo(document.querySelector('[data-component="Foo"]'));
</script>
```

```html{2,18-20,24-25}
<div data-component="Foo">
  <div data-component="Baz"></div>
</div>

<script>
  class Baz extends Base {
    static config = {
      name: 'Baz',
    };
  }

  class Foo extends Base {
    static config = {
      name: 'Foo',
      components: {
        Baz,
      },
    };

    // Will be triggered when the component emits the `mounted` event
    onBazMounted() {}
  }

  new Foo(document.querySelector('[data-component="Foo"]'));
</script>
```
