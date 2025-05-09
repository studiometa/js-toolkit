# inertiaFinalValue

Calculate the final value for an inertia effect given inital value and velocity.

## Usage

```js twoslash
import { inertiaFinalValue } from '@studiometa/js-toolkit/utils';

inertiaFinalValue(0, 10);
inertiaFinalValue(0, 10, 0.5);
```

### Parameters

- `initialValue` (`number`): The initial value.
- `initialDelta` (`number`): The velocity.
- `dampFactor?` (`number`): The speed to reach the target value, defaults to `0.85`.

### Return value

- `number`: the final value of the inertia logic
