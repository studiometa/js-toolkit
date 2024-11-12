# loadScript

Load a given script.

## Usage

```js
import { loadScript } from '@studiometa/js-toolkit/utils';

const src = '/path/to/my/script.js';
const { event, element } = await loadScript(src);

if (event.type === 'error') {
  console.log(`Failed to load ${src}: ${event.message}`)
} else {
  console.log(`${src} has been loaded!`);
}
```

### Parameters

- `src` (`string`): the source URL to load
- `options` (`{ appendTo?: HTMLElement }`): configure the loader behavior
  - `options.appendTo` (`HTMLElement`): append the created element to a DOM element, defaults to `document.head` as the script will not be loaded if its element is not attached to the DOM

### Return value

- `Promise<{ event: Event, element: HTMLelement }>`: a promise resolving to an object containing both the load event object and the created element
