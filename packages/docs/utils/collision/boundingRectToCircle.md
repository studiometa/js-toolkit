# boundingRectToCircle

Convert an object describing a rectangle to an object describing a circle.

::: tip
To enable it for non-square elements, use the second parameter to force the calculation.
:::

## Usage

```js
import { boundingRectToCircle } from '@studiometa/js-toolkit/utils';

const clientRect1 = { x: 0, y: 0, width: 100, height: 100 };
boundingRectToCircle(clientRect1); // { x: 50, y: 50, radius: 50 }

const clientRect2 = element.getBoundingClientRect();
boundingRectToCircle(clientRect2);
```

### Parameters

- `rect` (`{ x: number, y: number, width: number, height: number }`): the dimension of the rectangle to transform
- `force` (`boolean`) : force the function to work with non-square input, defaults to `false`

### Return value

- `{ x: number, y: number, radius: number }`: an object describing a circle
