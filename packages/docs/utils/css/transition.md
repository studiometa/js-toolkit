# transition

This method implements the same logic as the [`<transition>` component](https://vuejs.org/v2/api/#transition) from Vue to apply CSS based transition to a DOM element.

## Usage

```js
import { transition } from '@studiometa/js-toolkit/utils';

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
transition(
  document.body,
  {
    from: 'opacity-0',
    active: 'transition duration-500',
    to: 'opacity-50',
  },
  'keep'
);
```

### Parameters

- `element` (`HTMLElement`): the target DOM element
- `name` (`String|Object`): the name of the transition or an object of classes or styles to apply
- `endMode = 'remove'` (`String`): whether or not the transition keeps its final state or not, can be `remove` or `keep`, defaults to `remove`.

### Return value

- `Promise`: a `Promise` resolving when the transition has ended
