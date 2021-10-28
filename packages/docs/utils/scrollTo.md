# `scrollTo`

Scroll vertically to a given target, be it a selector or an element.

## Usage

```js
import { scrollTo } from '@studiometa/js-toolkit/utils';

await scrollTo('#target');
```

**Parameters**

- `selectorElement` (`string|HTMLElement`): the target of the scroll
- `options` (`{ offset?: number, dampFactor?: number }`): options for the scroll

[Source](https://github.com/studiometa/js-toolkit/blob/master/packages/js-toolkit/utils/scrollTo.js)
