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
