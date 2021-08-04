---
sidebar: auto
sidebarDepth: 5
prev: /decorators/withBreakpointObserver.html
next: /decorators/withExtraConfig.html
---

# withDrag

Use this decorator to add the `dragged(props)` hook from the [drag](/services/drag.md) service.

## Examples

### Move the root element

This decorator can be used to easily add drag capabilities to the root element of a component.

```js
import Base from '@studiometa/js-toolkit';
import withDrag from '@studiometa/js-toolkit/decorators/withDrag';

export default class Draggable extends withDrag(Base) {
  static config = {
    name: 'Draggable',
  };

  dragged(props) {
    console.log(props.x);
    console.log(props.y);
  }
}
```
:::tip
We recommend using [stylefire](https://popmotion.io/stylefire/) to update the root element position, see the [`Draggable`](https://github.com/studiometa/js-toolkit/blob/master/packages/js-toolkit/components/Draggable.js) component source for more details.
:::

### Move a ref element

```js{6-10}
import Base from '@studiometa/js-toolkit';
import withDrag from '@studiometa/js-toolkit/decorators/withDrag';

export default class Draggable extends withDrag(
  Base,
  {
    target() {
      return this.$refs.draggbale;
    },
  }
) {
  static config = {
    name: 'Draggable',
    refs: ['draggable'],
  };

  dragged(props) {
    console.log(props.x);
    console.log(props.y);
  }
}
```

## API

### Class methods

#### `dragged`

The `dragged` class method will be triggered when dragging the target element.

**Arguments**

- `props` (`DragServiceProps`): the [drag service props](/services/drag.md#props)
