---
sidebar: auto
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
import debounce from '@studiometa/js-toolkit/utils/debounce';

const debouncedFn = debounce(() => {
  console.log('Hello 👋');
}, 500);

debouncedFn(); // Hello 👋
```

::: tip
You can read [Debounce vs throttle](https://redd.one/blog/debounce-vs-throttle) if the difference between the `debounce` and `throttle` methods is not clear for you.
:::

## `focusTrap`

Trap the tab navigation inside a given element.

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/focusTrap.js)

**Usage**

```js
import focusTrap from '@studiometa/js-toolkit/utils/focusTrap';

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

## `history`

Helpers to interact with the [History API](http://developer.mozilla.org/en-US/docs/Web/API/History_API). The two `push` and `replace` functions allow you to replace parts of the current URL with the History API by merging the given options with the current URL, avoiding the need for complex merging strategies.

**Parameters**

- `options.path` (`String`): the new path, defaults to `location.pathname`
- `options.search` (`Object`): the new search, defaults to the current URL params
- `options.hash` (`String`): the new hash, defaults to the current hash
- `data` (`Object`): The data attached to the new history state
- `title` (`String`): The title attached to the new history state

**Usage**

```js
import { push, replace } from '@studiometa/js-toolkit/utils/history';

// Push a new state
push({ path: '/foo', search: { query: 'hello world' }, hash: 'results' });
// Old URL: /
// New URL: /foo?query=hello world#results

// Replace the current state
replace({ path: '/foo', search: { query: 'hello world' }, hash: 'results' });
// Old URL: /
// New URL: /foo?query=hello world#results

// Replace only the hash
replace({ hash: 'hello-world' });
// Old URL: /
// New URL: /#hello-world

// For the search and hash options, falsy values can be used to delete things
replace({ hash: '' });
// Old URL: /#hello-world
// New URL: /
replace({ search: { query: false } });
// Old URL: /?query=foo&page=10#hello-world
// New URL: /?page=10#hello-world

// Complex values for the search are converted into URL params according to the way PHP parses theme into the `$_GET` variable.
replace({
  search: {
    array: [1, 2],
    object: {
      foo: 'foo',
      bar: { baz: 'bar' }
    }
  }
});
// Replaced value: ?array[0]=1&array[1]=2&object[foo]=foo&object[bar][baz]=bar
```

## `isObject`

Test if the given value is an object.

**Parameters**

- `value` (`any`): the value to test

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/object/isObject.js)

**Usage**

```js
import isObject from '@studiometa/js-toolkit/utils/object/isObject';

console.log(isObject({ foo: 'bar' })); // true
console.log(isObject('hello')); // false
```


## `keyCodes`

Map of keyboard keycodes and their human readable name.

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/keyCodes.js)

**Usage**

```js
import keyCodes from '@studiometa/js-toolkit/utils/keyCodes';

document.addEventListener('keydown', (e) => {
  if (e.keyCode === keyCodes.ESC) {
    // do something when the user presses the escape key...
  }
});
```

## `matrix`

This method will format a matrix CSS transform function.

**Parameters**

- `options.scaleX` (`Number`): the scale on the x axis
- `options.scaleY` (`Number`): the scale on the y axis
- `options.skewX` (`Number`): the skew on the x axis
- `options.skewY` (`Number`): the skew on the y axis
- `options.translateX` (`Number`): the translate on the x axis
- `options.translateY` (`Number`): the translate on the y axis

**Returns**

- `String`: a formatted CSS matrix transform

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/css/matrix.js)

**Usage**
```js
import matrix from '@studiometa/js-toolkit/utils/css/matrix';

document.body.style.transform = matrix({ scaleX: 0.5, scaleY: 0.5 });
// matrix(0.5, 0, 0, 0.5, 0, 0)
```

## `nextFrame`

Execute a given function in the next window frame.

**Parameters**

- `fn` (`Function`): the function to execute

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/nextFrame.js)

**Usage**

```js
import nextFrame from '@studiometa/js-toolkit/utils/nextFrame';

nextFrame(() => {
  console.log('I will be executed in the next frame!');
});
```

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

## `transition`

This method implements the same logic as the [`<transition>` component](https://vuejs.org/v2/api/#transition) from Vue to apply CSS based transition to a DOM element.

**Parameters**

- `element` (`HTMLElement`): the target DOM element
- `name` (`String|Object`): the name of the transition or an object of classes or styles to apply
- `endMode = 'remove'` (`String`): whether or not the transition keeps its final state or not, can be `remove` or `keep`, defaults to `remove`.

**Returns**

- `Promise`: a Promise

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/css/transition.js)

**Usage**
```js
import transition from '@studiometa/js-toolkit/utils/css/transition';

// Will apply and remove the following classes sequentially:
// - fade-from
// - fade-active
// - fade-to
transition(document.body, 'fade');

// Will apply and remove the following styles sequentially:
// - opacity: 0;
// - transition: opacity 1s ease-out
transition(document.body, {
  from: { opacity: 0 },
  active: { transition: 'opacity 1s ease-out' },
});

// Will apply and remove the following classes sequentially:
// - opacity-0
// - transition duration-500
// - opacity-50
transition(document.body, {
  from: 'opacity-0',
  active: 'transition duration-500',
  to: 'opacity-50',
});

// Will apply and remove the following classes sequentially:
// - opacity-0
// - transition duration-500
// And keep the latest class at the end:
// - opacity-50
transition(document.body, {
  from: 'opacity-0',
  active: 'transition duration-500',
  to: 'opacity-50',
}, 'keep');
```

## [Collide](./collide.md)
Collides utils is used to test if two DOM elements are overlapping.
[Go to the detailed documentation.](./collide.md)
