# nextTick

Execute a given function in the next window tick.

## Usage

```js twoslash
import { nextTick } from '@studiometa/js-toolkit/utils';

// Callback API
nextTick(() => {
  console.log('I will be executed in the next tick!');
});

// Promise API
await nextTick();
console.log('I will be executed in the next tick!');
```

### Parameters

- `fn` (`Function`): the function to execute

### Return value

This function returns a `Promise` resolving on the next tick.
