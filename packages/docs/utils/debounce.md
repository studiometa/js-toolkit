# `debounce`

Execute a function until it stops being called.

**Parameters**

- `fn` (`Function`): the function to execute
- `delay` (`Number`): the delay in milliseconds

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/debounce.js)

**Usage**

```js
import debounce from '@studiometa/js-toolkit/utils/debounce';

const debouncedFn = debounce(() => {
  console.log('Hello 👋');
}, 500);

debouncedFn(); // Hello 👋
```

::: tip
You can read [Debounce vs throttle](https://redd.one/blog/debounce-vs-throttle) if the difference between the `debounce` and `throttle` methods is not clear for you.
:::
