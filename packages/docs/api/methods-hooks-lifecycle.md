# Lifecycle hooks

## `mounted`

Called after the instance has been mounted.

**Arguments**

> This method has no argument.

**Example**

```js {9-12}
import Base from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    // Logs 'mounted' when the component is mounted
    this.$log('mounted');
  }
}
```

## `updated`

Called after the instance has been updated.

**Arguments**

> This method has no argument.

**Example**

```js {9-12}
import Base from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  updated() {
    // Logs 'updated' when the component is updated
    this.$log('updated');
  }
}
```

## `destroyed`

Called when the component is being destroyed.

**Arguments**

> This method has no argument.

**Example**

```js {9-12}
import Base from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  destroyed() {
    // Logs 'destroyed' when the component is destroyed
    this.$log('destroyed');
  }
}
```

## `terminated`

Called when the component is being terminated.

**Arguments**

> This method has no argument.

**Example**

```js {9-12}
import Base from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  terminated() {
    // Logs 'terminated' when the component is terminated
    this.$log('terminated');
  }
}
```
