## `throttle`

Limit the execution of a function one time for the given delay in milliseconds.

**Parameters**

- `fn` (`Function`): the function to execute
- `delay` (`Number`): the delay in milliseconds

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/throttle.js)

**Usage**

```js
import throttle from '@studiometa/js-toolkit/utils/throttle';

const throttledFn = throttle(() => {
  console.log('Hello 👋');
}, 500);

throttledFn(); // Hello 👋
```
