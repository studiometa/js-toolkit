# registerComponents

```ts
registerComponents(...classes: BaseConstructor[]): void
```

[`registerComponent()`](./registerComponent.html) for several classes, in order.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c8577c8441403d73c9e5bad62aad5d584c0063749230e4add09379f333fe62bb","data":"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="}
import { Base, registerComponents } from '@studiometa/js-toolkit';

class Accordion extends Base {
  static config = { name: 'Accordion' };
}
class Slider extends Base {
  static config = { name: 'Slider' };
}
class TodoList extends Base {
  static config = { name: 'TodoList' };
}

registerComponents(Accordion, Slider, TodoList);
```

This is the whole bootstrap of a page. There is no `createApp()` and no root component: each of these registers its own declared family, and every registered name auto-mounts through the single MutationObserver.

**Parameters**

- `...classes` — classes extending `Base`.

**Return value**

- `void`.

Order matters only for collisions: the first registration of a name wins and the second gives a `registry.conflict` warning.
