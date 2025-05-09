# throttle

Limit the execution of a function one time for the given delay in milliseconds.

## Usage

```js twoslash
import { throttle } from '@studiometa/js-toolkit/utils';

const throttledFn = throttle(() => {
  console.log('Hello 👋');
}, 500);

throttledFn(); // Hello 👋
```

### Parameters

- `fn` (`Function`): the function to execute
- `delay` (`Number`): the delay in milliseconds

### Return value

A new function which will execute the given function at the given limited rate.
