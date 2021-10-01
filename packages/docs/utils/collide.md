---
sidebar: auto
---

# Collide

Collides utils is used to test if two DOM elements are overlapping.

Inspired by http://www.jeffreythompson.org/collision-detection/

## `collidePointRect`

Test if a point collides with a rectangle.

**Parameters**

- `point` (`Point`)
- `rect` (`Rect`)

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/collide/collidePointRect.js)

**Usage**

```js
import { collidePointRect } from '@studiometa/js-toolkit/utils/collide';

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

## `collideRectRect`

Test if a rectangle collides with another rectangle.

**Parameters**

- `rect1` (`Rect`)
- `rect2` (`Rect`)

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/collide/collideRectRect.js)

**Usage**

```js
import { collideRectRect } from '@studiometa/js-toolkit/utils/collide';

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

## `boundingRectToCircle`

Convert clientRect to a formatted circle object.

⚠️ It doesn't work if the DOM element is not a perfect square, but it can be forced with the second parameter.

**Parameters**

- `domRect` (`Partial<DOMRect>`)
- `force` (`Boolean`) : `false` by default

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/collide/boundingRectToCircle.js)

**Usage**

```js
import { boundingRectToCircle } from '@studiometa/js-toolkit/utils/collide';

const clientRect1 = { x: 0, y: 0, width: 100, height: 100 };
boundingRectToCircle(clientRect1); // { x: 50, y: 50, radius: 50 }

const clientRect2 = element.getBoundingClientRect();
boundingRectToCircle(clientRect2);
```

## `collideCircleRect`

Test if a circle collides with a rectangle.

**Parameters**

- `circle` (`Circle`)
- `rect` (`Rect`)

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/collide/collideCircleRect.js)

**Usage**

```js
import { collideCircleRect } from '@studiometa/js-toolkit/utils/collide';

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

## `collideCircleCircle`

Test if a circle collides with another.

**Parameters**

- `circle1` (`Circle`)
- `circle2` (`Circle`)

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/collide/collideCircleCircle.js)

**Usage**

```js
import { collideCircleCircle } from '@studiometa/js-toolkit/utils/collide';

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

## `collidePointCircle`

Test if a point is inside a circle.

**Parameters**

- `point` (`Point`)
- `circle` (`Circle`)

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/collide/collidePointCircle.js)

**Usage**

```js
import { collidePointCircle } from '@studiometa/js-toolkit/utils/collide';

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
