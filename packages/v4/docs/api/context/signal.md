# signal

```ts
signal<T>(initialValue: T): Signal<T>
```

A reactive value. The accessor is `.value`.

```ts
interface Signal<T = unknown> {
  value: T;
  subscribe(callback: (value: T) => void, options?: { immediate?: boolean }): () => void;
}
```

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"38b47f286972f1a87179f3dca19535cc14f9e6155e020b6c24fb9e7dac70f70a","data":"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="}
import { signal } from '@studiometa/js-toolkit-v4';

const count = signal(0);

const unsubscribe = count.subscribe((value) => console.log(value), { immediate: true });

count.value = 1;
count.value += 1;

unsubscribe();
```

**Parameters**

- `initialValue` (`T`).

**Return value**

- `Signal<T>`. `subscribe()` returns the unsubscribe function.

## A write settles synchronously, and the newest value wins

The delivery loop re-reads the value after each callback. If the value moved, the loop **abandons the round and starts again on the new value**, so a subscriber that was not reached yet skips the old value entirely.

Delivery stays in the same task. There is no batching and no microtask.

::: danger A subscriber that writes on every delivery live-locks the loop
Each write restarts the round, so the loop never finishes. Guard the write, or move it out of the subscriber.
:::

## It is a factory over a closure

There is no class and no proxy. `signal()` closes over the value and a subscriber set, which is why it is the right thing to _provide_: the value crossing a context boundary is the signal itself, and the type of the key says so.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"a371c441e67a5fc1e083983906238c361f8d919aaa452e14229a651b58244796","data":"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="}
import { Base, createContext, signal, type Signal } from '@studiometa/js-toolkit-v4';

const CountContext = createContext<Signal<number>>('count');
// ---cut---
class Counter extends Base {
  static config = { name: 'Counter' };

  count = this.$provide(CountContext, signal(0));

  increment() {
    this.count.value += 1;
  }
}

class CounterOutput extends Base {
  static config = { name: 'CounterOutput' };

  async mounted() {
    const count = await this.$inject(CountContext);
    return count.subscribe((value) => {
      this.$el.textContent = String(value);
    });
  }
}
```

## Failures

A subscriber that throws is isolated and reported as `callback.signal-failed`, so one subscriber cannot stop the others.

## `toggle()` works on it

[`toggle(subscribe)`](/api/services/toggle.html) takes anything that returns its own unsubscribe function, a `Signal` included.
