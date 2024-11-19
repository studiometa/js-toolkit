# loadScript

Load a given script.

## Usage

```js
import { loadScript } from '@studiometa/js-toolkit/utils';

const src = '/path/to/my/script.js';
const { event, element } = await loadScript(src);

if (event.type === 'error') {
  console.log(`Failed to load ${src}: ${event.message}`);
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

## Examples

### Avoid loading the same script multiple times

You can combine the `loadScript` function with the [`memo` function](/utils/memo.html) to add an in memory cache layer. This will make the generated function always return the same generated element.

```js
import { loadScript, memo } from '@studiometa/js-toolkit';

const loadScriptWithCache = memo(loadScript);
const promise = loadScriptWithCache('script.js');
const promise2 = loadScriptWithCache('script.js');

console.assert(promise === promise2); // true

const [result, result2] = await Promise.all([promise, promise2]);

console.assert(result === result2);
```

::: warning Cache invalidation
Be aware that the [`memo` function](/utils/memo.html) will use a simple `arguments.join('')` call to generate the cache key, thus ignoring any change in the options parameter of the `loadScript` function.

```js
const loadScriptWithCache = memo(loadScript);

const result = await loadScriptWithCache('script.js', { appendTo: document.head });
const result2 = await loadScriptWithCache('script.js', { appendTo: document.body });

console.assert(result === result2); // true

console.log(result.element.parentElement): // document.head
console.log(result2.element.parentElement): // document.head
```

:::
