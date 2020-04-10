---
sidebar: auto
prev: /
next: /components/
---

# Utils

## `debounce`

Execute a function until it stops to be called.

```js
import { debounce } from '@studiometa/js-toolkit/utils';

const debouncedFn = debounce(() => {
  console.log('Hello 👋');
}, 500);

debouncedFn(); // Hello 👋
```

## `isObject`

Test if the given value is an object.

```js
import { isObject } from '@studiometa/js-toolkit/utils';

console.log(isObject({ foo: 'bar' })); // true
console.log(isObject('hello')); // false
```

## `throttle`

Limit the execution of a function one time for the given delay in milliseconds.

```js
import { throttle } from '@studiometa/js-toolkit/utils';

const throttledFn = throttle(() => {
  console.log('Hello 👋');
}, 500);

throttledFn(); // Hello 👋
```

