# What is the JS Toolkit

## Why we created it
The JS Toolkit is born from our needs and practices with JavaScript as a team at [Studio Meta](https://www.studiometa.fr).

Its purposes are:

- Easily get elements from the DOM
- Register custom behaviours on component initialization
- Unregister these custom behaviours on component destruction
- Adding custom behaviours on page load, scroll and resize
- Adding custom behaviours on each frame with requestAnimationFrame
- Initialize components in the right place at the right time
- Define dependencies between components

## How it works

Write classes extending the `Base` classes, add some `data-*` attributes to your HTML and voilà!

The example below is for a simple component which can toggle the visibility of its content.

```html
<div data-component="Toggle">
  <button data-ref="btn">Toggle content</button>
  <div class="hidden" data-ref="content">Some content</div>
</div>
```

```js
import { Base } from '@studiometa/js-toolkit';

class Toggle extends Base {
  static config = {
    name: 'Toggle',
    refs: ['btn', 'content'],
  };

  onBtnClick() {
    this.$refs.content.classList.toggle('hidden');
  }
}

Toggle.$factory('Toggle');
```

The class created by extending the `Base` class are components and can be used to achieve the above mentioned purposes.

## Ready to get started ?

To learn more how to handle and begin with the js-toolkjit you can head to the next page [`getting started`](/guide/introduction/getting-started/) or if you are already familiar with the js-toolkit and want to go deaper you can head to the [`API reference`](/guide/recipes/api/) for more specific documentation.
