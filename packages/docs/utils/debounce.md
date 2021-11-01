# debounce

Execute a function until it stops being called.

::: tip
You can read [Debounce vs throttle](https://redd.one/blog/debounce-vs-throttle) if the difference between the `debounce` and `throttle` methods is not clear for you.
:::

## Usage

```js
import { debounce } from '@studiometa/js-toolkit/utils';

const debouncedFn = debounce(() => {
  console.log('Hello 👋');
}, 500);

debouncedFn(); // Hello 👋
```

### Parameters

- `fn` (`Function`): the function to execute
- `delay` (`Number`): the delay in milliseconds

### Return value

A new function which will execute the given function only when it is not called in the given delay.
