# Managing refs

## What are refs?

A ref is a *reference* to a DOM element. It allows to quickly access HTML elements. Define single or multiple refs to easily use them in a component without manually querying DOM elements.

> No more `querySelector` and `querySelectorAll`!

## Defining refs

The [`refs` property](/api/configuration.html#config-refs) of the static `config` object should be used to define what refs will be available in the component. This property requires an array of string that correspond to the refs names in the HTML code.

There is 2 type of refs:
- Single ref (example: `btn`)
- Multiple refs (example: `items[]`)

```js {4-7}
class Component extends Base {
  static config = {
    name: 'Component',
    refs: [
      'btn', // single ref
      'items[]', // multiple ref with the `[]` suffix
    ],
  };
}
```

### Single refs

To declare a single ref you must add it to the refs array like so:

```js {6,10}
import { Base } from '@studiometa/js-toolkit';

class Component extends Base {
  static config = {
    name: 'Component',
    refs: ['btn'] // Declare the ref
  };
}
```

Then in the HTML template you must add a `data-ref` attribute with the same name as above.

```html {2,5-7}
<div data-component="Component">
  <button data-ref="btn">Click me</button>
</div>
```

### Multiple refs

If you want to iterate on multiple refs, you can append `[]` to the ref name. For example here `data-ref="items[]"` will yield an array of HTML elements.

> Appending `[]` to a ref name will force the ref to an array even if there is only one occurence.

```js {4}
class Component extends Base {
  static config = {
    name: 'Component',
    refs: ['items[]'],
  };
}
```

Then in the HTML template:

```html {3-5}
<div data-component="Component">
  <ul>
    <li data-ref="items[]">#1</li>
    <li data-ref="items[]">#2</li>
    <li data-ref="items[]">#3</li>
  </ul>
</div>
```

### Naming convention

Multiple refs should be pluralized and in `camelCase`.

For example: `listItems[]`

## Using refs

Once refs are declared and added in the HTML template it becomes accessible via the instance property `this.$refs.<name>`.


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
