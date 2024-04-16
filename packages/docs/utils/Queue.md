# Queue

Create a class instance to dispatch functions in a queue.

## Usage

```js
import { Queue } from '@studiometa/js-toolkit/utils';

const queue = new Queue();
queue.add(() => console.log('1'));
queue.add(() => console.log('2'));
```

### Parameters

- `concurrency` (`Number`): the number of tasks to execute at the same time, defaults to `10`
- `waiter` (`(cb: (...args:unknown[]) => unknown) => unknown`): a scheduler function for the next batch execution, defaults to an immediately invoked function `(cb) => cb()`
