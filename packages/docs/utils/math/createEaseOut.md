# createEaseOut

Generate a reversed easing function from a given easing function.

## Usage

```js twoslash
import { easeInCirc, createEaseOut } from '@studiometa/js-toolkit/utils';

const easeOutCirc = createEaseOut(easeInCirc);
```

### Parameters

- `easeIn` (`(progress: number) => number`): an easing function to reverse

### Return value

- `(progress: number) => number`: the reversed easing function
