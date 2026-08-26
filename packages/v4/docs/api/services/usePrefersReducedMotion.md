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
