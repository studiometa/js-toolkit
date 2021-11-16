# matrix

This method will format a matrix CSS transform function.

## Usage

```js
import { matrix } from '@studiometa/js-toolkit/utils';

document.body.style.transform = matrix({ scaleX: 0.5, scaleY: 0.5 });
// matrix(0.5, 0, 0, 0.5, 0, 0)
```

### Parameters

- `options.scaleX?` (`number`): the scale on the x axis
- `options.scaleY?` (`number`): the scale on the y axis
- `options.skewX?` (`number`): the skew on the x axis
- `options.skewY?` (`number`): the skew on the y axis
- `options.translateX?` (`number`): the translate on the x axis
- `options.translateY?` (`number`): the translate on the y axis

### Return value

- `String`: a formatted CSS matrix transform
