# scrollTo

Scroll to a given target without blocking user interaction. The target can be a selector, an element, a number or a scroll position object.

If the target is a selector or an element, the `scroll-margin` CSS values will be respected when calculating the final scroll position.

The `scrollTo` function uses the [tween](./tween.html) function under the hood, inheriting from its options.

## Usage

```js twoslash
import { scrollTo, easeOutExpo } from '@studiometa/js-toolkit/utils';

await scrollTo('#target');
await scrollTo(document.querySelector('#target'));
await scrollTo(800);
await scrollTo({ top: 300, left: 200 });

// Custom axis
await scrollTo(800, { axis: scrollTo.axis.y }); // default
await scrollTo(800, { axis: scrollTo.axis.x });
await scrollTo(800, { axis: scrollTo.axis.both });

// With offset
await scrollTo('#target', { offset: 100 }); // stop at 100px from the target

// With a different scrolling element
await scrollTo(800, { rootElement: document.body });

// With custom easing and duration
await scrollTo(800, { duration: 2, easing: easeOutExpo });
await scrollTo(800, { smooth: 0.5 }); // custom smooth factor
```

### Parameters

- `target` (`string | HTMLElement | number | ScrollPosition`): the target of the scroll
- `options` (`ScrollToOptions`): options for the scroll (offset + [tween options](./tween.html))

### Return value

This function returns a `Promise` resolving to the scroll position, even when stopped by use interaction.

### Types

```ts
interface ScrollPosition {
  left: number;
  top: number;
}

type ScrollTarget = string | HTMLElement | number | Partial<ScrollPosition>;

interface ScrollToOptions extends TweenOptions {
  /**
   * Root element that will be scrolled.
   */
  rootElement?: HTMLElement | typeof window;
  /**
   * Scroll direction, available values are:
   * - scrollTo.axis.x (enabled if target is an object with a `left` key)
   * - scrollTo.axis.y (default)
   * - scrollTo.axis.both
   */
  axis?: (typeof scrollTo.axis)[keyof typeof scrollTo.axis];
  /**
   * Distance from the target.
   */
  offset?: number;
}

function scrollTo(
  target: ScrollTarget,
  options?: ScrollToOptions,
): Promise<ScrollPosition>;
```
