# Getting started

## What is the `Base` class?

The `Base` class is born from our needs and practices with JavaScript as a team at [Studio Meta](https://www.studiometa.fr).

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

## Creating an app

To manage your components, it is recommend to use a single entry point which will import them. Dynamic imports can be used to only load components when they are needed.

```js
import { Base, createApp } from '@studiometa/js-toolkit';
import Component from './components/Component.js';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component,
      AsyncComponent: () => import('./components/AsyncComponent.js'),
    },
  };
}

export default createApp(App, document.body);
```

The [`createApp`](/api/helpers/createApp.html) helper will instantiate your app when the window has been loaded to avoid blocking anything.
