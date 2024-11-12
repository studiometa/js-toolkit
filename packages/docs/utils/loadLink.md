# loadLink

Load a given source as a link.

## Usage

```js
import { loadLink } from '@studiometa/js-toolkit/utils';

const src = '/path/to/my/styles.css';
const { event, element } = await loadLink(src);

if (event.type === 'error') {
  console.log(`Failed to load ${src}: ${event.message}`)
} else {
  console.log(`${src} has been loaded!`);
}
```

### Parameters

- `src` (`string`): the source URL to load
- `options` (`{ appendTo?: HTMLElement }`): configure the loader behavior
  - `options.appendTo` (`HTMLElement`): append the created element to a DOM element

### Return value

- `Promise<{ event: Event, element: HTMLelement }>`: a promise resolving to an object containing both the load event object and the created element
