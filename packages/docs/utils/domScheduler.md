# domScheduler

A scheduler created with the [`useScheduler` function](./useScheduler.md) and made to schedule reads and writes from the DOM to avoid layout thrashing. Find out more by reading this [web.dev article](https://web.dev/avoid-large-complex-layouts-and-layout-thrashing).

This scheduler has 3 stages: `read`, `write` and `afterWrite`.

## Usage

```js twoslash
import { domScheduler } from '@studiometa/js-toolkit/utils';

domScheduler.read(() => {
  const size = document.body.offsetWidth;

  domScheduler.write(() => {
    document.body.style.transform = `translateX(${size * 0.1}px)`;
  });

  domScheduler.afterWrite(() => {
    console.log('transform has been applied!');
  });
});
```
