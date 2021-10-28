

# Pointer service

The pointer service will help you manage your cursor. It merges the mouse and touch `move`, `up` and `down` events.

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
If the cursor is in the **middle of the viewport**, the value of this prop will be:

```js
{ x: 0.5, y: 0.5 }
```

If the cursor is in the **top left corner of the viewport**, the value of this prop will be:

```js
{ x: 0, y: 0 }
```
:::

### `max`

- Type: `Object`
- Interface: `{ x: number, y: number }`

The maximum value the pointer can reach. It will always be `window.innerWidth` and `window.innerHeight`.
