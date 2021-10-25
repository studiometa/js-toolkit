# Interface methods

## `mounted()` <Badge vertical="middle" text="Lifecycle hooks" />

## `loaded()` <Badge vertical="middle" text="Lifecycle hooks" />

## `destroyed()` <Badge vertical="middle" text="Lifecycle hooks" />

## `terminated()` <Badge vertical="middle" text="Lifecycle hooks" />

## `scrolled(props)` <Badge vertical="middle" text="Service hooks" />

## `resized(props)` <Badge vertical="middle" text="Service hooks" />

## `keyed(props)` <Badge vertical="middle" text="Service hooks" />

## `moved(props)` <Badge vertical="middle" text="Service hooks" />

## `ticked(props)` <Badge vertical="middle" text="Service hooks" />

## `on＜Event＞(event)` <Badge vertical="middle" text="Event handlers" />

Methods following this pattern will be executed when the event is triggered on the instance's `$el` element.

**Arguments**

- `event` ([`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event)): the event object

**Example**

```js{8-9}
class Foo extends Base {
  get config() {
    return {
      name: 'Foo',
    };
  }

  // Will be triggered when clicking on `this.$el`
  onClick(event) {}

  // The same behaviour can be implemented by doing the following:
  mounted() {
    this.$el.addEventListener('click', this.onClick);
  }

  destroyed() {
    this.$el.removeEventListener('click', this.onClick);
  }
}
```

## `on＜RefOrChildName＞＜Event＞(event, index)` <Badge vertical="middle" text="Event handlers" />

Methods following this pattern will be executed when the corresponding event is triggered on the corresponding ref or child element.

**Arguments**

- `event|...args` ([`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) or `mixed`): the event object when triggered from a native DOM event, the event arguments when triggered by a component
- `index` (`Number`): the index of the ref triggering the event when multiple refs exists

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
    get config() {
      return {
        name: 'Foo',
      };
    }

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
    get config() {
      return {
        name: 'Baz',
      };
    }
  }

  class Foo extends Base {
    get config() {
      return {
        name: 'Foo',
        components: {
          Baz,
        },
      };
    }

    // Will be triggered when the component emits the `mounted` event
    onBazMounted() {}
  }

  new Foo(document.querySelector('[data-component="Foo"]'));
</script>
```
