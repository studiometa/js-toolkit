# Events

## Lifecycle events

### `mounted`

Emitted when the instance is mounted.

```js twoslash
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

```js twoslash
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

```js twoslash
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

```js twoslash
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

```js twoslash
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

### `moved`

```js twoslash
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

```js twoslash
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

```js twoslash
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

```js twoslash
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
