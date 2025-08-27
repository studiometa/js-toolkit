# loadImage

Load a given image.

## Usage

```js twoslash
import { loadImage } from '@studiometa/js-toolkit/utils';

const src = '/path/to/my/image.jpg';
const { event, element } = await loadImage(src);

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

### Avoid loading the same image multiple times

You can combine the `loadImage` function with the [`memo` function](/utils/memo.html) to add an in memory cache layer. This will make the generated function always return the same generated element.

```js twoslash
import { loadImage, memo } from '@studiometa/js-toolkit';

const loadImageWithCache = memo(loadImage);
const promise = loadImageWithCache('image.webp');
const promise2 = loadImageWithCache('image.webp');

console.assert(promise === promise2); // true

const [result, result2] = await Promise.all([promise, promise2]);

console.assert(result === result2);
```

::: warning Cache invalidation
Be aware that the [`memo` function](/utils/memo.html) will use a simple `arguments.join('')` call to generate the cache key, thus ignoring any change in the options parameter of the `loadImage` function.

```js twoslash
const loadImageWithCache = memo(loadImage);

const result = await loadImageWithCache('image.webp', {
  appendTo: document.head,
});
const result2 = await loadImageWithCache('image.webp', {
  appendTo: document.body,
});

console.assert(result === result2); // true

console.log(result.element.parentElement); // document.head
console.log(result2.element.parentElement); // document.head
```

:::
