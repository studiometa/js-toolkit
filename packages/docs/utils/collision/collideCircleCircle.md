# collideCircleCircle

Test if two circles collide with one another.

## Usage

```js
import { collideCircleCircle } from '@studiometa/js-toolkit/utils';

const circle1 = {
  x: 40,
  y: 40,
  radius: 40,
};

const circle2 = {
  x: 100,
  y: 100,
  radius: 60,
};

collideCircleCircle(circle1, circle2); // true
```

### Parameters

- `circle1` (`{ x: number, y: number, radius: number }`): the first circle dimensions and position
- `circle2` (`{ x: number, y: number, radius: number }`): the second circle dimensions and position

### Return value

- `boolean`: wether the circles are colliding or not
