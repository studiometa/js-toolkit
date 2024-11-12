# loadElement

Load a given source for a given type of element.

## Usage

```js
import { loadElement } from '@studiometa/js-toolkit/utils';

const src = '/path/to/my/src.js';
const { event, element } = await loadElement(src, 'script');

if (event.type === 'error') {
  console.log(`Failed to load ${src}: ${event.message}`)
} else {
  console.log(`${src} has been loaded!`);
}
```

### Parameters

- `src` (`string`): the source URL to load
- `type` (`'embed' | 'iframe' | 'img' | 'link' | 'script' | 'track'`): the type of element that should be used to load the source
- `options` (`{ appendTo?: HTMLElement }`): configure the loader behavior
  - `options.appendTo` (`HTMLElement`): append the created element to a DOM element

### Return value

- `Promise<{ event: Event, element: HTMLelement }>`: a promise resolving to an object containing both the load event object and the created element
