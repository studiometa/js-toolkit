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
// @twoslash-cache: {"v":1,"hash":"b3f24cb19d5b3e10809507306463045430c7ffca028e372832f9771a9f519be6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCAFssEMDDBpGgsADN2Ac0S8AQlxgBhMfIXdlAHgAqvOjTBQ4q9VrBw0pAK780EUgD5GRNg5jLDFATEaemUNVi44ABEYQVJmF1IbYLQjNz4AXjdeIgh2KAAdMHYRVzRAkvFJShAoCH4ERBAAZRgytHwYctFKspkdXmZzXlIYBXY7Ml52zv5wuEsAdw6wXnYy8d5YeXEoADpqu2ZSBkQARipWCQV2pABOKjQjhVa8QQqJBgv2cSQABip+PgjsxnGQkKcAL4UdDYXCNQgkcgPUxMLCkCA4Y4YPhqOCabSKXZgZhCXy8Oykb4KA6PY7ggDMFyuN0QABYHk8Xo1iaTqhwfoh/iBAcDQeQzvSoTCcHgEWDkfRXnNLNEhBAaUcTvSAKxMsDXfBIdnUTknECq9VfAXnYVAuJipAANil1FhsuI8uoKMaLA4XD4swiVjxRhM9AkFmDMAACuisJZ0lHYxi4G5CsVRMcoxq6WyABx6g1GjmkZ5m3G4K1wm0i+00cWnW4uzAy+EepFexU+ticHi8MT6fLCjj8ADWQ48LbJQ9m7DHQ70vCM+HGHi8rB8ykY7XGfhXcACMBIkmU0dykjIAFFj2gMlkcnkAjJkqFlQBZVqEKDRWLxVxJUxl3GAJt33PdgJMG9T3Petrw+O9slyKA0l4TJELyXhGAAam1ftEVYCBmAsbh0xKLMxGqWp6jwH9XHiTpmF4Ul2mgAZLEGSCPl4IFzEuUhdkKAB5cRyXsKleAAI2+SMOKPLixCmDoujELj0QgNBdl4ABBUTKX1AYhjkyQplhSTpIGAQV1YKB+1IYYYFkASwB0t5ui4wN5jM8xLHaeJLPYayTJwTSAAMFmkiAFhCgybJCqiHFJSRoqkoYFAIiS2E4yQ4H2KhDlzbUCxAS59RZAAmEsyzwCiqyQCrbVFeskElaFXVbAh22qZImB7f1AlsMoFkpGgDEMfcwzMSMKwCLTS0sUwI0sBwwFHSAFjAZAAF0128MkADUkI/FioCAg9tLmtwAgAfWfUxXwiI6v1ouIEgA+hToCA68ke6APvOhRUxQtCvqgH6TrGiDZoBtMijIwbhsrGo6gaZpARgKAHEuRTOmYr9JOgDBVhWaZeHEeheCGtZOiwIE8U06IKScNB2AU/hBn4GBWEsHBzHEhZXFHXKQHyk4AHZGWK5lDUQXUTVLLkQEpmg+W+OEJdrEEmsQFrpThDrES670QEYXHoD4C1diwZhvikRcHygHMTjzG0SqLGXKoVq2bZVgVjQ1h1EDKiFNoBaA9YAAVclTJEYYBSZJMkAHILUT3gIRIsAPJVGA1Qmxao14YBCl4Xhw7ERhE9nMdE4zkvw6VmBi94L2Y74YAIUKCFqmY5gkFABbbBZsA8DQBAIQhIA"}
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
