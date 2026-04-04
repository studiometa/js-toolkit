# Scroll-linked animation

Animate elements based on scroll position with damped physics. This example demonstrates the `scrolled` and `ticked` services, the `map` / `damp` / `transform` utilities, and manual service toggling.

## What we're building

A three-column image grid where columns skew based on scroll velocity and alternate columns move at different parallax speeds. The animation feels smooth thanks to damped interpolation.

## HTML markup

A grid of images split into three columns. Each column is a `cols[]` ref (the `[]` suffix creates an array ref). One image is also marked as `offsetItem` to measure the parallax offset:

```html
<div
  data-component="ScrollLinkedAnimation"
  class="grid gap-10 grid-cols-3 p-10 my-10">
  <div data-ref="cols[]" class="grid gap-10">
    <img
      src="https://picsum.photos/seed/01/400/500"
      alt=""
      data-ref="offsetItem" />
    <img src="https://picsum.photos/seed/02/400/500" alt="" />
    <!-- more images... -->
  </div>
  <div data-ref="cols[]" class="grid gap-10">
    <img src="https://picsum.photos/seed/11/400/500" alt="" />
    <!-- more images... -->
  </div>
  <div data-ref="cols[]" class="grid gap-10">
    <img src="https://picsum.photos/seed/21/400/500" alt="" />
    <!-- more images... -->
  </div>
</div>
```

## JavaScript component

The component uses `scrolled()` to capture scroll progress and delta, then `ticked()` to apply damped transforms on each animation frame. Services are toggled manually for performance — `ticked` is only enabled while scrolling:

```js
import { Base } from '@studiometa/js-toolkit';
import { map, damp, transform } from '@studiometa/js-toolkit/utils';

export default class ScrollLinkedAnimation extends Base {
  static config = {
    name: 'ScrollLinkedAnimation',
    refs: ['cols[]', 'offsetItem'],
  };

  scrollDeltaY = 0;
  dampedScrollDeltaY = 0;
  scrollProgressY = 0;
  dampedScrollProgressY = 0;
  parallaxOffsetHeight = 100;

  mounted() {
    this.parallaxOffsetHeight = this.$refs.offsetItem.offsetHeight / 2;
  }

  resized() {
    this.parallaxOffsetHeight = this.$refs.offsetItem.offsetHeight / 2;
  }

  scrolled(props) {
    if (props.changed.y && !this.$services.has('ticked')) {
      this.$services.enable('ticked');
    }
    this.scrollProgressY = props.progress.y;
    this.scrollDeltaY = props.delta.y;
  }

  ticked() {
    this.dampedScrollDeltaY = damp(
      this.scrollDeltaY,
      this.dampedScrollDeltaY,
      0.05,
      0.0001,
    );
    this.dampedScrollProgressY = damp(
      this.scrollProgressY,
      this.dampedScrollProgressY,
      0.25,
      0.0001,
    );

    const items = this.$refs.cols.map((col, index) => {
      const skewY =
        index % 2
          ? this.dampedScrollDeltaY * -0.25
          : this.dampedScrollDeltaY * 0.25;
      const translateY =
        index % 2 === 0
          ? map(
              this.dampedScrollProgressY,
              0,
              1,
              this.parallaxOffsetHeight,
              -this.parallaxOffsetHeight,
            )
          : undefined;
      return { col, skewY, translateY };
    });

    if (this.dampedScrollDeltaY === this.scrollDeltaY) {
      this.$services.disable('ticked');
    }

    // Return a function to batch DOM writes (avoids layout thrashing)
    return () => {
      items.forEach((item) => {
        transform(item.col, { skewY: item.skewY, y: item.translateY });
      });
    };
  }
}
```

## App setup

```js
import { registerComponent } from '@studiometa/js-toolkit';
import ScrollLinkedAnimation from './ScrollLinkedAnimation.js';

registerComponent(ScrollLinkedAnimation);
```

## Live demo

<script setup>
  import { onMounted, onUnmounted, nextTick } from 'vue';
  import ScrollLinkedAnimationHtmlRaw from './ScrollLinkedAnimation.html?raw';

  let scrollLinkedAnimations;
  onMounted(async () => {
    const { default: ScrollLinkedAnimation } = await import('./ScrollLinkedAnimation.js');
    await nextTick();
    scrollLinkedAnimations = ScrollLinkedAnimation.$register();
  });
  onUnmounted(() => {
    scrollLinkedAnimations.forEach(instance => instance.$destroy());
  });
</script>

<div class="bg-vp-bg-alt rounded">
  <div v-html="ScrollLinkedAnimationHtmlRaw" />
  <p class="text-gray-400 text-xs text-center p-10 mt-10">Pictures from <a href="https://picsum.photos">picsum.photos</a></p>
</div>

## Further reading

- [Services guide](/guide/introduction/using-services.html) — how `scrolled` and `ticked` hooks work
- [`scrolled` service](/api/services/useScroll.html) — scroll service reference
- [Utils: `transform`](/utils/css/transform.html) — apply CSS transforms from JS
- [Utils: `damp`](/utils/math/damp.html) — damped interpolation for smooth animations
- [Utils: `map`](/utils/math/map.html) — remap a value from one range to another
