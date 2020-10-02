---
sidebar: auto
sidebarDepth: 5
prev: /components/Tabs.md
next: /utils/
---

# Key service

The key service will help you manage your keyboard events. It merges the `keydown` and `keyup` events.

## Usage

```js
import useKey from '@studiometa/js-toolkit/services/key';

const { add, remove, props } = useKey();

add('custom-id', (props) => {
  console.log(props.direction); // 'down' on keydown, 'up' on keyup
  console.log(props.isUp); // true on keyup, false on keydown
  console.log(props.isDown); // true on keydown, false on keyup
  console.log(props.triggered); // 1
  console.log(props.ENTER); // will be `true` when the pressed key is enter
});

// Get the latest prop object
console.log(props());

// Remove the callback
remove('custom-id');
```

## Props

### `event`

- Type: [`KeyboardEvent`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)

The original event instance.

### `direction`

- Type: `String`
- Values: `up` or `down`

The direction of the keystroke, `up` for the event is of type `keyup`, `down` when the event is of type `keydown`.

### `isUp`

- Type: `Boolean`

A boolean for the event's direction. Will be `true` on `keyup` events.

### `isDown`

- Type: `Boolean`

A boolean for the event's direction. Will be `true` on `keydown` events.

### `triggered`

- Type: `Number`

The number of time, especially for `keydown` events, the events have been fired.

### `ENTER`

- Type: `Boolean`

Will be `true` if the key initiating the event is the enter key.

::: tip
The `ENTER` prop and the following ones are mapped from the [`keyCodes`](/utils/#keycodes) utility.
:::

### `SPACE`

- Type: `Boolean`

Will be `true` if the key initiating the event is the space key.

### `TAB`

- Type: `Boolean`

Will be `true` if the key initiating the event is the tab key.

### `ESC`

- Type: `Boolean`

Will be `true` if the key initiating the event is the escape key.

### `LEFT`

- Type: `Boolean`

Will be `true` if the key initiating the event is the left key.

### `UP`

- Type: `Boolean`

Will be `true` if the key initiating the event is the up key.

### `RIGHT`

- Type: `Boolean`

Will be `true` if the key initiating the event is the right key.

### `DOWN`

- Type: `Boolean`

Will be `true` if the key initiating the event is the down key.

