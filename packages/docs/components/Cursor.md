---
sidebar: auto
sidebarDepth: 5
prev: /components/Accordion.md
next: /components/Draggable.md
---

# Cursor

Easily create a custom cursor.

## Examples

### Simple

<ToolkitPreview>
  <div data-component="Cursor" class="z-50 fixed top-0 left-0 w-4 h-4 -m-2 rounded-full border border-black pointer-events-none" />
</ToolkitPreview>

```html
<div
  data-component="Cursor"
  class="z-50 fixed top-0 left-0 w-4 h-4 -m-2 rounded-full border border-black pointer-events-none">
</div>
```

## Usage

### JavaScript

You can directly instantiate the `Cursor` class on an element:

```js
import Cursor from '@studiometa/js-toolkit/components/Cursor';

const cursor = new Cursor(document.querySelector('.my-custom-cursor-element'));
cursor.$mount();

// Or with the `$factory` method:
const cursors = Cursor.$factory('.my-custom-cursor-element');
cursors.forEach(cursor => cursor.$mount());
```

Or you can use the component as a child of another one:

```js
import Base from '@studiometa/js-toolkit';
import Cursor from '@studiometa/js-toolkit/components/Cursor';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Cursor,
    },
  };
}

new App(document.documentElement).$mount();
```

### HTML

The following HTML is required for the `Cursor` component:

```html
<div
  data-component="Cursor"
  class="z-10 fixed top-0 left-0 w-4 h-4 -ml-2"></div>
```

The default styles should center the cursor around the top-left corner of the viewport.

## API

### Options

::: tip
Options can be defined per component via the `data-option-<option-name>` attribute or by extending the `Cursor` class.
:::

#### `growSelectors`

- Type: `String`
- Default: `'a, a *, button, button *, [data-cursor-grow], [data-cursor-grow] *'`

A CSS selector which will be used to trigger the scaling up of the cursor.

#### `shrinkSelectors`

- Type: `String`
- Default: `'[data-cursor-shrink], [data-cursor-shrink] *'`

A CSS selector which will be used to trigger the scaling down of the cursor.

#### `growTo`

- Type: `Numbr,`
- Default: `2`

The target scale when the cursor is over an element matching the `growSelector` option.

#### `shrinkTo`

- Type: `Number`
- Default: `0.5`

The target scale when the cursor is over and element matching the `shrinkSelector` option.

#### `translateDampFactor`

- Type: `Number`
- Default: `0.25`

The factor used to calculate the damped translation value, a value of `1` will disable damp smoothing. The closer to `0` the value is, greater will be the smoothing.

#### `growDampFactor`

- Type: `Number`
- Default: `0.25`

The factor used to calculate the damped scale up value, a value of `1` will disable damp smoothing. The closer to `0` the value is, greater will be the smoothing.

#### `shrinkDampFactor`

- Type: `Number`
- Default: `0.25`

The factor used to calculate the damped scale down value, a value of `1` will disable damp smoothing. The closer to `0` the value is, greater will be the smoothing.
