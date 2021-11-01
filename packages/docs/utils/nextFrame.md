# nextFrame

Execute a given function in the next window frame.

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

- `fn` (`Function`): the function to execute

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/nextFrame.js)

### Return value

This function returns a `Promise` resolving on the next frame.
