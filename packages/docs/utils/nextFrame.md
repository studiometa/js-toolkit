# nextFrame

Execute a given function in the next window frame. This function is a promisified version of the [`raf` function](./raf.md).

## Usage

```js
import { nextFrame } from '@studiometa/js-toolkit/utils';

// Callback API
nextFrame(() => {
  console.log('I will be executed in the next frame!');
});

// Promise API
await nextFrame();
console.log('I will be executed in the next frame!');
```

### Parameters

- `callback` (`(time:DOMHighResTimeStamp) => unknown`): the function to execute

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/nextFrame.js)

### Return value

This function returns a `Promise` resolving on the next frame with the return value of the provided callback.
