# @read and @write

```ts
read: (value: VoidMethod, context: ClassMethodDecoratorContext) => VoidMethod;
write: (value: VoidMethod, context: ClassMethodDecoratorContext) => VoidMethod;
```

Runs the method body in the frame's `read` or `write` phase, cancelled on unmount. They are sugar over [`$read()`](/api/instance-methods.html#read-and-write) and `$write()`.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"2cf63509c775468b51c64aafaeda7b5ca878b3e92f71db5d50c713ef981a9420","data":"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"}
import { Base, component, read, write } from '@studiometa/js-toolkit-v4';

@component({ name: 'Measure' })
class Measure extends Base {
  #height = 0;

  @read
  measure() {
    this.#height = this.$el.scrollHeight;
  }

  @write
  apply() {
    this.$el.style.setProperty('--height', `${this.#height}px`);
  }
}
```

Every read runs before every write, once, before paint. A `read` scheduled from a `write` runs in the **next** frame; a `write` scheduled from a `read` runs in the **same** frame.

## They are leaf-method sugar: the phase belongs to the call site

::: warning Decorate a method nobody overrides
A phase decorator returns a wrapper around the method it decorates, and that wrapper is a property of **that class**. A subclass that overrides the method defines its own, undecorated, and `this.method()` resolves to it — so the base's scheduling disappears and the body runs in whatever phase the caller was in.
:::

A **template method** — a base that schedules work its subclasses implement — schedules at the call site instead:

```js
// in the base, where the call is
state.subscribe((value) => this.$write(() => this.update(value)));
```

The alternative, dispatching a decorated method through something a subclass cannot replace, was refused: it would make a decorator's behaviour depend on inheritance depth, which nothing else in v4 does, to buy a convenience no consumer has asked for.

## Stacking with `@on`

The skip is keyed by the method name, so the two stack in either order — and **the order decides what the listener calls**:

| Written                   | Schedules               |
| ------------------------- | ----------------------- |
| `@on(...)` above `@write` | the body of the handler |
| `@write` above `@on(...)` | direct calls only       |

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"b3f24cb19d5b3e10809507306463045430c7ffca028e372832f9771a9f519be6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCAFssEMDDBpGgsADN2Ac0S8AQlxgBhMfIXdlAHgAqvOjTBQ4q9VrBw0pAK780EUgD5GRNg5jLDFATEaemUNVi44ABEYQVJmF1IbYLQjNz4AXjdeIgh2KAAdMHYRVzRAkvFJShAoCH4ERBAAZRgytHwYctFKspkdXmZzXlIYBXY7Ml52zv5wuEsAdw6wXnYy8d5YeXEoADpqtGYFBuRkEA4wAGtq/DQ0LDhEAHongCs4AFoXCFZLtY+iAAWXZ2BxQdjCVrMXawIhPZhYdhPWCxeKuOBPQQVCRoXa3ISsEAAXSJVDszFIDEQAEYqKwJAp2kgAJxUQ6kBStPBY7o46oXXCIAAMVH4+ApzGcZCQ1IAvhR0NhBQRiNK2aYmFhSBAcJSMHw1HBNNpFLswMwhL5eHZSOwwApquTKTKAMx0hlMxCAtkUzlU8AW3B0u2CkUgMUSqXkGku+WKnB4Qgkcjq+jcuaWaJCCCO9lUl0AVnd9s93uovq5jSzOeD4hlovFcSjSAAbHHqErE6qU9QNY0WBwuHxZhErEajCZ6BILGOYAAFbUPXjpWcLnVwNyFYqiSmz6q1ep4QwdAQZkzJjBdMQ4ydmCz7H3HJCnc5265UW73R4vd5fCA/P40ABYFQXBSFDhhGA4QRJFiVJEAnSpQEAA5i0ZfAkDLdk/TwQ0g1fOsaQbSMaGjalmXbTAE0aJM1V7NN+zYTgeF4MR9HycMOH4S4OI8KirQ42Z2G4ji9F4Ix8HGDwvFYHxlEYdpxj8SS4ACKCcWUOdckkMgAFESEkDIshyPIAhkZJQgzABZVpCCgaJUQSJJTAk8YAgUlTlLc88NN4LS7VI/ScSM7JcigNJl2MsLeEYABqAtWOTVgIGYCxuC3EpdzEfc6gaEAHNceJOmYXhLXaaABksQYfMkXhxXMelSF2QoAHlxGtew7QUXgACM7Rnar1NqsQphPHlr1q7UIFxXgAEEOtte0BiGIa2iVXr+oGARJNYKBWNIYYYFkZqwHm8aelPUc+vMSx2nibb2F2qYlV2XgAAMFn6iAFje5a9reg8HEtSRfuuvaFGSnq2BqtA4AfcsnxQM4LnfAg7geZ43k+b5fn+IEQTQMEITK6FYXhRFkRiQqEgxMQ8TQAk4LJPMkALVDzg9DDEAAJh9DlKxAbLa0FXnw0bSVSKQWMFQ7aiVWTA4+xAAdmOHMQ7F4BZbRoAxjw2Uxp0sPCAlmjlLANm7eAcK5IAWMBkCJaTvCtAA1MKbPKqBXNUuazbcAIAH1zNMSyIg9uyCriJyghcvWfbdvJw+gb2Tb9iLMl4BOoCTr249T45NyKTKyi1tZ8IPPKmjFGAoAcelRs6Mq7N66BLztBveHEehNe1zosHFI1XuiG0nDQCEVn4QZ+BgVhLBwcwus11xLnhw5EZfFGbnR78sb/AC8ZAwmwJJyDoIplFqfRJ4RlSj5S5oenGZJZmKSpAB2N0OZLLmi3Lfn/XvvhAUUtiJNklogaW8ZlS0R7MkJgTdoB8GrLsLAzAAqMDEiZKAuZX5IGQrSL+6FWZ8xwo0VBAV+QhkwqAiW0oeayngoIWAeAAAC50cSMGAJ3QMygADk1ZeG8FlOlMAI55i8GrLeQ2s5eDAEKLwXgLCxCMF4UJbivCREKJYYA+RvByGSAwbI2UhRZTVBJkgUAFs4DjzwLDEAspZRAA"}
import { Base, component, on, write } from '@studiometa/js-toolkit-v4';
// ---cut---
@component({ name: 'Demo' })
class Demo extends Base {
  @on('click')
  @write
  paint() {}
}
```

**Write `@read` and `@write` closest to the method body.**

## The function form

```js twoslash
// @twoslash-cache: {"v":1,"hash":"0ac8fccd8153127471cb0125bd28968c78a03e0addf993186cfa2865ed6aee75","data":"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="}
import { Base } from '@studiometa/js-toolkit-v4';

class Measure extends Base {
  static config = { name: 'Measure' };

  #height = 0;

  measure() {
    return this.$read(() => {
      this.#height = this.$el.scrollHeight;
    });
  }

  apply() {
    return this.$write(() => {
      this.$el.style.setProperty('--height', `${this.#height}px`);
    });
  }
}
```

The function form also gives you the [`ScheduledTask`](/api/scheduler/defaultScheduler.html) handle — its promise and its `cancel()` — which the decorator discards.
