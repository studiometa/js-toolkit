# Services hooks

## `scrolled`

Called when the user is scrolling.

**Arguments**

- `props` (`ScrollServiceProps`): The [scroll service props](/api/services/useScroll.html#props).

**Example**

```js twoslash
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  scrolled(props) {
    this.$log('scrolling', props);
  }
}
```

:::tip Tip
See the [`useScroll` service](/api/services/useScroll.html) for more details.
:::

## `resized`

Called when the document has been resized.

**Arguments**

- `props` (`ResizeServiceProps`): The [resize service props](/api/services/useResize.html#props).

**Example**

```js twoslash
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  resized(props) {
    this.$log('resized', props);
  }
}
```

:::tip Tip
See the [`useResize` service](/api/services/useResize.html) for more details.
:::

## `keyed`

Called when the user is typing.

**Arguments**

- `props` (`KeyServiceProps`): The [key service props](/api/services/useKey.html#props).

**Example**

```js twoslash
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  keyed(props) {
    this.$log('keyed', props);
  }
}
```

:::tip Tip
See the [`useKey` service](/api/services/useKey.html) for more details.
:::

## `moved`

Called when the user is moving their cursor.

**Arguments**

- `props` (`PointerServiceProps`): The [pointer service props](/api/services/usePointer.html#props).

**Example**

```js twoslash
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  moved(props) {
    this.$log('moved', props);
  }
}
```

:::tip Tip
See the [`usePointer` service](/api/services/usePointer.html) for more details.
:::

## `ticked`

Executed on every frame with `requestAnimationFrame`.

**Arguments**

- `props` (`RafServiceProps`): The [raf service props](/api/services/useRaf.html#props).

**Example**

```js twoslash
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  ticked(props) {
    this.$log('ticked', props);
  }
}
```

:::tip Tip
See the [`useRaf` service](/api/services/useRaf.html) for more details.
:::
