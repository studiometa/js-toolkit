# collideRectRect

Test if a rectangle collides with another rectangle.

## Usage

```js
import { collideRectRect } from '@studiometa/js-toolkit/utils';

const rect1 = {
  x: 0,
  y: 0,
  width: 20,
  height: 20,
};

const rect2 = {
  x: 0,
  y: 0,
  width: 20,
  height: 20,
};

collideRectRect(rect1, rect2); // true
```

### Parameters

- `rect1` (`{ x: number, y: number, width: number, height: number }`): the first rectangle's dimensions and position
- `rect2` (`{ x: number, y: number, width: number, height: number }`): the second rectangle's dimensions and position

### Return value

- `boolean`: wether the rectangles are colliding or not
