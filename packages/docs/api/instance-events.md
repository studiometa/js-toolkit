# Events

## Lifecycle events

### `mounted`

Emitted when the instance is mounted.

```js
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

const app = new App(document.body);

app.$on('mounted', () => {
  console.log('App is mounted');
});
```

### `updated`

```js
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

const app = new App(document.body);

app.$on('updated', () => {
  console.log('$update() has been called on this component');
});
```

### `destroyed`

```js
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

const app = new App(document.body);

app.$on('destroyed', () => {
  console.log('$destroy() has been called on this component');
});
```

### `terminated`

```js
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

const app = new App(document.body);

app.$on('terminated', () => {
  console.log('$terminate() has been called on this component');
});
```

## Services events

### `keyed`

```js
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

const app = new App(document.body);

app.$on('keyed', () => {
  console.log('User is typing');
});
```

### `loaded`

```js
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

const app = new App(document.body);

app.$on('loaded', () => {
  console.log('App is loaded');
});
```

### `moved`

```js
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

const app = new App(document.body);

app.$on('moved', () => {
  console.log('User is moving their cursor');
});
```

### `resized`

```js
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

const app = new App(document.body);

app.$on('resized', () => {
  console.log('User is resizing the window');
});
```

### `scrolled`

```js
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

const app = new App(document.body);

app.$on('scrolled', () => {
  console.log('User is scrolling');
});
```

### `ticked`

```js
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
  };
}

const app = new App(document.body);

app.$on('ticked', () => {
  console.log('The render loop has ticked');
});
```

## Internal events

:::warning
The following events are internal to the API, they should be used with caution.
:::

### `get:options`

Emitted when the [`$options` property](/api/instance-properties.html#options) is accessed. This event can be used to alter options.

```js
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    options: {
      active: Boolean,
      value: String,
    },
  };
}
const app = new App(document.body);

app.$on('get:options', ({ detail: [options] }) => {
  console.log(options); // { active: false, value: '' }
});
```

### `get:refs`

Emitted when the [`$refs` property](/api/instance-properties.html#refs) is accessed. This event can be used to alter refs.

```js
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    refs: ['btn'],
  };
}
const app = new App(document.body);
app.$on('get:refs', ({ detail: [refs] }) => {
  console.log(refs); // { btn: HTMLElement }
});
```

### `get:children`

Emitted when the [`$children` property](/api/instance-properties.html#children) is accessed. This event can be used to alter children components.

```js
import { Base } from '@studiometa/js-toolkit';
import { Base } from '@studiometa/js-toolkit';
import Child from './components/Child.js';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Child,
    },
  };
}

const app = new App(document.body);
app.$on('get:children', ({ detail: [children] }) => {
  console.log(children); // { Child: [Child,...] }
});
```
