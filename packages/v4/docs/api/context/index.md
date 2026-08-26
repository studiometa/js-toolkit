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
// @twoslash-cache: {"v":1,"hash":"2b957c7c0eac9a01c1d9bf452acdc14f26704889c27a0932af19e2aadaa1f80e","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACAZWYEtY5KnDStSDRADYqzGGADmafEmnUx8mBJC8BZSiH5hciAAxVG+Ma0Y1yUgL4V02YwWJ6qNengAUrfuwAlJws7FwAQuwwADwAKpx0NGBQEVEACqQQWFwAvJyRcDAZWXAAfAA6YHwAtlgQ4vlR+iJiEgBMAIwycorKiAAsnuqaeAW4MnxGSGYgFlY2eoidjs44eIQkQtSJvliZOOIYwTqCAHSMEGAAZnzyiJzAlZzPnGCs1TD3IqST8gDclXszVE4iQAGYAOzdBRKFRDUgaLQXa63fSGYxdWaWUjWWxIACcK2oLnW7i2Xi0Pj2WTImGCbw+XzQPwUwNaSH6AA5ob0OfDEXgGeMDJMMeZsbjFm0TETMGtEG5NvoKbt9rSjjx+GdWFg+PdHmAXpwWjR7txbm9mNEDUajZNYLR7mAAK7VABGZABhttzzQEFEzCdro9pC9RvspTDL3kEAAcol7j5gjlSpwiBABF6gcIQRJJPiebDEGD+SMFTq+GjReDxfM8UtZSSFRsPNtvAqfB8lNBgmNomNitlSqcACTUoi6a1PF4mz48C3+Kfen32uhB92e6c+v0B9chqPPCMHzgx+P0RPJ1PpzOA0o+ADWMAw9wAwpcKQBpJ9Lo2zs0Lq0bR9ThV0dV5g03ZdbR3fw90g8NIy3E84wTTgk04FM0wzKAs1KCg038Z05yA54/3neRLR/YDQLg0MkKNGDA3Ajc6Kgo8kNPVD0Mw68cMBQJ9SQsjzQoxcSNtGjmP3eiXkY2jj3YqDOPPNDLywm8wGzEAoAgRgEAVYoJ1gThWAI5giLTMg3VYNAak4P17PwGBjWdN1mRgZyrnqEyuGYS55B8xznJgWQPjANBOH4Eg4FOSpYic14YDEeAIvHXRSE4AB3SYYsqOKErSwRjT4NAuEuIKElCuQ0HwyAIvKpRnOqCBnXCkIMBYGB8LgCAQIi1gwDgTKyDgSolEyZ15HwBJNgwThWua1r+uSThFvC05OFjf18F+ThSBCpLCi4EqEjEZhnxMkIIFqS5qsqTLCEKThYFCHFbPKvguGypQoBxTLDUfGBsk4QrdqWvhmD6rgDrCiKY3gU42VBRBORmWQYT6bk1ARMsQDHTIjOFdEayxOtFg6MFG3lRVWxVBVkRETV0rfcLUJZz9vxOMgAEFdVKJGJE5AsDB6IsKdLLQudIdmdgmKZi1rHEFjsNo2ip1wW3JHYO2pA46WNURTXIyjxMkl0WOPOSpMgiMBaQDoOjR0W+gAVglvBZyreXBlJpX636dXSSVTxtZAPwAjgYI4AAqjnjNiDWIY/1YOt1iIx8SYSr4fwADVCOIpD44tpCrfN6TNIE42xML5I11Ty3k6YsubYqKoboaaPROYfQdL0vAX32mznNMwebD4EgzKI2KwEqAB1H4aC4Qo0DQWRjQwMALEySBnTgc6Nu5vaPPCnE2syhfnLgZ0DkKWAuEakJnVIfa2tgKKyAwbresgFy3TgRgfghk4BAP+ZBoomUNBAZgRUiD5xMlcWwl0jDDQyrdRGOZ2SIAdlCEWGM4TYwFAqTulovbGB9nMP25MOiB2bGSZUocqRqkOMEIuIY7ZYLaKodGvJEBuwIbjUCpC+S+0lCrGUThiTU01vQ9sYddbqmCKXBO7CKZcOdkgPhIJCHUEbkIgYitRHgnEasDWdCQ6yMYTSZhyEzxoAvBhK82EVH5kLH0VQWjcbKQYHLYwfCKGGIGPYAAuuYaArhQgcCZkVRIcgUiNCekBE0fBGBXRRAFPIwBXjvDnAAciljkzg9gvTTgrBhRyn1RyFRgD4KWMt6D4XEmRYh/gfCZMkmYeyjd7gmEKYEfCAB6fpWVLARTmAoeAHEUIqW4qmYAjhOCDOGTZS6yJmRQJCANK61RqgDSgNOewgQsz6C7KwJAoAYmDT4JcPApUQD2HsEAA=="}
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
