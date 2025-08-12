# tween

Execute a function while tweening a value between 0 and 1.

## Usage

```js twoslash
import { tween, easeInOutExpo } from '@studiometa/js-toolkit/utils';

const tw = tween(
  (progress) => {
    document.body.innerHTML = progress;
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
