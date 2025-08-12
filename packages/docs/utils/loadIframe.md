# loadIframe

Load a given URL as an iframe.

## Usage

```js twoslash
import { loadIframe } from '@studiometa/js-toolkit/utils';

const src = '/path/to/my/iframe.html';
const { event, element } = await loadIframe(src);

if (event.type === 'error') {
  console.log(`Failed to load ${src}: ${event.message}`);
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

## Examples

### Avoid loading the same iframe multiple times

You can combine the `loadIframe` function with the [`memo` function](/utils/memo.html) to add an in memory cache layer. This will make the generated function always return the same generated element.

```js twoslash
import { loadIframe, memo } from '@studiometa/js-toolkit';

const loadIframeWithCache = memo(loadIframe);
const promise = loadIframeWithCache('iframe.html');
const promise2 = loadIframeWithCache('iframe.html');

console.assert(promise === promise2); // true

const [result, result2] = await Promise.all([promise, promise2]);

console.assert(result === result2);
```

::: warning Cache invalidation
Be aware that the [`memo` function](/utils/memo.html) will use a simple `arguments.join('')` call to generate the cache key, thus ignoring any change in the options parameter of the `loadIframe` function.

```js twoslash
const loadIframeWithCache = memo(loadIframe);

const result = await loadIframeWithCache('iframe.html', {
  appendTo: document.head,
});
const result2 = await loadIframeWithCache('iframe.html', {
  appendTo: document.body,
});

console.assert(result === result2); // true

console.log(result.element.parentElement); // document.head
console.log(result2.element.parentElement); // document.head
```

:::
