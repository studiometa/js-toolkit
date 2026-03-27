# Lazy image

Lazy loading defers the download of off-screen images until they are about to enter the viewport, improving initial page load performance. This recipe uses the `withMountWhenInView` decorator so the component only activates when the element becomes visible.

## How it works

- **`withMountWhenInView`** wraps the base class and delays `mounted()` until the element scrolls into view. Zero JavaScript is executed for images that are never seen.
- **`mounted()`** reads the `data-src` attribute, sets it as the real `src`, then removes `data-src` to keep the DOM clean.
- The image only starts downloading at the moment it enters the viewport — the browser never requests it before that.

::: tip Production use
This is a minimal example. In a real project you may want to handle loading states (e.g., a placeholder or skeleton), error states, and `srcset` / `sizes` for responsive images.
:::

<script setup>
  const tabs = [
    { label: 'LazyImage.js' },
    { label: 'LazyImage.html' },
    { label: 'app.js' },
  ];
</script>

::: code-group

```js [LazyImage.js]
import { Base, withMountWhenInView } from '@studiometa/js-toolkit';

class LazyImage extends withMountWhenInView(Base) {
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

export default LazyImage;
```

```html [LazyImage.html]
<img
  data-component="LazyImage"
  data-src="https://picsum.photos/800/600"
  alt="Lazy loaded image"
/>
```

```js [app.js]
import { registerComponent } from '@studiometa/js-toolkit';
import LazyImage from './LazyImage.js';

registerComponent(LazyImage);
```

:::
