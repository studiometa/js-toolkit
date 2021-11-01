# RAF service

The RAF (short for `requestAnimationFrame`) service will help you manage your render loops.

## Usage

```js
import { useRaf } from '@studiometa/js-toolkit';

const { add, remove, props } = useRaf();

add('custom-id', (props) => {
  console.log(props.time); // latest `performance.now()`
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
