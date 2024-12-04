# createElement

A function for creating HTML elements.

## Usage

```js
import { createElement } from '@studiometa/js-toolkit/utils';

const div = createElement('div', 'hello world');
const main = createElement('main', { id: 'main' }, div);

console.log(main.outerHTML); // <main id="main"><div>hello world</div></main>

// camelCase attribute keys are converted to dash-case
createElement('div', { dataOption: 'foo' }); // <div data-option="foo"></div>

// if the second parameter is a string, a Node or and array, it is treated as chidlren
createElement('div', 'lorem ipsum'); // <div>lorem ipsum</div>
```

### Parameters

- `tag` (`string`): the name of the element to create, defaults to `div`
- `attributes` (`Record<string, string>`): attributes for the created element, camelCase keys are transformed to dash-case
- `children` (`string | Node | Array<string | Node>`): child or children to append to the element

### Return value

An element with the given attributes and children.
