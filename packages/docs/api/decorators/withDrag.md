# withDrag

Use this decorator to add the `dragged(props)` hook from the [drag](/api/services/useDrag.html) service.

## Usage

```js
import { Base, withDrag } from '@studiometa/js-toolkit';

export default class Draggable extends withDrag(Base, {
  target: (instance) => instance.$el,
  dampFactor: 0.5,
}) {
  static config = {
    name: 'Draggable',
  };

  dragged(props) {
    this.$el.style.transform = `translate(${props.x}px, ${props.y}px)`;
  }
}
```

### Parameters

- `BaseClass` (`Base`): The class to add draggable capabilities to
- `options?` (`{ target?: (instance:Base) => HTMLElement, dampFactor?: number }`): Options to choose the draggable target element and the drag dampFactor.

### Return value

- `Base`: A child of the given class with draggable capabilities

## API

### Class methods

#### `dragged`

The `dragged` class method will be triggered when dragging the target element.

**Arguments**

- `props` (`DragServiceProps`): the [drag service props](/api/services/useDrag.md#props)

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
    this.$el.style.transform = `translate(${props.x}px, ${props.y}px)`;
  }
}
```

:::tip
We recommend using [stylefire](https://popmotion.io/stylefire/) to update the root element position, see the [`Draggable`](https://github.com/studiometa/ui/blob/master/packages/ui/Draggable.js) component source for more details.
:::

### Move a ref element

```js{5,9,12-14}
import { Base, withDrag } from '@studiometa/js-toolkit';

export default class Draggable extends withDrag(
  Base,
  { target: (instance) => instance.$refs.draggbale }
) {
  static config = {
    name: 'Draggable',
    refs: ['draggable'],
  };

  dragged(props) {
    this.$refs.draggable.style.transform = `translate(${props.x}px, ${props.y}px)`;
  }
}
```
