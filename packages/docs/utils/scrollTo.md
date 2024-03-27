# scrollTo

Scroll vertically using [tween](./tween.html) to a given target, be it a selector or an element, without blocking user interaction.

## Usage

```js
import { scrollTo } from '@studiometa/js-toolkit/utils';

await scrollTo('#target');
await scrollTo(document.querySelector('#target'));
```

### Parameters

- `selectorElement` (`string|HTMLElement`): the target of the scroll
- `options` (`ScrollToOptions`): options for the scroll (offset + [tween options](./tween.html))

### Return value

This function returns a `Promise` resolving to the target scroll position, even when stopped by use interaction.

### Types

```ts
type EasingFunction = (value: number) => number;
type BezierCurve = [number, number, number, number];

interface ScrollToOptions {
  /**
   * Root element that will be scrolled.
   */
  rootElement?: HTMLElement;
  /**
   * Scroll direction.
   */
  axis?: 'X' | 'Y' | 'BOTH';
  /**
   * Distance from the target.
   */
  offset?: number;
  /**
   * The duration, in seconds.
   * Defaults to `1`.
   */
  duration?: number;
  /**
   * The delay, in seconds.
   * Defaults to `0`.
   */
  delay?: number;
  /**
   * The easing function or bezier curve to use.
   * Defaults to a linear easing function.
   */
  easing?: EasingFunction | BezierCurve;
  /**
   * The smooth factor. Setting this option to `true` or a `number` will disable the `duration` option.
   */
  smooth?: true | number;
  /**
   * The precision for when to consider the tween finished.
   * Defaults to `0.0001`.
   */
  precision?: number;
  /**
   * A callback executed on start.
   */
  onStart?: (progress: number) => void;
  /**
   * A callback executed each time the progress is updated.
   */
  onProgress?: (progress: number) => void;
  /**
   * A callback executed when the tween is finished.
   */
  onFinish?: (progress: number) => void;
}

function scrollTo(
  selectorElement: HTMLElement | string,
  options?: ScrollToOptions,
): Promise<number>;
```
