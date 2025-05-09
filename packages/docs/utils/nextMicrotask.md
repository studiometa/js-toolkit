# nextMicrotask

Execute a given function in the next microtask.

## Usage

```js twoslash
import { nextMicrotask } from '@studiometa/js-toolkit/utils';

// Callback APIs
nextMicrotask(() => {
  console.log('I will be executed in the next microtask!');
});

// Promise API
await nextMicrotask();
console.log('I will be executed in the next microtask!');
```

### Parameters

- `fn` (`() => T`): the function to execute

### Return value

This function returns a `Promise<T>` resolving on the next microtask.
