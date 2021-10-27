# `nextFrame`

Execute a given function in the next window frame.

**Parameters**

- `fn` (`Function`): the function to execute

[Source](https://github.com/studiometa/js-toolkit/blob/master/src/utils/nextFrame.js)

**Usage**

```js
import nextFrame from '@studiometa/js-toolkit/utils/nextFrame';

nextFrame(() => {
  console.log('I will be executed in the next frame!');
});
```
