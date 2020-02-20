---
sidebar: auto
---

# Utils

## `debounce`

```js
import utils from '@studiometa/js-toolkit';

const debouncedFn = utils.debounce(() => {
  console.log('Hello 👋');
}, 500);

debouncedFn(); // Hello 👋
```

## `isObject`

```js
import utils from '@studiometa/js-toolkit';

console.log(isObject({ foo: 'bar' })); // true
console.log(isObject('hello')); // false
```

## `throttle`

```js
import utils from '@studiometa/js-toolkit';

const throttledFn = utils.throttle(() => {
  console.log('Hello 👋');
}, 500);

throttledFn(); // Hello 👋
```

