# `keyCodes`

Map of keyboard keycodes and their human readable name.

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/keyCodes.js)

**Usage**

```js
import keyCodes from '@studiometa/js-toolkit/utils/keyCodes';

document.addEventListener('keydown', (e) => {
  if (e.keyCode === keyCodes.ESC) {
    // do something when the user presses the escape key...
  }
});
```
