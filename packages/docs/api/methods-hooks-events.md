# Event hooks

## `on<Event>`

Methods following this pattern will be executed when the event is triggered on the instance's `$el` element.

**Arguments**

- `event|...args` ([`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) or `any[]`): The event object when triggered from a native DOM event, the event arguments when triggered by a component.

**Example**

```js {10-11,15}
import { Base } from '@studiometa/js-toolkit';

class Foo extends Base {
  static config = {
    name: 'Foo',
    emits: ['custom-event'],
  };

  // Will be triggered when clicking on `this.$el`
  onClick(event) {
    this.$emit('custom-event', 'arg1', 'arg2');
  }

  // Will be triggered when emitting the `custom-event` event
  onCustomEvent(arg1, arg2, event) {}
}
```

## `on<RefOrChildName><Event>`

Methods following this pattern will be executed when the corresponding event is triggered on the corresponding ref or child element.

**Arguments**

- `[...args]` (`any[]`)
- `event` ([`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) or [`CustomEvent`](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)): The event object.
- `index` (`number`): The index of the ref triggering the event when multiple refs exists.

:::tip
Native DOM events registered on a child component will be binded to the child root element if it supports the event. See the second example below with the `<form>` element.
:::

**Examples**

```html{2-3,13-16}
<div data-component="Foo">
  <button data-ref="btn[]">Open</btn>
  <button data-ref="btn[]">Close</btn>
</div>

<script>
  class Foo extends Base {
    static config = {
      name: 'Foo',
      refs: ['btn[]']
    };

    // Will be triggered when clicking on one of `this.$refs.btn`
    // `event` is the click event's object
    // `index` is the index of the ref that triggered the event
    onBtnClick(event, index) {}
  }

  new Foo(document.querySelector('[data-component="Foo"]'));
</script>
```

```html{2,20-21,23-24}
<div data-component="Foo">
  <form data-component="Baz"></form>
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
    onBazMounted(event) {}

    // Will be triggered when the `<form>` element is submitted
    onBazSubmit(event) {}
  }

  new Foo(document.querySelector('[data-component="Foo"]'));
</script>
```

## `onDocument<Event>`

Methods following this pattern will be triggered when the `event` event is dispatched on the `document`.

**Arguments**
- `event` (`Event`): The event object

**Examples**

Implement a click-outside behaviour:

```js {14-16}
import { Base } from '@studiometa/js-toolkit';

class Dropdown extends Base {
  static config = {
    name: 'Dropdown',
    refs: ['btn'],
  };

  onBtnClick(event) {
    event.stopPropagation();
    this.open();
  }

  onDocumentClick() {
    this.close();
  }
}
```

## `onWindow<Event>`

Methods following this pattern will be triggered when the `event` event is dispatched on the `window`.

**Arguments**
- `event` (`Event`): The event object

**Examples**

Watch the page hash:

```js {8-10}
import { Base } from '@studiometa/js-toolkit';

class Component extends Base {
  static config = {
    name: 'Component',
  };

  onWindowHashchange(event) {
    // do something with the new hash...
  }
}
```
