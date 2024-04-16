# SmartQueue

Manage tasks in a smart queue. Tasks will be automatically batch-called inside a single event loop lasting no more than 50ms (duration of what is considered a long task).

## Usage

```js
import { SmartQueue } from '@studiometa/js-toolkit/utils';

const queue = new SmartQueue();
queue.add(() => console.log('1'));
queue.add(() => console.log('2'));
```

### Parameters

This class does not accept any parameter.
