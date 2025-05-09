---
outline: deep
---

# Drag service

The drag service will help you manage draggable elements.

## Usage

```js twoslash
import { useDrag } from '@studiometa/js-toolkit';

const target = document.querySelector('.draggable');
const { add, remove, props } = useDrag(target, { dampFactor: 0.5, dragTreshold: 10 });

add('custom-id', (props) => {
  console.log(props.mode); // 'start', 'drag', 'drop', 'inertia' or 'stop'
  console.log(props.MODES); // an object of all available modes
  console.log(props.isGrabbing); // true if the target element is grabbed
  console.log(props.x); // horizontal position of the cursor in the viewport
  console.log(props.y); // vertical position of the cursor in the viewport
});

// Get the latest prop object
console.log(props());

// Remove the callback
remove('custom-id');
```

## Parameters

### `target`

- Type : `HTMLElement`

The target element of the drag.

### `options`

- Type : `{ dampFactor?: number, dragTreshold?: number }`

Options for the drag behavior. The `dampFactor` option is used for the inertia, it defaults to `0.5`. The `dragTreshold` property is the distance from which we prevent clicks on child elements, it defaults to `10` (pixels).

## Props

### `mode`

- Type: `'start'|'drag'|'drop'|'inertia'|'stop'`

The current mode of the dragging logic.

### `MODES`

- Type: `{ START: 'start', DRAG: 'drag', DROP: 'drop', INERTIA: 'inertia', STOP: 'stop' }`

An object representing the different mode of the draggin logic. Use it to match against the current mode:

```js twoslash {2}
import { useDrag } from '@studiometa/js-toolkit';
// ---cut---
useDrag(target).add('key', (props) => {
  if (props.mode === props.MODES.START) {
    console.log('drag is starting');
  }
});
```

### `target`

- Type: `HTMLElement`

The target element of the drag.

### `isGrabbing`

- Type: `boolean`

Whether the user is currently grabbing the targeted element or not.

### `hasInertia`

- Type: `boolean`

Whether the drag currently has inertia or not.

### `x`

- Type: `number`

The current horizontal position in the viewport.

### `y`

- Type: `number`

The current vertical position in the viewport.

### `delta`

- Type: `{ x: number, y: number }`

The delta between the current position and the previous position.

### `origin`

- Type: `{ x: number, y: number }`

The initial position where the dragging started.

### `distance`

- Type: `{ x: number, y: number }`

The distance from the current position to the origin.

### `final`

- Type: `{ x: number, y: number }`

The final position that will be reached at the end of the inertia.
