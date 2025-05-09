# loadElement

Load a given source for a given type of element.

## Usage

```js twoslash
import { loadElement } from '@studiometa/js-toolkit/utils';

const src = '/path/to/my/src.js';
const { event, element } = await loadElement(src, 'script');

if (event.type === 'error') {
  console.log(`Failed to load ${src}: ${event.message}`);
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

## Examples

### Avoid loading the same element multiple times

You can combine the `loadElement` function with the [`memo` function](/utils/memo.html) to add an in memory cache layer. This will make the generated function always return the same generated element.

```js twoslash
import { loadElement, memo } from '@studiometa/js-toolkit';

const loadElementWithCache = memo(loadElement);
const promise = loadElementWithCache('/path/to/script.js', 'script');
const promise2 = loadElementWithCache('/path/to/script.js', 'script');

console.assert(promise === promise2); // true

const [result, result2] = await Promise.all([promise, promise2]);

console.assert(result === result2);
```

::: warning Cache invalidation
Be aware that the [`memo` function](/utils/memo.html) will use a simple `arguments.join('')` call to generate the cache key, thus ignoring any change in the options parameter of the `loadElement` function.

```js twoslash
const loadElementWithCache = memo(loadElement);

const result = await loadElementWithCache('script.js', 'script', { appendTo: document.head });
const result2 = await loadElementWithCache('script.js', 'script', { appendTo: document.body });

console.assert(result === result2); // true

console.log(result.element.parentElement); // document.head
console.log(result2.element.parentElement); // document.head
```

:::
