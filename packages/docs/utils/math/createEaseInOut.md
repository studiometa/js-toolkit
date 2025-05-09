# createEaseInOut

Generate an in-out easing function given an ease-in function.

## Usage

```js twoslash
import { easeInCirc, createEaseInOut } from '@studiometa/js-toolkit/utils';

const easeIntOutCirc = createEaseInOut(easeInCirc);
```

### Parameters

- `easeIn` (`(progress: number) => number`): an easing function to reverse

### Return value

- `(progress: number) => number`: the reversed easing function
