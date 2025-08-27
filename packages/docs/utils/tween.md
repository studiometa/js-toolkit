# tween

Execute a function while tweening a value between 0 and 1.

## Usage

```js twoslash
import { tween, easeInOutExpo } from '@studiometa/js-toolkit/utils';

const tw = tween(
  (progress) => {
    console.log(progress); // from 0 to 1
  },
  {
    duration: 10,
    easing: easeInOutExpo,
  },
);

tw.start();
```

### Parameters

- `callback` (`(progress:number) => void`): the function called for each frame
- `options` (`Options`): options for the animation

### Options

- `duration` (`number`): The duration in seconds, defaults to `1`
- `delay` (`number`): The delay in seconds, defaults to `0`
- `easing` (`EasingFunction | BezierCurve`): The easing function or bezier curve, defaults to linear
- `smooth` (`true | number`): The smooth factor. Setting this disables the `duration` option. If `true`, uses default damping; if a number, uses that as damping factor
- `spring` (`true | number`): Enable spring transition. Setting this disables the `duration` option. If `true`, uses default stiffness of `0.1`; if a number, uses that as stiffness
- `mass` (`number`): When spring physics are enabled, the mass factor, defaults to `1`
- `precision` (`number`): The precision for when to consider the tween finished, defaults to `0.00001`
- `onStart` (`(progress: number) => void`): Callback executed on start
- `onProgress` (`(progress: number) => void`): Callback executed each frame
- `onFinish` (`(progress: number) => void`): Callback executed when finished

### Return value

The `tween` function returns an object with methods to control the animation:

#### `start()`

Use this method to start the animation which does not start automatically.

#### `pause()`

Use this method to pause an animation and commit its styles to the element.

#### `play()`

Use this method to unpause a paused animation.

#### `finish()`

Use this method to go to the end of the animation. This is an alias for `tween.progress(1)`.

#### `progress(value)`

Use this method to get or set the progress (`0–1` range) of the animation.

```js twoslash
import { tween } from '@studiometa/js-toolkit/utils';

const tw = tween((progress) => {
  document.body.innerHTML = progress;
});

console.log(tw.progress()); // 0
tw.progress(1);
console.log(tw.progress()); // 1
console.log(document.body.innerHTML); // '1'
```

### Types

```ts
type EasingFunction = (value: number) => number;
type BezierCurve = [number, number, number, number];

interface Options {
  duration?: number;
  delay?: number;
  smooth?: true | number;
  spring?: true | number;
  mass?: number;
  precision?: number;
  easing?: EasingFunction | BezierCurve;
  onStart?: (progress: number) => void;
  onProgress?: (progress: number) => void;
  onFinish?: (progress: number) => void;
}

interface Tween {
  start: () => void;
  pause: () => void;
  play: () => void;
  finish: () => void;
  progress: (value?: number) => number;
}

function tween(
  callback: (progress: number) => void,
  options?: Options,
): Tween;
```

## Examples

### Cubic bezier easing

```js twoslash {8}
import { tween } from '@studiometa/js-toolkit/utils';

const easedTween = tween(
  (progress) => {
    element.style.transform = `scale(${progress})`;
  },
  {
    easing: [0.19, 1, 0.22, 1],
  },
);

easedTween.start();
```

### Spring physics

```js twoslash {7-10}
import { tween } from '@studiometa/js-toolkit/utils';

const springTween = tween(
  (progress) => {
    element.style.transform = `scale(${progress})`;
  },
  {
    spring: 0.2, // stiffness
    mass: 1.5, // mass
  },
);

springTween.start();
```

### Smooth damping

```js twoslash {7-9}
import { tween } from '@studiometa/js-toolkit/utils';

const smoothTween = tween(
  (progress) => {
    element.style.opacity = progress;
  },
  {
    smooth: 0.1, // damping factor
  },
);

smoothTween.start();
```
