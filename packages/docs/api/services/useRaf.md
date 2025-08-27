---
outline: deep
---

# RAF service

The RAF (short for `requestAnimationFrame`) service will help you manage your render loops.

## Usage

```js twoslash
import { useRaf } from '@studiometa/js-toolkit';

const { add, remove, props } = useRaf();

add('custom-id', (props) => {
  console.log(props.time); // latest `performance.now()`
  console.log(props.delta); // time elapsed since the last frame

  // Read the DOM and compute values...

  return () => {
    // Update the DOM...
  };
});

// Get the latest prop object
console.log(props());

// Remove the callback
remove('custom-id');
```

## Props

### `time`

- Type: `Number`

The time elapsed since the [time origin](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp#The_time_origin).

::: tip
Read the [`performance.now()` documentation](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) to find out more on the time origin.
:::

### `delta`

- Type: `Number`

The time elapsed between the current frame and the previous frame in milliseconds. This value is `0` on the first frame and represents the frame duration for subsequent frames.

::: tip
The `delta` property is useful for creating frame-rate independent animations and calculations. You can use it to scale movement or animations based on the actual time elapsed between frames.
:::
