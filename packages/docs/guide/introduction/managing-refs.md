---
outline: deep
---

# Managing refs

## What are refs?

A ref is a _reference_ to a DOM element. It allows to quickly access HTML elements. Define single or multiple refs to easily use them in a component without manually querying DOM elements.

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
    refs: ['btn'], // Declare the ref
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

- Ref names should be in `camelCase`
- Ref names should help identify their usage: prefer `openBtn` over `btn`
- Multiple refs names should be pluralized: prefer `items[]` over `item[]`

## Using refs

Once refs are declared and added in the HTML template it becomes accessible via the corresponding instance property `this.$refs.<name>`.

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

  /**
   * Attaching a `click` event listener to the `btn` ref.
   */
  onBtnClick() {
    console.log('Button has been clicked!');
  }
}
```

::: tip Attaching events to a ref
Visit the [Working with events](/guide/introduction/working-with-events.html) section of the guide to learn how to handle events while using refs.
:::

### Nested refs

By default, refs are resolved within the component's scope determined by the `data-component` attribute. In the following example, the parent component will only have one element in its `this.$refs.items` property.

<!-- prettier-ignore-start -->
```html
<div data-component="Parent"> <─────────┐
  <div data-ref="items[]">direct</div> ─┘
  <div data-component="Child">
    <div data-ref="items[]">nested</div>
  </div>
</div>
```
<!-- prettier-ignore-end -->

```js
import { Base } from '@studiometa/js-toolkit';
import Child from './Child.js';

class Parent extends Base {
  static config = {
    name: 'Parent',
    components: { Child },
    refs: ['items[]'],
  };

  mounted() {
    console.log(this.$refs.items.length);
    console.log(this.$refs.items[0]);
  }
}
```

```js
// Logs
1
<div data-ref="items[]">direct</div>
```

If you need to access to nested refs, you can prefix the refs name with the component's name as defined in the static `config` property of the class.

<!-- prettier-ignore-start -->
```html {4}
<div data-component="Parent"> <─────────┐────────┐
  <div data-ref="items[]">direct</div> ─┘        │
  <div data-component="Child">                   │
    <div data-ref="Parent.items[]">nested</div> ─┘
  </div>
</div>
```
<!-- prettier-ignore-end -->

```js
import { Base } from '@studiometa/js-toolkit';
import Child from './Child.js';

class Parent extends Base {
  static config = {
    name: 'Parent',
    components: { Child },
    refs: ['items[]'],
  };

  mounted() {
    console.log(this.$refs.items.length);
    console.log(this.$refs.items[0]);
    console.log(this.$refs.items[1]);
  }
}
```

```js
// Logs
2
<div data-ref="items[]">direct</div>
<div data-ref="Parent.items[]">nested</div>
```

:::warning Nested refs and nested components
The resolution scope of nested refs will be limited in case of nested components.

<!-- prettier-ignore-start -->
```html
<div data-component="Parent"> <─────────┐
  <div data-ref="items[]">direct</div> ─┘
  <div data-component="Child">
    <div data-component="Parent"> <────────────────┐
      <div data-ref="Parent.items[]">nested</div> ─┘
    </div>
  </div>
</div>
```
<!-- prettier-ignore-end -->

:::
