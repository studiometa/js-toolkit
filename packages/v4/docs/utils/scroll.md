# Scroll

```js twoslash
// @twoslash-cache: {"v":1,"hash":"163db70e28923aa2b20e63b7b2ae7f56fa6872331d5bd67d99f951a9646147f1","data":"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"}
import { lockScroll, scrollPosition, scrollTo } from '@studiometa/js-toolkit-v4/utils';
```

[[toc]]

## `scrollPosition` and `scrollTo`

```ts
scrollPosition(target: ScrollToTarget, options?: ScrollPositionOptions): ScrollPosition
scrollTo(target: ScrollToTarget, options?: ScrollToOptions): ScrollPosition
```

**The two halves are separate because callers need them separately.** `scrollPosition()` measures and returns; `scrollTo()` calls it and moves.

A carousel asks which slide is nearest three times for every time it travels — and in v3, asking meant scrolling.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"10b65acede9ba0519627cdeabb797d01ba494e784435a70ef8488a88e9efd153","data":"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="}
import { scrollPosition, scrollTo } from '@studiometa/js-toolkit-v4/utils';

const el = document.body;

// Where would we end up?
const { top, left } = scrollPosition(el, { align: 'center' });

// Go there.
scrollTo(el, { align: 'center', offset: -80 });
scrollTo('#section', { axis: 'y' });
scrollTo(0);
scrollTo({ top: 200 });
```

### The target

```ts
type ScrollToTarget = string | Element | number | Partial<{ left: number; top: number }>;
```

A selector, an element, a number, or a position. **A number or a position names its own destination**, so `align` does not apply to it.

### The options

```ts
interface ScrollPositionOptions {
  rootElement?: Element | Window; // what scrolls. Defaults to the window.
  axis?: 'x' | 'y' | 'both'; // which axes a target that names none may move. Defaults to 'y'.
  offset?: number; // pixels to stop short. Defaults to 0.
  align?: ScrollAlign | { x?: ScrollAlign; y?: ScrollAlign };
}

interface ScrollToOptions extends ScrollPositionOptions {
  behavior?: ScrollBehavior; // 'smooth', or 'instant' when the reader asked for less motion
}
```

`SCROLL_AXES` and `SCROLL_ALIGNMENTS` are the frozen sets behind `axis` and `align`.

**`align` is `'start' | 'center' | 'end'`, or one per axis**, and it applies to an **element** target only.

::: tip The names are physical, like `axis`
`x` and `y`, not the platform's `inline` and `block`. Nothing here maps a writing mode, and borrowing that vocabulary without the mapping would promise what `compute-scroll-into-view` promises and does not deliver.
:::

### What the arithmetic gets right

- **The viewport is the client box**, so a scrollbar gutter is out of the arithmetic with no special case.
- **The destination is clamped to the scroll range**: centring the first slide asks for a negative offset and gets `0`.
- `behavior` defaults to `'smooth'`, or to `'instant'` when the reader has asked for less motion — so honouring the preference is the default rather than a call site's responsibility.

### A dependency was measured and refused

`compute-scroll-into-view` is 1.4 kB and walks **every** scrolling ancestor — which is what v4's single `rootElement` contract declines, and what a boundary option already cancels. Its own source leaves writing modes unimplemented and reads no `scroll-padding`, so the real delta over core was about twenty lines.

## `lockScroll`

```ts
lockScroll(target?: HTMLElement): () => void
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"567316d2f1f217624af491b67b96dae123d1d71b86be115b818cdf4e3a8b45f7","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvVhBEBrAMojSEVq0ZpmpAOYw0AfkS8AEgBUAsgBkAoqxgBbGGDTcjjPgF4AfLyIR2UAA6YOz2WBCkaNKyisqqrJQgULIIiCAKaBBYvMxSMHaOzrxwcWrsYNq8wuKsvDAkpBi8hKywpLyk+TBc8LzsaAB0wcEAgrz20GzFgqT8zCIwfXC8kFFskouSvGj4i1jMukbMvFCcMpVZTjBQAir2fWBwAYvMwVCkzADuZOPdj9ufCDNVRtOAUHJgG47TZgRY7ZhREQyOC9fjsUhwKL2QSYlYQKJYQRRaHBEoqNS8ABG8zkVUhP2hvA2xRqtUuYAGvAAwhBquVKuxlozPi09v4ioAUAm2u2CaIxURk8mKzBIQt2Dw4sN8bEEi36Al5kPBjNYXCinTsPV4hLQyzo8zQrAwwXhUSIOsW1Pk4NyUPVG2W5Spem+TiZYCd42IcPVIkNg2GYFM6ot3RRSz6sDC+KcaHBcCBxzgMzmC3GzCaIjYtX1WyREHTvpy2mYQckwWEE2qvE+/UIRN4cb5FQB7AWA0Smm0qWQyBA+w+9knWl0UQA6vgESysssyfF+ZyACIwOaCVi27ZAxnJESCQpRLr3icAXQoc86aBmj0SACUuladkFYFWjIAByZZFTkF83xAe0wjsRIAANkIAKzgYI40ec1/3TDxonkJRyXUbgAG5ggAenI3hADICU0aFIcERTHXYGkHCBHGWOVMWCVMencMiwGQxCQGfV8QExLQGEQABOKg7AqHYkAARgABioTQdD0PBIMI+JEk1XBEDUkARE3D4xDIJBpIAXwodBsEMgho3IdS6CkkzJFxXiUTcTwfD8AJEgkyIkAANlkkB5O0RTEAAdnUlctLSbzcDk8pDIAJioUytAdSzEFC2z7JwPBCAaSc3KYNhOB4fDYiIjREoMIwzCsWwHFzVxeHcXhvF8fwghCbNIjq3S1ESG9UnSTJslyOoClzYpSk1So+VqeoyCaFo2g6HDen6IYwFGKMoCmYtZnmPVllWHIZC1LZGX2Q4chOM4IAuHBYRufg7geJ5YByN4Pm+dpHFyIVAWA0EfUhaUYRjLd6xRTj0VxbFcRum04dJZaqRpOkdsZZlMXYCl2U5HlhwFNVFhFVQxXKKIpRJMAuIVGJlVVOGNXS7VWF1Poon4Q0oGNdVTS8vbrSJO1aAdJ0XU3N0PTx70IT9eHAykSkQxgMNJEjCYSG5odnEO4Jk0WFKM2ebMaGcfNC2mC6y3sCtB2rQXw0HZEXlhg5WykdswE7eMez7XlEXjflR3HZdpyQWd51ypcEs09cle3LBd2Wg9eGPU9zyFK91RvO9FsfXNoPfPQvwQKg/0tdNAOWbawIgmJq9guX4NSkAhLQjDPOwpvFjwnTlv4iiqNohEyEY/BmI29o4w4gRUbQHi9qnwTkJEsTgqk2KIqimLVLT1dtJiMaEjS2EkCykyzLy8hECUwq7OoBzSucir6DwTCktR6+V6v5AaQUNJSSUu/OSThor4CQPFagTU8ApX0ulJAAAWbKz8LKvxUtZMScZYB4FCOEEawBRq42srcdivBQIAAFMSCFOOxPQzByJoQALSZFUHIfoXCiCYPIkSUmcBQICSHlhXao9epUIaqRaeNFuYTFOjWZY7It6j34okRwmgkCgDck4J4kg8BoRANZayQA=="}
import { lockScroll } from '@studiometa/js-toolkit-v4/utils';

const release = lockScroll();
// … the modal is open
release();
```

**It counts.** A modal surface is not alone on a page: a dialog opened from inside a drawer is two holders, and the one that closes first must not put the scroll back under the one still open.

- The **first** lock saves the inline value it found.
- The **last** release puts exactly that value back.
- The ones between only move the count.

**The release is idempotent**, so a surface calls it on close and again on unmount without counting twice — and a component unmounted while open owes the page its scroll, which is what the second call is for.

```js
mounted() {
  return this.release ?? undefined;
}
```

**The count is shared across evaluated copies of the package**, through the same runtime slot the focus helpers use, for the same reason: there is one scroll per document.

### It is `overflow: hidden` and nothing else

No `paddingRight` compensation. `scrollbar-gutter: stable` is the page's own answer and it does not mis-handle fixed children.

iOS Safari remains unreliable — which is the argument for having **one** function rather than a copy per component.

::: tip A native `<dialog>` needs it too
`showModal()` gives the top layer, the backdrop, a focus trap and `Escape`. It does **not** stop the page behind it scrolling.
:::

## See also

- [`useScroll()`](/api/services/useScroll.html) — scroll position as a service
- [`useScrollProgress()`](/api/services/useScrollProgress.html) — an element's progress through the viewport
