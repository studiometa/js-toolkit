# cancelRaf

Alias for the `cancelAnimationFrame` function, with a fallback to `clearTimeout` when the function is not available. A [`raf` function](./raf.md) is also available as an alias for the `requestAnimationFrame` function.

## Usage

```js
import { raf, cancelRaf } from '@studiometa/js-toolkit/utils';

const id = raf(() => {
  console.log('I will be executed in the next frame!');
});

cancelRaf(id);
```

### Parameters

- `id` (`number`): the ID of the request to cancel

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/nextFrame.js)

### Return value

This function returns nothing (`void`).
