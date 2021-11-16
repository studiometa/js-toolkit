# withScrolledInView

Use this decorator to create a component with a hook to easily create animation based on the vertical scroll position.

## Usage

```js {1,3,8-10}
import { Base, withScrolledInView } from '@studiometa/js-toolkit';

class Component extends withScrolledInView(Base) {
  static config = {
    name: 'Component',
  };

  scrolledInView(props) {
    // do something with `props.progress.y`
  }
}
```

:::tip Info
This decorator uses the [`withMountWhenInView`](./withMountWhenInView.html) decorator under the hood.
:::

## API

### Custom hooks

#### `scrolledInView`

The `scrolledInView` class method will be triggered for each frame of the component being in the viewport.

**Arguments**

- `props` (`{ start: Point, end: Point, current: Point, progress: Point }`): Values corresponding to the progress of the component's root element in the viewport.
  - `props.start` (`{ x: number, y: number }`): The scroll position were the element starts to be visible.
  - `props.end` (`{ x: number, y: number }`): The scroll position were the element is not visible anymore.
  - `props.current` (`{ x: number, y: number }`): The current scroll position, clamped in the `props.start` and `props.end` range.
  - `props.progress` (`{ x: number, y: number }`): The progress of the element between `props.start` and `props.end` mapped to a `0–1` range.

## Examples

### Implement parallax

```js {13-16}
import { Base, withScrolledInView } from '@studiometa/js-toolkit';
import { map } from '@studiometa/js-toolkit/utils';

export default class Parallax extends withScrolledInView(Base) {
  static config = {
    name: 'Component',
    options: {
      speed: Number,
    },
    refs: ['target'],
  };

  scrolledInView({ progress }) {
    const y = map(progress.y, 0, 1, -100, 100) * this.$options.speed;
    this.$refs.target.style.transform = `translateY(${y}px)`;
  }
}
```

:::tip Info
Apply transformations to refs instead of the root element. The decorator uses the [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) function to calculate the props values and it does not reverse any transform applied.
:::
