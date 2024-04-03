# nextFrame

Execute a given function in the next window frame. This function is a promisified version of the [`requestAnimationFrame` function](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).

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
