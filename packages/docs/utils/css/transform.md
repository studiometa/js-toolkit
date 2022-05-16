# transform

Use this function to apply transforms to an element.

## Usage

```js
import { transform } from '@studiometa/js-toolkit/utils';

transform(
  document.body,
  {
    x: 100,
    scale: 0.5,
  },
);
```

### Parameters

- `element` (`HTMLElement`): the target HTML element
- `props` ([`TransformProps`](#types)): an object describing the transformations to apply

### Return value

A `string` representing the transform property value.

### Types

```ts
interface TransformProps {
  x?: number;
  y?: number;
  z?: number;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  scaleZ?: number;
  skew?: number;
  skewX?: number;
  skewY?: number;
}
```
