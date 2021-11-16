# Services hooks

## `scrolled`

Called when the user is scrolling.

**Arguments**

- `props` (`ScrollServiceProps`): The [scroll service props](/api/services/useScroll.html#props).

**Example**

```js
export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  scrolled({ x, y, changed, last, delta, progress, max, direction }) {
    this.$log('Scrolling');
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

```js
export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  resized({ width, height, ratio, orientation, breakpoint, breakpoints }) {
    this.$log('Resized');
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

```js
export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  keyed({
    event,
    direction,
    isUp,
    isDown,
    triggered,
    ENTER,
    SPACE,
    TAB,
    ESC,
    LEFT,
    UP,
    RIGHT,
    DOWN,
  }) {
    this.$log('Keyed');
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

```js
export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  moved({ event, isDown, x, y, changed, last, delta, progress, max }) {
    this.$log('Moved');
  }
}
```

:::tip Tip
See the [`usePointer` service](/api/services/usePointer.html) for more details.
:::

## `ticked`

Creates a render loop with `requestAnimationFrame`.

**Arguments**

- `props` (`RafServiceProps`): The [raf service props](/api/services/useRaf.html#props).

**Example**

```js
export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  ticked({ time }) {
    this.$log('Ticked');
  }
}
```

:::tip Tip
See the [`useRaf` service](/api/services/useRaf.html) for more details.
:::

## `loaded`

Called when the page is loaded.

**Arguments**

The [raf service](/api/services/useRaf.html#props) does not have any props.

**Example**

```js
export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  loaded() {
    this.$log('Loaded');
  }
}
```

:::tip Tip
See the [`useLoad` service](/api/services/useLoad.html) for more details.
:::
