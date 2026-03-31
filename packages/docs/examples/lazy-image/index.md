# Lazy image

Defer image loading until the element scrolls into the viewport, improving initial page performance. This example demonstrates the `withMountWhenInView` decorator.

## What we're building

An `<img>` element that stores its real URL in `data-src`. The component only activates when the image enters the viewport, at which point it sets the real `src` attribute — triggering the download exactly when needed.

::: tip Production use
This is a minimal example. In a real project you may want to handle loading states (e.g. a placeholder or skeleton), error states, and `srcset` / `sizes` for responsive images.
:::

## HTML markup

The image element itself is the component root. The real URL is stored in `data-src` so the browser does not download it immediately:

```html
<img
  data-component="LazyImage"
  data-src="https://picsum.photos/800/600"
  alt="Lazy loaded image"
/>
```

## JavaScript component

`withMountWhenInView` wraps the `Base` class and delays the `mounted()` hook until the element scrolls into view. Zero JavaScript runs for images that are never seen:

```js
import { Base, withMountWhenInView } from '@studiometa/js-toolkit';

export default class LazyImage extends withMountWhenInView(Base) {
  static config = {
    name: 'LazyImage',
  };

  mounted() {
    const src = this.$el.dataset.src;
    if (src) {
      this.$el.src = src;
      this.$el.removeAttribute('data-src');
    }
  }
}
```

## App setup

```js
import { registerComponent } from '@studiometa/js-toolkit';
import LazyImage from './LazyImage.js';

registerComponent(LazyImage);
```

## Further reading

- [Decorators guide](/guide/going-further/using-decorators.html) — how `withMountWhenInView` and other decorators work
- [Lifecycle guide](/guide/introduction/lifecycle-hooks.html) — the `mounted()` hook
- [`withMountWhenInView` API](/api/decorators/withMountWhenInView.html) — decorator reference
