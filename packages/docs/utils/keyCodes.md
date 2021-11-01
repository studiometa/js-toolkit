# keyCodes

Map of keyboard keycodes and their human readable name.

## Usage

```js
import { keyCodes } from '@studiometa/js-toolkit/utils';

document.addEventListener('keydown', (e) => {
  if (e.keyCode === keyCodes.ESC) {
    // do something when the user presses the escape key...
  }
});
```
