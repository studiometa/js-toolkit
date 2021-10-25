

# Scroll service

The scroll service will help you manage your actions when the page is scrolled.

## Usage

```js
import { useScroll } from '@studiometa/js-toolkit';

const { add, remove, props } = useScroll();

add('custom-id', (props) => {
  console.log(props.x); // the horizontal position of the scroll
  console.log(props.y); // the vertical position of the scroll
  console.log(props.changed.x); // will be `true` when the `x` scroll has changed
});

// Get the latest prop object
console.log(props());

// Remove the callback
remove('custom-id');
```

::: warning IMPORTANT
A throttle of 32ms is configured to limit the execution of each scroll callback to a minimum. If you need 60fps animation, use the [`raf`](./useRaf.html) service along this one.
:::

## Props

### `x`

- Type: `Number`

The current horizontal scroll position.

### `y`

- Type: `Number`

The current vertical scroll position.

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

The scroll position on both axis mapped to a `0` to `1` range, based on the [max](#max) property.

### `max`

- Type: `Object`
- Interface: `{ x: number, y: number }`

The maximum value the scroll can reach.

### `direction`

- Type: `Object`
- Interface `{ x: 'LEFT'|'RIGHT'|'NONE', y: 'UP'|'DOWN'|'NONE' }`

The direction of the scroll.
