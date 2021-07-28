---
sidebar: auto
sidebarDepth: 5
prev: /components/Cursor.md
next: /components/Modal.md
---

# DraggableElement

Easily create a draggable element.

## Examples

### Simple

<ToolkitPreview>
  <div class="w-full h-96 flex items-center justify-center">
    <div data-component="DraggableElement" class="z-goku relative w-32 h-32 rounded-full bg-black cursor-grab"></div>
  </div>
</ToolkitPreview>

```html
<div
  data-component="DraggableElement"
  class="z-goku relative w-32 h-32 rounded-full bg-black">
</div>
```

## Usage

### JavaScript

You can directly instantiate the `Draggable` class on an element:

```js
import DraggableElement from '@studiometa/js-toolkit/components/Draggable';

const draggableElement = new DraggableElement(document.querySelector('.my-draggable-element'));
draggableElement.$mount();

// Or with the `$factory` method:
const draggableElements = DraggableElement.$factory('.my-draggable-element');
draggableElements.forEach(draggableElement => draggableElement.$mount());
```

Or you can use the component as a child of another one:

```js
import Base from '@studiometa/js-toolkit';
import DraggableElement from '@studiometa/js-toolkit/components/Draggable';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      DraggableElement,
    },
  };
}

new App(document.documentElement).$mount();
```

### HTML

The following HTML is required for the `DraggableElement` component:

```html
<div data-component="DraggableElement"></div>
```

## API

### Options

::: tip
Options can be defined per component via the `data-option-<option-name>` attribute or by extending the `DraggableElement` class.
:::

#### `factor`

- Type: `number`
- Default: `0.85`

The factor used to decrease the velocity.

### Events

#### `dragstart`

Emitted when the drag start.

**Parameters**
- `instance`: the `Draggable` instance

#### `drag`

Emitted during the drag.

**Parameters**
- `instance`: the `Draggable` instance

#### `dragend`

Emitted when the drag is release.

**Parameters**
- `instance`: the `Draggable` instance

#### `draginertia`

Emitted when the drag has inertia applied.

**Parameters**
- `instance`: the `Draggable` instance
