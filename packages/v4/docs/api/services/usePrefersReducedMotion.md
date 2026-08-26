# usePrefersReducedMotion

```ts
usePrefersReducedMotion(): Service<{ readonly matches: boolean }>
```

`(prefers-reduced-motion: reduce)` as a named service.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"bce193aeb9e6040b7177db727a7326d940fd1d873f0d8f454d1871a178f8d166","data":"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="}
import { Base, usePrefersReducedMotion } from '@studiometa/js-toolkit-v4';

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
