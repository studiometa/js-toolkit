# withRelativePointer

Use this decorator to add a `movedrelative(props)` hook from the [pointer](/api/services/usePointer.html) service with props relative to the components root element `$el`.

## Usage

```js
import { Base, withRelativePointer } from '@studiometa/js-toolkit';

export default class RelativePointer extends withRelativePointer(Base, {
  target: (instance) => instance.$el,
}) {
  static config = {
    name: 'RelativePointer',
    refs: ['item']
  };

  movedrelative(props) {
    this.$refs.item.style.transform = `translate(${props.x}px, ${props.y}px)`;
  }
}
```

### Parameters

- `BaseClass` (`Base`): The class to add draggable capabilities to
- `options?` (`{ target?: (instance:Base) => HTMLElement }`): Options to choose the target element

### Return value

- `Base`: A child of the given class with draggable capabilities

## API

### Class methods

#### `movedrelative`

The `movedrelative` class method will be triggered when moving the pointer.

**Arguments**

- `props` (`PointerServiceProps`): the [pointer service props](/api/services/usePointer.md#props), relative to the `target`

## Examples

### Move a ref element

This decorator can be used to easily use the pointer position relative from the component's root element. The following example will scale a ref based on the position of the pointer *inside* the component's root element.

```js
import { Base, withRelativePointer } from '@studiometa/js-toolkit';

export default class RelativePointer extends withRelativePointer(Base) {
  static config = {
    name: 'RelativePointer',
    refs: ['item'],
  };

  movedrelative(props) {
    this.$refs.item.style.transform = `scale(${props.progress.x}, ${props.progress.y})`;
  }
}
```
