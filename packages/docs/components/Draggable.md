---
sidebar: auto
sidebarDepth: 5
prev: /components/Cursor.md
next: /components/Modal.md
---

# Draggable

Easily create a draggable component.

## Examples

### Simple

<ToolkitPreview>
  <div class="w-full h-96 flex items-center justify-center">
    <div data-component="Draggable" data-option-move class="z-goku relative w-32 h-32 rounded-full bg-black cursor-grab"></div>
  </div>
</ToolkitPreview>

```html
<div
  data-component="Draggable"
  data-option-move
  class="z-goku relative w-32 h-32 rounded-full bg-black">
</div>
```

## Usage

### JavaScript

You can directly instantiate the `Draggable` class on an element:

```js
import Draggable from '@studiometa/js-toolkit/components/Draggable';

const draggable = new Draggable(document.querySelector('.my-draggable-element'));
draggable.$mount();

// Or with the `$factory` method:
const draggables = Draggable.$factory('.my-draggable-element');
draggables.forEach(cursor => cursor.$mount());
```

Or you can use the component as a child of another one:

```js
import Base from '@studiometa/js-toolkit';
import Draggable from '@studiometa/js-toolkit/components/Draggable';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Draggable,
    },
  };
}

new App(document.documentElement).$mount();
```

### HTML

The following HTML is required for the `Cursor` component:

```html
<div data-component="Draggable"></div>
```

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
