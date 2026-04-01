# Event hooks

::: tip See also
For an introduction to event handling in components, see the [Events guide](/guide/introduction/working-with-events.html).
:::

Event hooks are methods of a class prefixed by `on` which will be executed when the given event will be dispatched on the given target. All methods receives a single parameter `ctx` whose type is:

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

## `on<Event>`

Methods following this pattern will be executed when the event is triggered on the instance's `$el` element.

**Arguments**

- `ctx` (`EventHooksCallbackParams`): the context of the event

**Example**

```js {10-11,16} twoslash
// @twoslash-cache: {"v":1,"hash":"69fc360cefb8f8fd884043c854bfbda2570aa1ff8125be86012dbac6eec1e759","data":"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="}
import { Base } from '@studiometa/js-toolkit';

class Foo extends Base {
  static config = {
    name: 'Foo',
    emits: ['custom-event'],
  };

  // Will be triggered when clicking on `this.$el`
  onClick({ event }) {
    event.preventDefault();
    this.$emit('custom-event', 'foo', 'bar');
  }

  // Will be triggered when emitting the `custom-event` event
  onCustomEvent({ event, args: [arg1, arg2] }) {
    console.log(arg1); // 'foo'
    console.log(arg2); // 'bar'
  }
}
```

## `on<RefOrChildName><Event>`

Methods following this pattern will be executed when the corresponding event is triggered on the corresponding ref or child element.

**Arguments**

- `ctx` (`EventHooksCallbackParams`): the context of the event

:::tip
Native DOM events registered on a child component will be binded to the child root element if it supports the event. See the second example below with the `<form>` element.
:::

**Examples**

```html {2-3,13-16}
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
    // `target` is the DOM element
    onBtnClick({ event, index, target }) {}
  }

  new Foo(document.querySelector('[data-component="Foo"]'));
</script>
```

```html {2,20-21,23-24}
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
    onBazMounted({ event }) {}

    // Will be triggered when the `<form>` element is submitted
    onBazSubmit({ event }) {}
  }

  new Foo(document.querySelector('[data-component="Foo"]'));
</script>
```

## `onDocument<Event>`

Methods following this pattern will be triggered when the `event` event is dispatched on the `document`.

**Arguments**

- `ctx` (`EventHooksCallbackParams`): the context of the event

**Examples**

Implement a click-outside behaviour:

```js {14-16} twoslash
// @twoslash-cache: {"v":1,"hash":"e030e32c50cff0609b0d95fa60018db77cdcfb0d7b055e01375435b4758572e4","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAIppYLgDuYE49fYgArNNREZjCaIAAcM168wYHmeWnenyG7DAqwATJttqRdvskAA2E5nHB4QgkcgzW4eFgcLh8e5+BxSWTyEZKemGbS8PReNkmcxWGx2elOFxuRYSHzCQIQsJICJRJFxKgJJJwVIZbK5fKFYqlCpVGp1BpNFptTrdWbQgDsAEYhkDxlMIXMFh4lojkUg0SAtjs9tdECiAMz46jnIlXUnUckgRhYF5kTB8WGvCAffz8CBgABm7BCiF4wHMvCLvDAzBqedKpCRIQA3IXi6QYJmVbxK9XkO062AjkLXO4QABhDPZkKS6ihcKRaIKgiJZJpTI5PIFIolcqVaq1Zj1GCNZqtdNZnNlTFoKpgfwJSysDpdEDfaGgi220b2xA4x1Qu7DnPLJGrAN0R9bFDmDTBCQ8YlrjJegmFjLR4wwPhS3LVs0CrUYvnNJArTWT1hlfEEAVmL8PBQ3A3VWAFvUxX0DkmMDQ0g8Mblgil4JwOwkN4RtmwrdD23aLDemhK0UQBAjgQdccnWhEBeIQSikF+IDaJAhjThDCDLhJVi5MYfVCCgRMXnhfwM1ENAwAHDh+BiRhgDkEgwHsI48wLMBiyckY0DzZgwAwLsjm4PMiAgdgoGEn4rUmZ9AUInCNhk0iQAsqybPYOy/3dMFVKxP0UUY7SoIjGg2OjLAdn1Mg+F3Hy/ICqLRJxJLJLfFTkudEA6pc7LVnBL0MXyg4rV+IqLhKvS4Kq2oau8lyGowJqcItDq2pBDqSK6nqGCUw48roqZxrDXSYLk/ylrNEScNBG14qkxBRs/LrSi0NlQmYM8Mz6gYDpA3DjuY07I3Ki7lv9NZBnut9iMhLqEIROUctwv6/WOTTwImlizqYQzoBMuEUwvDNHlcMoahcjK7MYELeDCiLwZRcSXwep7OrkkmyYptAqZnFYcMAwbgIKwGdOgkHzsaq6fhRX5BfW5TnrkwQIEcPaYtRg5jjvdNYDwPlbHsRyvF4I5eEzTRLF4AByAABHUN31Zg1SXTUimtrtzFpEQk3hOR6GZZQxQ8osejPfgBB/EIOXzesi3IvNrd9onrYoOOeKbFtkGtgAjKzra6esjk9zzeDS6zbPsxydtNvgQ+LHa1zel4Pq+sAaa7LzxnYAIEY7ovzHrTn+HJnzeZp2PS6LbuAhV1R+9Lo5zB7KgnaQUAmTAOBzzwTIQCOI4gA==="}
import { Base } from '@studiometa/js-toolkit';

class Dropdown extends Base {
  static config = {
    name: 'Dropdown',
    refs: ['btn'],
  };

  onBtnClick({ event }) {
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

- `ctx` (`EventHooksCallbackParams`): the context of the event

**Examples**

Watch the page hash:

```js {8-10} twoslash
// @twoslash-cache: {"v":1,"hash":"ef0fe91641e95122f3726a7d733034aa0a9f701c779ce700f652fb3dc1781c38","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiACs01EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+yQADYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAB2VEA0bjKaguYLDxLIaI1bWrY7PbXRDIyZ46jnQlXEnUMkgRhYTQ4OwYPhQ17vfz8GEAM3YIUQvGA5l4ed4YGYNSzpVIiJCAG5zEdBa53JC0xmJdRQuFItE4lQEkk4KkMtlcvlCsVShUqjU6g0mi0UimwOmQmUMWgqmB/AlLKxjZ9et8ABx7oaAu2IbEO8F3RshZZupAAZjRXqxhwDmAJHiJ11J9CYUa0ZEwPhC2LXhS3LJwzW+ABGNYHxtIF7RbR0IWA3BXSRRB/k9DFvQOf1TkDd9LmJG4f3JCdCCgeMXhhJMYQAdURFwAHcAAkuHwT1RhgRhgDkEg4V4I4sxzMB83494s2YMAMCrMAjm4LMiAgdgoAgr4kCgu8Nngk8oMPJCLw8BimIgNiOK4+Ybwwi1Hxw59kVfIMPxDUiIUjHYJzIPh9Uk3hpIwdTd00n4oKPW1gR+c8nRAXy4Ws1ZbJAbDMR9ZE7yOE0U1gPBeVsew+K8ITeFTTRLF4AByAABUctQnZh+xVIcigquTzBpEQE1owTGUUZRRVEvMehXfgBCvdls1zfNUKzCquthNAKooKajjasTeBMxQzPYuBOO2bjeIkwSFMm9a8zSXgXFA7VxnLXhmKKfBeHGbw3mY3htl2/xvpW6snHqpBQF6uBVzwTIQCOI4gA=="}
import { Base } from '@studiometa/js-toolkit';

class Component extends Base {
  static config = {
    name: 'Component',
  };

  onWindowHashchange({ event }) {
    // do something with the new hash...
  }
}
```
