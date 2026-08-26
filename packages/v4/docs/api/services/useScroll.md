# useScroll

```ts
useScroll(target?: Element | Window): Service<ScrollProps>
```

Scroll position, movement and direction for one scroller. With no target it is the document element; `useScroll(document.documentElement)` is the window service.

## Props

```ts
interface ScrollProps {
  readonly x: number;
  readonly y: number;
  readonly deltaX: number;
  readonly deltaY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly progressX: number;
  readonly progressY: number;
  readonly directionX: -1 | 0 | 1;
  readonly directionY: -1 | 0 | 1;
  readonly isScrolling: boolean;
}
```

Nothing derivable is a field: `lastX` is `x - deltaX`, and `changedX` is `deltaX !== 0`.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"5d0c1d0a7964d233cdf422707f2496b6ef193e82a43baf1257abb47d4ef47e53","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XgAMy6YAefTAvC6qgAyvxNKxWIw9gc0AB+RC8BFI1jSBbo7jYuFkIjsfhSXH1ViGbRmCzhOww+GImlOFxuPAAVVUvAiPjgbORvFUpHJlN4OFIvDRA3ivAAIjAQcwuqw0CJarLvLwAO5nFx6xK7VLpTLZPJUApFOClCrVWr1RrNNodbq9fqDYajcYlMUS+AlWEwanI+IFSysaazEDzRaIACMAFZVutNstTftDh4Q2Ho6dzogriAbncHmQkCm3h8cHgfpXdv8PIJhLwABIwZiwchzPYMRAANgAHGmwBstkOs+i8J3u42smcvgAma63Uj3R5IQc16ifevEBc0egAjhcPit/wOKSyWKKZQGTTaXh6Y50kzmKw2ZnHDmudyeLql4BEEIT8GENiRNEcj0HEcAmtQZpIBki65PkhTFGUlQ1HUDRNC07SdD0fSWAMzBDIEvoTDGfYLAOw4AMxjhO2zTjmIC/oWK5ruWW6IMuia7pgdbfIevbUM2ICMFgT5kJgfBzj28TgWAILsCk2LAOYvA6bwYDMKR2KdKQZwpAA3OYLxOPGA5LCsWTppOg5sQOpYRGpKRONkXxMaW66bpWzxCfuom/E2J4eNJsl2BgfD6YZopoCZ47Wf2VaJiWazjhmiA7Ih2aufFJyoT5PEbhWTzLhcwUiQQYl/BFUmkZs0AKV2SmWBA4I0FAjDErw3JgHAXQAEZCiZI3FZyAEADLsCCMD8Bggg+IQEA5BQvCkcw0HapN/JBCZUCwGACoALLMCEpADF0pDQswvhdmAXRYKC4KQhE5iMLYvA7b9pAbiEEAgjqMCWHwmzMPYpDgiIESg3p8i8AABgAJOCnXdX1yO8IAKASihgEL8qQ5hcIT/CIOY2m6WTROY9EMC9XwWnQrpOkqZ0orqfprAvr9erME0OrsPBqNnOUi1oIwcL9AAwhEx5oNwFms2z13dHdXMpDzHSjeN7CTYwjBEGwXQwHwOjGLwwC8IAZAS8C8yvUzpLxU2AACCoThFBMSwYopm/Vt7C0GcvDq7dQ36rc9hC3eSi/awEQpPqTT4LwTRwOYEB6mAm2hztISRJ0pmU2AztbV1DNM9b5c6eHmvIMN0rxPTPV9ZtfUvlbNv2y8Uwq2zVm0QmiYMYmzE5QA7C5eCt4zXlLkgqZ+bxgXLjVXx1WFEmNSwZ7AnmwoonKmIkkfBIFf1pLihSVJH++DJfrY9iH3if5ch4vI+AKopH6KZK3ylGQWUhJ5RKhVGqDUWoIAIwNIobOCFkhpGQhaM4VoCAYTtFhR0uEXQEXdMRL05EfRjAmAGW+cBgysjxBGNAUYaJxjSkmZMeUsosWeDPXM1D2RcW3GVAKTxEyCXeHuWqDZxKKyYM1QgUA+DX0DJIfM75NpEAgOwKAxhdZjURAbGAjB+BsFYCNe4OQSQAMpLLQxxj+A5EUffJ8cAVFqI0ZtLQaAoRwCxDiPWOjJoAHksDuIiDwbEg1hraImlNf8eA4Q+MibKGBmxBTmJgJtGyAchbzXTvYAWIhIDQ3BBYcciCkIoEyPXIaTgwlxN0QqLwySb6Sk6EYFOmxskiD8PYcJ+tJqkESDMYeA5EyDmcg5bKk57InzwN03xxVvJ8JXuVPiy4GIbwPNvSRkUsB3GamQPgGBsTPUsL01KdEqyT3smwnK498ozg8BgBeRZRlliWYFBiO4RHCU3uIhqrlpI7IGHs3gvRrofTAAATTPniRU7BQVBLAKckew5VxjPYRlThzhYWSyhOCx5Xxnn+QqkgBirxPkhS3keSSUUtByViteSQb4HGaNRjAVg2J2zSDOjNAAomsUi0REUDgEiiq5k5fJTI8CygsJUkDT0WQI9KazQqUt3jJGlMU+C8rBlENAyk/BwDmp0bEio/FnWkOtKIhqGBUGmngepYd2pVAiKwEIAAqV1yNgJWuRu6qU0VMD8hBkk3gWr+UxwZqQVUkoVLJDOCIB6HASBKlNeanIlqRb2HAsibF8NroyXgDqgOwbgK/UKBNLoNBA0I1Zdq6IdT8AiwEH9JJ0J9ohigAkraO12BYHVFDHwxb9W8A4J0eIbtkBnUVAAOV4AAJRVGQKIlIpiMBtJhEowxWXqpbhAAAXuwZE5FbApA3f+EoAB1GAI0SjuzUAASRKKGnVJQvUZu4IKpAAlRmiszLc9ir7Oh4tlfwolzClUUokVS6RrVk1motWAK18RagpBSGsVE8GjJJVMptEEthKReJGrhJ6/VCP1Ceu/AC9r3XI2Q6hvR3AfWuq2gMGRVbg0mrg2mhDGb04RqjT4a6nUSDxuhHQDNRb4Ogk0JYBGI77A7Q7RUkQqpWCqAVHeoNupahceBRAeAYAADkvseNNAM/G46jNfqKARmCCE8KHUa0jklM2Y6y5gAndOudC7roQhgCutdWCN2BC3c3Tq+7D3xGPaetwF6r03vvSUDjqb02dBKLRtY77BmfuXN+xyCyJXUAgChtYQHEBypeQq/iyZwM/PCn87ZG5dmkD4CCnNEKoU0hhXCqEH7+KtFy+MqsJYCutbBbi3hZWQN8VaNVslYj6p1aYA1gygLmu8AOXpLoxyFw2U/YOVheWkwYoeRN8rhK+KDlWbGcCsA8BP2ZDbY4m1X40gdlJsIvADMAAEiKemaswB0OFnT4TaAZlW5gS2KWAXHB8fIWY6XmO4/goRVLqT5jbIq2IDNQ9IAZh24PWZz2rvD3SFSWShiPn1LRPS9GMBthgTao34Xgodhbbutdhai1ZXq4QiH0t6IMyLKoDaLOGcZ1isbvArYXF4AAMll+tqXvAMoXCdqrVnA8HaWScP9pAoA7xwB6x4SoIAXgvCAA="}
import { Base, useScroll } from '@studiometa/js-toolkit-v4';

class Header extends Base {
  static config = { name: 'Header' };

  mounted() {
    return useScroll().subscribe(({ y, directionY }) => {
      this.$el.classList.toggle('is-hidden', directionY > 0 && y > 100);
    });
  }
}
```

A region rather than the page:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c1a236f4e0360b84c7c3fc73509eb78eaff7453c07d0cd6df85b0bf109e999d7","data":"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"}
import { Base, useScroll } from '@studiometa/js-toolkit-v4';

class Panel extends Base {
  static config = { name: 'Panel', refs: ['scroller'] };

  mounted() {
    return useScroll(this.$refs.scroller).subscribe(({ progressY }) => {
      this.$el.style.setProperty('--progress', String(progressY));
    });
  }
}
```

## One `read` per frame

The service **coalesces its scroll events into one `read` per frame**, so a page scrolling at speed measures once per frame rather than once per event.

## Extents are observed, not sampled once

The service watches the scroller **and its element children** with a `ResizeObserver`, plus a `childList` MutationObserver to keep that set correct: `1 + n` observed boxes per scroller, lazy and released with the last subscriber.

That is what keeps `maxY` and `progressY` correct when content is added, removed or resized.

## `{ immediate: true }` works here

A scroller has a current position between deliveries, so the first delivery is honoured. The first props of a run carry **no movement**: the deltas are zero and `directionX`/`directionY` are `0`.

## Mixin

```js
class Header extends withScroll(Base) {
  scrolled({ y, directionY }) {}
}
```

`withScroll` defaults to the page-wide source. A region is `withScroll(Base, { target: (instance) => instance.$refs.scroller })`.

## See also

- [`useWindowScroll()`](./useWindowScroll.html) — the named default case
- [`useScrollProgress()`](./useScrollProgress.html) — an element's progress through the viewport
