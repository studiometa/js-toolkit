# Pointer service

The pointer service will help you manage your cursor. It merges the mouse and touch `move`, `up` and `down` events. If the `usePointer` function is given an `HTMLElement`, the positionnal props (`x`, `y`, etc.) will be relative to this element sizes. By default, positions are based on the viewport's sizes.

## Usage

```js
import { usePointer } from '@studiometa/js-toolkit';

const { add, remove, props } = usePointer();

add('custom-id', (props) => {
  console.log(props.isDown); // `true` if the pointer is down
  console.log(props.x); // the pointer X position
  console.log(props.y); // the pointer Y position
  console.log(props.event); // the latest MouseEvent object
});

// Get the latest prop object
console.log(props());

// Remove the callback
remove('custom-id');
```

## Parameters

### `target`

- Type : `HTMLElement | undefined`

The target element to use to compute the positionnal props.

## Props

### `event`

- Type: `MouseEvent`

### `isDown`

- Type: `Boolean`

### `x`

- Type: `Number`

### `y`

- Type: `Number`

### `changed`

- Type: `Object`
- Interface: `{ x: boolean, y: boolean }`

For both axis, whether or not the current position has changed since the last one.

### `last`

- Type: `Object`
- Interface: `{ x: number, y: number }`

The last position on both the `x` and `y` axis.

### `delta`

- Type: `Object`
- Interface: `{ x: number, y: number }`

The difference between the last position and the current one.

### `progress`

- Type: `Object`
- Interface: `{ x: number, y: number }`

The position on both axis mapped to a `0` to `1` range.

::: tip Examples
If the cursor is in the **middle of the viewport or the target element**, the value of this prop will be:

```js
{ x: 0.5, y: 0.5 }
```

If the cursor is in the **top left corner of the viewport or the target element**, the value of this prop will be:

```js
{ x: 0, y: 0 }
```

:::

### `max`

- Type: `Object`
- Interface: `{ x: number, y: number }`

The maximum value the pointer can reach. The values of `window.innerWidth` and `window.innerHeight` by default, the widht and height of the element when the service is used with a target element.
