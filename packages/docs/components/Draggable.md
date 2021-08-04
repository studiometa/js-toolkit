---
sidebar: auto
sidebarDepth: 5
prev: /components/Cursor.md
next: /components/Modal.md
---

# Draggable

Easily create a draggable element.

## Example

<ToolkitPreview>
  <div class="w-full h-96 flex items-center justify-center">
    <div data-component="Draggable" class="z-goku relative w-32 h-32 rounded-full bg-black cursor-grab active:cursor-grabbing"></div>
  </div>
</ToolkitPreview>

```html
<div
  data-component="Draggable"
  class="z-goku relative w-32 h-32 rounded-full bg-black cursor-grab active:cursor-grabbing">
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
draggables.forEach(draggable => draggable.$mount());
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

The following HTML is required for the `Draggable` component:

```html
<div data-component="Draggable"></div>
```
