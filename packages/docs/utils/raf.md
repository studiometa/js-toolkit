# raf

Alias for the `requestAnimationFrame` function, with a fallback to `setTimeout` when the function is not available. A [`cancelRaf` function](./cancelRaf.md) is also available as an alias for the `cancelAnimationFrame` function.

## Usage

```js
import { raf, cancelRaf } from '@studiometa/js-toolkit/utils';

const id = raf(() => {
  console.log('I will be executed in the next frame!');
});

cancelRaf(id);
```

### Parameters

- `callback` (`FrameRequestCallback`): the function to execute

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/nextFrame.js)

### Return value

This function returns the request ID as a `number.
