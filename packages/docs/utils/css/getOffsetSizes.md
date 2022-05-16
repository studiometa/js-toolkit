# getOffsetSizes

This function will return a `DOMRect` like object representing the position of the given element without its CSS transforms.

## Usage

```js
import { getOffsetSizes } from '@studiometa/js-toolkit/utils';

const sizes = getOffsetSizes(document.body);
```

### Parameters

- `element` (`HTMLElement`): the scale on the x axis

### Return value

An object with the same properties as a `DOMRect`:

```ts
{
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  right number;
  bottom: number;
  left: number;
}
```
