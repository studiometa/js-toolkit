# collideCircleRect

Test if a circle collides with a rectangle.

## Usage

```js
import { collideCircleRect } from '@studiometa/js-toolkit/utils';

const circle = {
  x: 40,
  y: 40,
  radius: 40,
};

const rect = {
  x: 40,
  y: 40,
  width: 60,
  height: 60,
};

collideCircleRect(circle, rect); // true
```

### Parameters

- `circle` (`{ x: number, y: number, radius: number }`): the circle dimensions and position
- `rect` (`{ x: number, y: number, width: number, height: number }`): the rectangle dimensions and position

### Return value

- `boolean`: wether the circle and rectangle are colliding
