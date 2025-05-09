---
outline: deep
---

# withDrag

Use this decorator to add the `dragged(props)` hook from the [drag](/api/services/useDrag.html) service.

## Usage

```js twoslash
import { Base, withDrag } from '@studiometa/js-toolkit';

export default class Draggable extends withDrag(Base, {
  target: (instance) => instance.$el,
  dampFactor: 0.5,
}) {
  static config = {
    name: 'Draggable',
  };

  /**
   * @param {import('@studiometa/js-toolkit').DragServiceProps} props
   */
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

```js twoslash
import { Base, withDrag } from '@studiometa/js-toolkit';

export default class Draggable extends withDrag(Base) {
  static config = {
    name: 'Draggable',
  };

  /**
   * @param {import('@studiometa/js-toolkit').DragServiceProps} props
   */
  dragged(props) {
    this.$el.style.transform = `translate(${props.x}px, ${props.y}px)`;
  }
}
```

:::tip
We recommend using the [`domScheduler` utility](/utils/domScheduler.md) to update the root element position, see the [`Draggable`](https://github.com/studiometa/ui/blob/master/packages/ui/Draggable/Draggable.ts) component source for more details.
:::

### Move a ref element

```js {4,8,14-16} twoslash
import { Base, withDrag } from '@studiometa/js-toolkit';

export default class Draggable extends withDrag(Base, {
  target: (instance) => instance.$refs.draggbale,
}) {
  static config = {
    name: 'Draggable',
    refs: ['draggable'],
  };

  /**
   * @param {import('@studiometa/js-toolkit').DragServiceProps} props
   */
  dragged(props) {
    this.$refs.draggable.style.transform = `translate(${props.x}px, ${props.y}px)`;
  }
}
```

::: tip
You can use the [`transform(element, transforms)` function](/utils/css/transform.md) to apply transform to an element.
:::
