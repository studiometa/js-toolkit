# provideContext

```ts
provideContext<T>(el: Element, key: ContextKey<T>, value: T): { value: T; dispose: () => void }
```

Provides a value to the subtree of `el`.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"4cbc4d0b5f6bd3c2e8f041876704ef3af340888ca1a8a826e458902068ac81e0","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAiIEMAbAVxiJ2YPgFsARmUog2XUg0QAOKjxhgA5mnxIArFTRz1MBSG79cKgJZhciAAxVG+OV0Y1ySgL4V02WwWIpfToTZlYOKEs4LAg4QXYACgBKdgBeAD5OCEsoaVl5JABGPRBVDS0kAHZ9Q2M8SOjYi1LrWwcQJxc3KURi718cPEIScmD6PATeSy44FKxSYhyYAGEWGnoAHhEJMnSEmB4hAFFVUTU0CnYAaxgMIVWwdbQAaVutsUlSdMuzASFtz5JITAAA6YHYEM4vD+wg+ZAA3GDIewGjE4kJkmlMkRslBEWBPGDLKIYvJ2PNFrAHk9pFAIIwEIgQAAFBZEJbsLhQ8ycMjiLhoYnsABmEFInPYcD44jQpBgMAAdOwACr4GDCGByeAcCns2DigDu1jgCryBgKiAATNVSmpNNpegAWGqkIwmXVLakhaQ8VpIdqdUiudxIa39ah+IaBUbUb1MsJsdgHIQACWVAFkADInGBnR5muQKR2WlR2ipWl1uvAHH1++yOZxB7oeYvhzCDJnDIKx8bxliJ153dhe+iD947L4Fi2OgBspfKDoAzJW6kzB7WbP6G10Q4hZ54ALqOaD+BMcYDcgSXVFNdieNLktmetYhfY8S6Dy7FpLw6RnAxIKAIRqHAlgsHgaAIJ4nhAA="}
import { createContext, provideContext } from '@studiometa/js-toolkit-v4';

const Key = createContext<number>('answer');
const el = document.body;
// ---cut---
const { value, dispose } = provideContext(el, Key, 42);
```

**Parameters**

- `el` — the element that owns the scope.
- `key` — a [`ContextKey`](./createContext.html).
- `value` — provided **as it is**. Nothing is wrapped.

**Return value**

- `value` — the value, so the call can be an expression.
- `dispose` — stops answering for this key on this element.

## From a component

`$provide()` is the same call with the element filled in, and it returns the value directly so it reads as a field initializer:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"c69b1959a8bf186bc1c5aeaa807f33ad83f1db4539f8fe34d53285c938ec43aa","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACAYQgFcwNclThpWpBogBsVZjDABzNPiQB2KmNIKYkkLwFDKIZgEswuRAAYqjfONaND0gL4V02CwWJkjNengAKVlN2AEpOFnYuACF2GAAeABVOOhowKBi4gAVSCCwuAF5OWLgYHLy4AD4AHTATAFssCAliuKNRcUkAJi7ZeSUVRAAWDXFtXRLcWTMLaxBbe0cfRB7Xdxw8QhJhalTArFycCQxw/UEyADpGCDAAMxMFRE5gWs43zjBWepgn0VIzBQAblqznamkkAGYABx9RTKJAyahjHRMG73BRGUzmJAARhsdlIDicAE41tQPJtvDs/LoAgc8mRMOFPt9fmh/oowZ0kENibCBjzRloUYhwF8psYZrj8YsnF1LGTMBtRVsfBo9qK6YdGScePxzqQrvq0E8AMoPT7MeJgPj1ABGZEqXIkajxxn68MQAFYheNUQZMVLEBCZYSluQVoqKSqqb4NSAAt9lNBwpN4pNyvlKhcACT0ogmWDxc0KS3W20O0iVSoBADWMAwT1453oAGkG8WLcFy/bHZUKJwiME+D9OCWyzbe1XQmau1bJ5WnVQoBBGAhReUC7BOKxB8OYIOyHbWGgGpw0BBz/gD3A+Hb2TAD7dmjuuMwbgpX1eDzA5N9BJwpgkHAFy1Ik14fDA4jwGgnD5oWZCcAA7mYIG1GBEHwbApCcHAJhoFwNzfikf7yGgA6QLBRHKAe9TGhEGAsDAA5wJe+E7mAcBIWQcC1MouR8Ao+ApNsGCcAIdEGBxUCcJJggXJwAByEDKACnCkL+UGlFw7FQaQzCNjuEQQI0NxkbUSGEKUnCwJEhKnkRJhcChyhQISSFgJw9YwPkcG5FuakGCYzCcPhXCaf+sEKBA8AXM6khQiM7pwoMMJIsKuh5v5CGBtiwahkSyw4l6UbKl42xxv4orXJxsFnGgzY0k2Nw0u2GCdqW3YLn28VIMSIbJQKiA4r06V+qK9WNXs0x5QNCxhnKQylZ4qrUvGQQhHA4R4Z184Vo6ARmPhJjBAAavuTzdaQM5jnOPaLrUDRNC0O2WkYK5rng3AaSeB67j9jgmCQe7MCOoFgLUADq/w0FwpRoGgci4RgYC2LkkB8HABkKQAgupj6CISAFITDN58EcpSwFwNERHwpAaQBsBAWQGAsZekC4XecCMP8lacBAdqlKQwEcfzzDYSDI47rcQhGeY3E4WZcUiOCuKWOog2eoimjjSAr3BLlFhzQShURtCzgALo2NAniRBweoGIhqTyBkrTWS8nm4WIp6MMZdwPJwRTAB84pPAA5PVZBh5wzjAhDnvXFJRSqSBWXEAhASTS1qQsXOASWKEoRx6CVBJqwSCgM7nEmDceAESAzjOEAA==="}
import { Base, createContext, signal, type Signal } from '@studiometa/js-toolkit-v4';

const CountContext = createContext<Signal<number>>('count');
// ---cut---
class Counter extends Base {
  static config = { name: 'Counter' };

  count = this.$provide(CountContext, signal(0));
}
```

::: tip `$provide()` is instance-scoped
It is never released, and it dies with the instance or its element. A component whose declaration is withdrawn keeps providing until its element goes — which is why the call belongs in the constructor or a field initializer, not in `mounted()`.
:::

## Nearest wins

The scope is the subtree, and a nearer provider shadows a further one by answering first and stopping propagation.

## It replays pending requests

A consumer that asked before any provider existed has a pending request with no first answer. `provideContext()` **replays those requests**, which is what makes mount order irrelevant: a child that mounts before its coordinator still gets its answer when the coordinator arrives.

Only a **mounted** provider answers.

## Page-wide

For state that belongs to the page rather than to a subtree, use [`provideRootContext()`](./provideRootContext.html).
