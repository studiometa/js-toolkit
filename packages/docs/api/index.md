---
---

# Base class

## `class ＜Name＞ extends Base`

Create components with ease by extending the `Base` class.

**Constructor parameters**
- `element` (`HTMLElement`): the root element of the component/application

**Examples**

Create an app using a custom component and instantiate it:

```js
import { Base } from '@studiometa/js-toolkit';
import Component from './components/Component';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component,
    },
  };
}

const app = new App(document.body);
app.$mount();

export default app;
```

Create a component to be used by another component:

```js
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    this.$log('mounted');
  }

  onClick() {
    this.$log('clicked');
  }
}
```

