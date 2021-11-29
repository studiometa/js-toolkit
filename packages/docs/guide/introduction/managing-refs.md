# Managing refs

## What are refs?

A ref is a *reference* to a DOM element. It allow us to quickly access HTML elements. We can define single or multiple refs that we can easily use in our component without manually querying DOM elements.

> No more `querySelector` and `querySelectorAll`!

## Defining refs

The [`refs` property](/api/configuration.html#config-refs) of the static `config` object should be used to define what refs will be used in the component otherwise it can't be accessed. This property requires an array of string that correspond to the refs names in the HTML code.

We have 2 type of refs:
- Single ref (example: `btn`)
- Multiple refs (example: `items[]`)

If you want to get an array of refs you can append `[]` to the ref name.

```js {4}
class Component extends Base {
  static config = {
    name: 'Component',
    refs: ['btn', 'items[]'] // Declare the refs we will use
    // `btn` is a single ref.
    // `items[]` contains multiple refs and is always an array.
  };
}
```

### Single refs

First we need to declare the refs we want to use in our component, here we want to use a `btn`.

```js {6,10}
import { Base } from '@studiometa/js-toolkit';

class Component extends Base {
  static config = {
    name: 'Component',
    refs: ['btn'] // Declare the ref
  };
}
```

### Multiple refs

If we want to iterate on a ref we can append `[]` after the ref name. For example here `data-ref="items[]"` will yield an array of HTML elements.

> Appending `[]` to a ref name will force the ref to an array even if there is only one occurence.

```js {4,8}
class Component extends Base {
  static config = {
    name: 'Component',
    refs: ['items[]'],
  };

  mounted() {
    this.$refs.items; // [<li data-ref="items[]">#1</li>, ...]
  }
}
```

## Using refs

Now that we defined the refs we want to use we can add them to our HTML code:


```html {2,5-7}
<div data-component="Component">
  <button data-ref="btn">Click me</button>

  <ul>
    <li data-ref="items[]">#1</li>
    <li data-ref="items[]">#2</li>
    <li data-ref="items[]">#3</li>
  </ul>
</div>
```

They can be accessed directly in your instance with `this.$refs.<name>`

```js {8-9}
class Component extends Base {
  static config = {
    name: 'Component',
    refs: ['btn', 'items[]'],
  };

  mounted() {
    this.$refs.btn; // <button data-ref="btn">Click me</button>
    this.$refs.items; // [<li data-ref="items[]">#1</li>, ...]
  }
}
```

::: tip Attaching events to a ref
Visit the [Working with events](/guide/introduction/working-with-events.html) section of the guide to learn how to handle events while using refs.
:::
