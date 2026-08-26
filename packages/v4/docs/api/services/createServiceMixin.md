# createServiceMixin

```ts
createServiceMixin<Instance, Target, Options extends object = object>(
  definition: ServiceMixinDefinition<Target, Options>,
): ServiceMixin<Instance, Target, Options>
```

Builds the mixin-and-decorator pair over a service. Every built-in `with*` is one of these.

## The definition

```ts
interface ServiceMixinDefinition<Target, Options> {
  hook: string;
  target: (instance: Base) => Target;
  defaultImmediate?: boolean;
  use: (target: Target, options: Options) => Service<unknown, unknown>;
  handleResult?: (instance: Base, result: unknown) => void;
}
```

| Field              | Does                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| `hook`             | the one method name the service owns                                      |
| `target`           | the default target resolver                                               |
| `defaultImmediate` | whether the first delivery is asked for unless the caller says otherwise  |
| `use`              | calls the service factory                                                 |
| `handleResult`     | does something with what the hook returned — `withRaf` schedules a render |

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"c870bda746deb1a1415992ceccc0639903fe6278afbbbf6af2bfbc4ecea94485","data":"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"}
import { createService, createServiceMixin, perTarget } from '@studiometa/js-toolkit-v4';

interface FocusProps {
  readonly hasFocus: boolean;
}
const useFocus = perTarget((target: Element) =>
  createService<FocusProps>({
    props: () => ({ hasFocus: target.contains(document.activeElement) }),
    start: () => () => {},
  }),
);
// ---cut---
interface FocusHook {
  focused?(props: FocusProps): void;
}

export const withFocus = createServiceMixin<FocusHook, Element>({
  hook: 'focused',
  target: (instance) => instance.$el,
  use: (target) => useFocus(target),
});
```

```js
class Field extends withFocus(Base) {
  focused({ hasFocus }) {}
}
```

## `use` receives the service's options only

`target`, `manual` and `immediate` are removed before `use` is called and they are absent from its `Options` type — which is why `use: (target, options) => useDrag(target, options)` is correct and needs no filtering.

## Override `$mount()`, not `mounted()`

`createServiceMixin()` overrides `$mount()` and `$unmount()`, which is what lets a component write its own `mounted()` without `super.mounted()` and still subscribe.

**The rule is about what a mixin overrides, not who wrote it.** A userland mixin that puts its work in `mounted()` needs its subclasses to call `super.mounted()`. The way not to need that is to override `$mount()` — or to use this function, which already does.

## What it gives the class

- the hook, bound for each mount cycle;
- `$services.<hook>` as a [`Toggle`](./toggle.html), typed through `ServiceHandles<'<hook>'>`;
- the two call forms, mixin and class decorator;
- the `service.missing-target` check on a caller-supplied resolver.

## One hook per class

A mixin names one hook and binds one subscription per cycle. That is its limit, and a component with a dynamic set of subscriptions calls `subscribe()` itself. See [Mixins](./mixins.html).
