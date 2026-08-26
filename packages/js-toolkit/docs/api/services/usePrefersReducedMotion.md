# usePrefersReducedMotion

```ts
usePrefersReducedMotion(): Service<{ readonly matches: boolean }>
```

`(prefers-reduced-motion: reduce)` as a named service.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"8512b9018c466f60bb108eac47d2cee4575c51c612e390a16217c39627022710","data":"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"}
import { Base, usePrefersReducedMotion } from '@studiometa/js-toolkit';

class Carousel extends Base {
  static config = { name: 'Carousel' };

  mounted() {
    return usePrefersReducedMotion().subscribe(({ matches }) => {
      matches ? this.stopAutoplay() : this.startAutoplay();
    });
  }

  startAutoplay() {}
  stopAutoplay() {}
}
```

## Why it is a service and not a read

**The preference changes while the page is open.** A read at load time is a snapshot that goes stale, and the user who turns reduced motion on mid-visit is exactly the user who most wants it honoured.

`props()` answers with no subscription, like every [`useMediaQuery()`](./useMediaQuery.html) instance — so a one-off check is still one line. Subscribe when the component should follow the change.

## Mounting on the preference instead

To decide whether a component exists at all, use the mount strategy:

```html
<div data-component="Parallax" data-mount="media:(prefers-reduced-motion: no-preference)"></div>
```

That strategy is **reversible**, so turning the preference on unmounts the component and turning it off mounts it again. `withMountWhenPrefersMotion` is deleted.
