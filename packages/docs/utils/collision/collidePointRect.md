# collidePointRect

Test if a point collides with a rectangle.

## Usage

```js twoslash
import { collidePointRect } from '@studiometa/js-toolkit/utils';

const point = {
  x: 0,
  y: 0,
};

const rect = {
  x: 0,
  y: 0,
  width: 20,
  height: 20,
};

collidePointRect(point, rect); // true
```

### Parameters

- `point` (`{ x: number, y: number }`): the point's position
- `rect` (`{ x: number, y: number, width: number, height: number }`): the rectangle's dimensions and position

### Return value

- `boolean`: wether the point and rectangle are colliding or not
