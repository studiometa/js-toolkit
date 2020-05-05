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

::: tip
You can read [Debounce vs throttle](https://redd.one/blog/debounce-vs-throttle) if the difference between the `debounce` and `throttle` methods is not clear for you.
:::

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/debounce.js)

## `hasMethod`

Test if a given object has a given method.

```js
import { hasMethod } from '@studiometa/js-toolkit/utils';

const foo = { bar: () => 'bar' };
console.log(hasMethod(foo, 'bar')); // true
console.log(hasMethod(foo, 'baz')); // false
```

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/hasMethod.js)

## `isObject`

Test if the given value is an object.

```js
import { isObject } from '@studiometa/js-toolkit/utils';

console.log(isObject({ foo: 'bar' })); // true
console.log(isObject('hello')); // false
```

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/isObject.js)

## `keyCodes`

Map of keyboard keycodes and their human readable name.

```js
import { keyCodes } from '@studiometa/js-toolkit/utils';

document.addEventListener('keydown', (e) => {
  if (e.keyCode === keyCodes.ESC) {
    // do something when the user presses the escape key...
  }
});
```

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/keyCodes.js)

## `nextFrame`

Execute a given function in the next window frame.

```js
import { nextFrame } from '@studiometa/js-toolkit/utils';

nextFrame(() => {
  console.log('I will be executed in the next frame!');
});
```

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/nextFrame.js)

## `tabTrap`

Trap the tab navigation inside a given element.

```js
import { tabTrap } from '@studiometa/js-toolkit/utils';

const { trap, untrap } = tabTrap();

// Limit the tab navigation to focusable children of the document's body
document.addEventListener('keyup', (event) => {
  trap(document.body, event);
});

// Resume the trap and refocus the previously focused element
untrap();
```

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/tabTrap.js)

## `throttle`

Limit the execution of a function one time for the given delay in milliseconds.

```js
import { throttle } from '@studiometa/js-toolkit/utils';

const throttledFn = throttle(() => {
  console.log('Hello 👋');
}, 500);

throttledFn(); // Hello 👋
```

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/throttle.js)
