# withDrag

Use this decorator to add the `dragged(props)` hook from the [drag](/services/drag.md) service.

## Usage

<label><input type="checkbox">todo</label>

## API

### Class methods

#### `dragged`

The `dragged` class method will be triggered when dragging the target element.

**Arguments**

- `props` (`DragServiceProps`): the [drag service props](/services/drag.md#props)

## Examples

### Move the root element

This decorator can be used to easily add drag capabilities to the root element of a component.

```js
import { Base, withDrag } from '@studiometa/js-toolkit';

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
We recommend using [stylefire](https://popmotion.io/stylefire/) to update the root element position, see the [`Draggable`](https://github.com/studiometa/ui/blob/master/packages/ui/Draggable.js) component source for more details.
:::

### Move a ref element

```js{6-10}
import { Base, withDrag } from '@studiometa/js-toolkit';

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
