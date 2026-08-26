# @read and @write

```ts
read: (value: VoidMethod, context: ClassMethodDecoratorContext) => VoidMethod;
write: (value: VoidMethod, context: ClassMethodDecoratorContext) => VoidMethod;
```

Runs the method body in the frame's `read` or `write` phase, cancelled on unmount. They are sugar over [`$read()`](/api/instance-methods.html#read-and-write) and `$write()`.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"cd7d9c008ffb04863950b2f03279658c6f16c32ec2dc67fae2420c646f901053","data":"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"}
import { Base, component, read, write } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"08c88fe18728929292e1e9b564dbc5a9c8d4f2b263a4dab2c3404a20c79654da","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCAFssEMDDBpGgsADN2Ac0S8AQlxgBhMfIXdlAHgAqvOjTBQ4q9VrBw0pAK780EUgD5GRNg5jLDFATEaemUNVi44ABEYQVJmF1IbYLQjNz4AXjdeIgh2KAAdMHYRVzRAkvFJShAoCH4ERBAAZRgytHwYctFKspkdXmZzXlIYBXY7Ml52zv5wuEsAdw6wXnYy8d5YeXEoADpqtGYFBuRkEA4wAGtq/DQ0LDhEAHongCs4AFoXCFZLtY+iAAWXZ2BxQdjCVrMXawIhPZhYdhPWCxeKuOBPQQVCRoXa3ISsEAAXSJVDszFIDEQAEYqKwJAp2kgAJxUQ6kBStPBY7o46oXXCIAAMVH4+ApzGcZCQ1IAvhR0NhBQRiNK2aYmFhSBAcJSMHw1HBNNpFLswMwhL5eHZSOwwApquTKTKAMx0hlMxCAtkUzlU8AW3B0u2CkUgMUSqXkGku+WKnB4Qgkcjq+jcuaWaJCCCO9lUl0AVnd9s93uovq5jSzOeD4hlovFcSjSAAbHHqErE6qU9QNY0WBwuHxZhErEajCZ6BILGOYAAFbUPXjpWcLnVwNyFYqiSmz6q1ep4QwdAQZkzJjBdMQ4ydmCz7H3HJCnc5265UW73R4vd5fCA/P40ABYFQXBSFDhhGA4QRJFiVJEAnSpQEAA5i0ZfAkDLdk/TwQ0g1fOsaQbSMaGjalmXbTAE0aJM1V7NN+zYTgeF4MR9HycMOH4S4OI8KirQ42Z2G4ji9F4Ix8HGDwvFYHxlEYdpxj8SS4ACKCcWUOdckkMgAFESEkDIshyPIAhkZJQgzABZVpCCgaJUQSJJTAk8YAgUlTlLc88NN4LS7VI/ScSM7JcigNJl2MsLeEYABqAtWOTVgIGYCxuC3EpdzEfc6gaEAHNceJOmYXhLXaaABksQYfMkXhxXMelSF2QoAHlxGtew7QUXgACM7Rnar1NqsQphPHlr1q7UIFxXgAEEOtte0BiGIa2iVXr+oGARJNYKBWNIYYYFkZqwHm8aelPUc+vMSx2nibb2F2qYlV2XgAAMFn6iAFje5a9reg8HEtSRfuuvaFGSnq2BqtA4AfcsnxQM4LnfAg7geZ43k+b5fn+IEQTQMEITK6FYXhRFkRiQqEgxMQ8TQAk4LJPMkALVDzg9DDEAAJh9DlKxAbLa0FXnw0bSVSKQWMFQ7aiVWTA4+xAAdmOHMQ7F4BZbRoAxjw2Uxp0sPCAlmjlLANm7eAcK5IAWMBkCJaTvCtAA1MKbPKqBXNUuazbcAIAH1zNMSyIg9uyCriJyghcvWfbdvJw+gb2Tb9iLMl4BOoCTr249T45NyKTKyi1tZ8IPPKmjFGAoAcelRs6Mq7N66BLztBveHEehNe1zosHFI1XuiG0nDQCEVn4QZ+BgVhLBwcwus11xLnhw5EZfFGbnR78sb/AC8ZAwmwJJyDoIplFqfRJ4RlSj5S5oenGZJZmKSpAB2N0OZLLmi3Lfn/XvvhAUUtiJNklogaW8ZlS0R7MkJgTdoB8GrLsLAzAAqMDEiZKAuZX5IGQrSL+6FWZ8xwo0VBAV+QhkwqAiW0oeayngoIWAeAAAC50cSMGAJ3QMygADk1ZeG8FlOlMAI55i8GrLeQ2s5eDAEKLwXgLCxCMF4UJbivCREKJYYA+RvByGSAwbI2UhRZTVBJkgUAFs4DjzwLDEAspZRAA"}
import { Base, component, on, write } from '@studiometa/js-toolkit';
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
// @twoslash-cache: {"v":1,"hash":"2051c755a5b06e61e3f87bd2df747a89159d0f3d254a080c3c1646a57e1f674a","data":"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"}
import { Base } from '@studiometa/js-toolkit';

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
