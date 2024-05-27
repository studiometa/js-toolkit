---
outline: deep
---

# Scroll service

The scroll service will help you manage your actions when the page is scrolled.

## Usage

```js
import { useScroll } from '@studiometa/js-toolkit';

const { add, remove, props } = useScroll();

add('custom-id', (props) => {
  console.log(props.x); // the horizontal position of the scroll
  console.log(props.y); // the vertical position of the scroll
  console.log(props.changedX); // will be `true` when the `x` scroll has changed
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

### `changedX`

- Type: `boolean`

Shorthand for `changed.x`.

### `changedY`

- Type: `boolean`

Shorthand for `changed.y`.

### `last`

- Type: `Object`
- Interface: `{ x: number, y: number }`

The last position on both the `x` and `y` axis.

### `lastX`

- Type: `number`

Shorthand for `last.x`.

### `lastY`

- Type: `number`

Shorthand for `last.y`.

### `delta`

- Type: `Object`
- Interface: `{ x: number, y: number }`

The difference between the last position and the current one.

### `deltaX`

- Type: `number`

Shorthand for `delta.x`.

### `deltaY`

- Type: `number`

Shorthand for `delta.y`.

### `progress`

- Type: `Object`
- Interface: `{ x: number, y: number }`

The scroll position on both axis mapped to a `0` to `1` range, based on the [max](#max) property.

### `progressX`

- Type: `number`

Shorthand for `progress.x`.

### `progressY`

- Type: `number`

Shorthand for `progress.y`.

### `max`

- Type: `Object`
- Interface: `{ x: number, y: number }`

The maximum value the scroll can reach.

### `maxX`

- Type: `number`

Shorthand for `max.x`.

### `maxY`

- Type: `number`

Shorthand for `max.y`.

### `direction`

- Type: `Object`
- Interface `{ x: 'LEFT'|'RIGHT'|'NONE', y: 'UP'|'DOWN'|'NONE' }`

The direction of the scroll.

### `isUp`

- Type: `boolean`

Shorthand for `direction.y === 'UP'`.

### `isRight`

- Type: `boolean`

Shorthand for `direction.x === 'LEFT'`.

### `isDown`

- Type: `boolean`

Shorthand for `direction.y === 'DOWN'`.

### `isLeft`

- Type: `boolean`

Shorthand for `direction.x === 'LEFT'`.
