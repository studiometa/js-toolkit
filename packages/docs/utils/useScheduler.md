# useScheduler

Use this function to generate a scheduler in order to group the execution of some tasks in the specified steps.

This can be useful to avoid layout trashing when working with the DOM, find out more by reading this [web.dev article](https://web.dev/avoid-large-complex-layouts-and-layout-thrashing).

## Usage

```js
import { useScheduler, domScheduler } from '@studiometa/js-toolkit/utils';

const { before, after } = useScheduler(['before', 'after']);

after(() => console.log('after'));
before(() => console.log('before'));
before(() => console.log('before'));
after(() => console.log('after'));

// Will output:
// before
// before
// after
// after

// Use the predefined `domScheduler` export to work with read/write to the DOM
const { read, write } = domScheduler;
read(() => {
  const size = document.body.offsetWidth;

  write(() => {
    document.body.style.transform = `translateX(${size * 0.1}px)`;
  });
});
```

### Parameters

- `steps` (`string[]`): the list of steps the generated scheduler should have

### Return value

This function returns a scheduler object with methods to add functions to execute on each given step.

```ts
function useScheduler<T extends string>(steps:T[]):Record<T, (() => void) => void>
```
