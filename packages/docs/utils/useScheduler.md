# useScheduler

Use this function to generate a scheduler in order to group the execution of some tasks in the specified steps.

This avoids layout thrashing when working with the DOM. Read this [web.dev article](https://web.dev/avoid-large-complex-layouts-and-layout-thrashing) for details.

## Usage

```js
import { useScheduler } from '@studiometa/js-toolkit/utils';

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
```

### Parameters

- `steps` (`string[]`): the list of steps the generated scheduler should have

### Return value

This function returns a scheduler object with methods to add functions to execute on each given step.

```ts
function useScheduler<T extends string>(steps:T[]):Record<T, (() => void) => void>
```
