# Shared state

provide/inject in core, with the shape of Vue and the mechanics of the WICG context protocol.

[[toc]]

## The functions

| Function                                                       | Does                                          |
| -------------------------------------------------------------- | --------------------------------------------- |
| [`createContext(description?)`](./createContext.html)          | a typed key                                   |
| [`signal(initialValue)`](./signal.html)                        | a reactive value                              |
| [`provideContext(el, key, value)`](./provideContext.html)      | provide on an element                         |
| [`provideRootContext(key, create)`](./provideRootContext.html) | provide page-wide, created at most once       |
| [`injectContext(el, key)`](./injectContext.html)               | a promise for the nearest value               |
| [`injectContextSync(el, key)`](./injectContextSync.html)       | the nearest value, or `undefined`             |
| [`subscribeContext(el, key, cb)`](./subscribeContext.html)     | every answer, as providers come and go        |
| [`createGroup()`](./createGroup.html)                          | a membership set with a reactive members list |

From inside a component, `$provide()`, `$inject()` and `$injectSync()` are the same three, with the element filled in. The [`@provide`](/api/decorators/provide.html) and [`@inject`](/api/decorators/inject.html) decorators are field sugar over them.

## The model

- **The injection key is typed**, so strings cannot collide.
- **The scope is the subtree**, and the nearest provider wins.
- **The value is provided as it is.** Nothing is wrapped, so the type of the key is the contract from end to end. A reactive value is a provided `Signal`. A command surface is a provided object.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"2b957c7c0eac9a01c1d9bf452acdc14f26704889c27a0932af19e2aadaa1f80e","data":"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"}
import { Base, createContext, signal, type Signal } from '@studiometa/js-toolkit-v4';

interface SliderApi {
  state: Signal<{ index: number; total: number }>;
  goNext(): void;
}
const SliderContext = createContext<SliderApi>('slider');
// ---cut---
class Slider extends Base {
  static config = { name: 'Slider' };

  api = this.$provide(SliderContext, {
    state: signal({ index: 0, total: 0 }), // what changes
    goNext: () => {}, // what a control can command
  });
}
```

## Two ways to ask

| Form               | Resolves                          | When nothing provides                                 |
| ------------------ | --------------------------------- | ----------------------------------------------------- |
| `$inject(key)`     | a promise, awaited in `mounted()` | it never settles: a missing provider means "not yet". |
| `$injectSync(key)` | the value, synchronously          | `undefined`: the caller falls back or does nothing.   |

The pending request of the async form is **unmount-scoped**. A new mount runs `mounted()` again and asks again. The `@inject` field decorator asks once, at construction; a consumer that can wait through several cycles calls `$inject()` from `mounted()`.

## The mechanics

The consumer dispatches a bubbling, **module-private** `js-toolkit:context:request` event carrying a key, a callback and a subscription marker. It is deliberately not part of public `EVENTS`.

The nearest **mounted** provider answers and stops propagation. `provideContext()` replays the requests that have no first answer yet, which is what makes mount order irrelevant. `injectContext()` and `$inject()` are one-shot.

Duplicate bundles share the basic provider and pending-request state through the `context` shared-runtime slot at schema revision 2. The optional owner map, weak index and listener flag use the `context-subscription` slot at revision 1 — and `context.ts` and the `Base` graph import none of that optional state.

## Scopes

`$provide()` in a field initializer is **instance-scoped**: it is never released and dies with the element. A component whose declaration is withdrawn keeps providing until its element goes.

A **root** provider cannot be disposed and it outlives the instance that asked first, because it is page state. `withGroup` is not ported.

## Read next

[Shared state](/guide/going-further/sharing-state.html) walks the whole pattern, from a coordinator's provided API to a member joining the nearest group.
