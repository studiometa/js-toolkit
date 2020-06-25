---
sidebar: auto
prev: /
next: /components/
---

# Utils

## `debounce`

Execute a function until it stops being called.

**Parameters**

- `fn` (`Function`): the function to execute
- `delay` (`Number`): the delay in milliseconds

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/debounce.js)

**Usage**

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

## `hasMethod`

Test if a given object has a given method.

**Parameters**

- `obj` (`Object`): the object to test
- `name` (`String`): the method to test

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/hasMethod.js)

**Usage**

```js
import { hasMethod } from '@studiometa/js-toolkit/utils';

const foo = { bar: () => 'bar' };
console.log(hasMethod(foo, 'bar')); // true
console.log(hasMethod(foo, 'baz')); // false
```

## `isObject`

Test if the given value is an object.

**Parameters**

- `value` (`*`): the value to test

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/isObject.js)

**Usage**

```js
import { isObject } from '@studiometa/js-toolkit/utils';

console.log(isObject({ foo: 'bar' })); // true
console.log(isObject('hello')); // false
```


## `keyCodes`

Map of keyboard keycodes and their human readable name.

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/keyCodes.js)

**Usage**

```js
import { keyCodes } from '@studiometa/js-toolkit/utils';

document.addEventListener('keydown', (e) => {
  if (e.keyCode === keyCodes.ESC) {
    // do something when the user presses the escape key...
  }
});
```

## `nextFrame`

Execute a given function in the next window frame.

**Parameters**

- `fn` (`Function`): the function to execute

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/nextFrame.js)

**Usage**

```js
import { nextFrame } from '@studiometa/js-toolkit/utils';

nextFrame(() => {
  console.log('I will be executed in the next frame!');
});
```

## `focusTrap`

Trap the tab navigation inside a given element.

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/focusTrap.js)

**Usage**

```js
import { focusTrap } from '@studiometa/js-toolkit/utils';

const { trap, untrap } = focusTrap();

// Limit the tab navigation to focusable children of the document's body
document.addEventListener('keyup', (event) => {
  trap(document.body, event);
});

// Resume the trap and refocus the previously focused element
untrap();
```

::: tip
To understand the "tab trap" usage, read [Using JavaScript to trap focus in an element](https://hiddedevries.nl/en/blog/2017-01-29-using-javascript-to-trap-focus-in-an-element).
:::


## `throttle`

Limit the execution of a function one time for the given delay in milliseconds.

**Parameters**

- `fn` (`Function`): the function to execute
- `delay` (`Number`): the delay in milliseconds

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/throttle.js)

**Usage**

```js
import { throttle } from '@studiometa/js-toolkit/utils';

const throttledFn = throttle(() => {
  console.log('Hello 👋');
}, 500);

throttledFn(); // Hello 👋
```

