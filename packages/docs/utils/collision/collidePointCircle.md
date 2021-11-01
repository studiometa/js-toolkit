# collidePointCircle

Test if a point is inside a circle.

## Usage

```js
import { collidePointCircle } from '@studiometa/js-toolkit/utils';

const point = {
  x: 25,
  y: 25,
};

const circle = {
  x: 40,
  y: 40,
  radius: 40,
};

collidePointCircle(point, circle); // true
```


### Parameters

- `point` (`{ x: number, y: number }`): the point position
- `circle` (`{ x: number, y: number, radius: number }`): the circle dimensions and position

### Return value

- `boolean`: wether the point and circle are colliding or not
