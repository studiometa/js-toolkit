# scrollTo

Scroll vertically to a given target, be it a selector or an element, without blocking user interaction.

## Usage

```js
import { scrollTo } from '@studiometa/js-toolkit/utils';

await scrollTo('#target');
await scrollTo(document.querySelector('#target'));
```

### Parameters

- `selectorElement` (`string|HTMLElement`): the target of the scroll
- `options` (`{ offset?: number, dampFactor?: number }`): options for the scroll

### Return value

This function returns a `Promise` resolving to the target scroll position, even when stopped by use interaction.
