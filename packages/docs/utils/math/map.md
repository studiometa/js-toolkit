# map

Map a value from one interval to another.

## Usage

```js twoslash
import { map } from '@studiometa/js-toolkit/utils';

map(5, 0, 10, 0, 20); // 10
```

### Parameters

- `value` (`number`): The value to map.
- `inputMin` (`number`): The input's minimum value.
- `inputMax` (`number`): The input's maximum value.
- `outputMin` (`number`): The output's minimum value.
- `outputMax` (`number`): The output's maximum value.

### Return value

- `number`: The input value mapped to the output range.
