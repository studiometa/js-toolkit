

# Utils


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
