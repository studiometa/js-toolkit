# ease

Functions to get the eased version of a progress value in the 0–1 range and helpers function to generate ease-out and ease-in-out functions.

## Usage

```js
import {
  // in
  easeInCirc,
  easeInCubic,
  easeInExpo,
  easeInQuad,
  easeInQuart,
  easeInQuint,
  easeInSine,
  // out
  easeOutCirc,
  easeOutCubic,
  easeOutExpo,
  easeOutQuad,
  easeOutQuart,
  easeOutQuint,
  easeOutSine,
  // in-out
  easeInOutCirc,
  easeInOutCubic,
  easeInOutExpo,
  easeInOutQuad,
  easeInOutQuart,
  easeInOutQuint,
  easeInOutSine,
} from '@studiometa/js-toolkit/utils';

easeInCirc(0);     // 0
easeInCirc(0.25);  // 0.031754163448145745
easeInCirc(0.5);   // 0.1339745962155614
easeInCirc(0.55);  // 0.16483534557549673
easeInCirc(0.9);   // 0.5641101056459328
easeInCirc(0.95);  // 0.6877501000800801
easeInCirc(0.99);  // 0.858932640203341
easeInCirc(1);     // 1
```

### Parameters

- `progress` (`number`): a progress value betwen 0 and 1.

### Return value

- `number`: eased progress value between 0 and 1.
