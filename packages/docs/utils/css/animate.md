# animate

Use this function to animate the `transform` and `opacity` properties of an element.

## Usage

```js
import { animate, easeInOutExpo } from '@studiometa/js-toolkit/utils';

const animation = animate(
  document.body,
  [
    { x: 0, '--red': 0 }, // from
    { x: 100, scale: 0.5, opacity: 0.5, '--red': 255, easing: [0, 1, 0, 1] },
    { x: 0, '--red': 0 }, // to
  ],
  {
    duration: 10,
    easing: easeInOutExpo,
  },
);

animation.start();
```

### Parameters

- `element` (`HTMLElement | HTMLElement[] | NodeListOf<HTMLElement>`): the target HTML element
- `keyframes` (`KeyFrame[]`): array of objects describing the key frames of the animation
- `options` (`Options`): options for the animation, see [types](#types) below for more details

### Return value

The `animate` function returns an object with methods to control the animation:

#### `start()`

Use this method to start the animation which does not start automatically.

#### `pause()`

Use this method to pause an animation and commit its styles to the element.

#### `play()`

Use this method to unpause a paused animation.

#### `finish()`

Use this method to go to the end of the animation. This is an alias for `animation.progress(1)`.

#### `progress(value)`

Use this method to get or set the progress (`0–1` range) of the animation.

```js
import { animate } from '@studiometa/js-toolkit/utils';

const animation = animate(document.body, [{ opacity: 1 }, { opacity: 0 }]);

console.log(animation.progress()); // 0
animation.progress(1);
console.log(animation.progress()); // 1
console.log(document.body.style.opacity); // '0'
```

### Types

```ts
import { TransformProps } from '@studiometa/js-toolkit/utils';

type EasingFunction = (value:number) => number;
type BezierCurve = [number, number, number, number];
type CSSCustomPropertyName = `--${string}`;

interface KeyFrame extends TransformProps {
  opacity?: number;
  transformOrigin?: string;
  easing?: EasingFunction|BezierCurve;
  offset?: number;
  [key:CSSCustomPropertyName]: number;
}

interface Options {
  duration?: number;
  easing?: EasingFunction|BezierCurve;
  onProgress?: (progress: number, easedProgress: number) => void;
  onFinish?: (progress: number, easedProgress: number) => void;
}

animate(element:HTMLElement, keyframes: KeyFrame[], options?: Options): {
  start: () => void;
  pause: () => void;
  play: () => void;
  finish: () => void;
  progress: (value?: number) => number;
};
```
