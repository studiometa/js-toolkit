# Instance methods

[[toc]]

## `$mount()`

```ts
$mount(): this
```

Starts a mount cycle. On a page the registry calls it; calling it yourself is legitimate but nearly always a sign that a [mount strategy](/guide/going-further/mount-strategies.html) is the answer instead.

## `$unmount()`

```ts
$unmount(): this
```

The reversible opposite of mount. It unbinds the cycle's listeners, runs the `mounted()` cleanups, cancels the instance's scheduled tasks, calls `unmounted()` and announces the change.

**The instance stays on its element**, so `$mount()` can start a new cycle with the same identity.

## `$emit()` {#emit}

```ts
$emit<K extends EmitName<T>>(event: K, ...payload: EmitArgs<T, K>): CustomEvent<EmitDetail<T, K>>
```

Dispatches a bubbling, cancelable `CustomEvent` on `$el`, with the payload as `detail`.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"102500b8b1a4e480a7feb85d058c82ff62998a81a59afcba3a358f1b285dbe5e","data":"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="}
import { Base } from '@studiometa/js-toolkit-v4';

class Dialog extends Base {
  static config = { name: 'Dialog' };

  close() {
    const event = this.$emit('close');
    if (event.defaultPrevented) return;
    this.$el.removeAttribute('data-option-open');
  }

  goto(index) {
    this.$emit('goto', { index });
  }
}
```

- The payload is **one object**, or nothing. An omitted payload leaves `detail` at the platform value `null`.
- A value that is not an object is refused by the type and reported as `event.invalid-emit-payload`. The event still dispatches.
- Nothing in the framework is gated on cancellation.

Declare the names and payloads through the props type's `$emits` key. See [Events](/guide/introduction/working-with-events.html).

## `$on()` {#on}

```ts
$on(type: string, listener: EventListener, options?: AddEventListenerOptions): () => void
```

Adds a listener on `$el` and **returns its own remover**, which makes it a `mounted()` cleanup as it is:

```js
mounted() {
  return this.$on('transitionend', this.handleEnd, { once: true });
}
```

Reach for it when the event name is data rather than a method name, or when you need listener options.

## `$off()`

```ts
$off(type: string, listener: EventListener, options?: AddEventListenerOptions): void
```

## `$query()` {#query}

```ts
$query<T extends Base = Base>(name: string): T[]
```

Every **mounted** instance of `name` among the descendants of `$el`, in document order. A flat array at any depth, not a keyed object.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"144c6974e762968259ceeddf9eeb1d51fa2c2eee46f73913e39b5b5c439295ca","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvADKHLDkVC5u0QCsAOzevgFBiABsYW6R0SBN7C1OHElIAEzpmaTZuUhDRSU4eIQkrdTyTGycPAJCcMoSMnL0vkoO6pravHpxhtpmFta29nFO7XciG6SxAPn8gRCowiUTw/wS80QoIyWRylSRAEYttRSrsKgdqhNGFhnmRMHwpi0AHT8CBgABm7D8iF4wHMvA5vDAzEsMBZLlIiT8AG5zAUAeFogAOKV9CGDEbUMawmK0hlM2aJZIAZmWqPW+WxmB2MT2lTCRxixNJdgwfG5vP5aEF/glHU8XjB/UhiFCSphEwd8TBWqQupAKNWaLyCxSRtxpvxVUtIEYvMC0ApzTIVNI8CijG4LKIEGmbqBGNjcoGSE60PGeDzqgYCOSdYjKzW6IW8ZN5X2yZqqrpLl47BolhZcUk72eJnL0QxwXb4JrvvrKpA45glk1iMVka7eQxnV7ZTNBJTaaihCgfGns6MxipABIAI4AVzIGBn10fn2MRggydF0/CLR5f1UD4TGQABdJwoAgfgEBiABZCAPzAGgoF4WA4H4e5mCwscwHaMACJEAAjDABAgH4kmIoMKBI3gABEAHlUN4WxqQXJAT1lL15Q2DcJnfL9SAwPdkgPTto0WKUzzxAcLSHCMR3sbdJwg/95zaSV+JlasfT9cIGxiLTpKQXoO31dFNmKHE+wvQciRJLQyTtHSDDnZ8XxgVgWQACWkVCABkAFEfF5LC+MQDEPHDVcfXDMzN381grOBPUowNDEsUc41zyTVSiXTW8+CindfDQXMdwqABBNBnXYSiPxoRhPxORkYCgAA5Hk+V4AUhXAksyyoRDkLwaR8BgXgqpi+xyugXgACo1oAAzzSxGuawU2o67hNo23gdoqERAnm5h9ta9r5oAd3HfBeCu4acH4dgepwoNeHpTRLFeua5GimqqXMcxkFQ1i+t4AAlGB6TIXwCNgxh8Ga7REAAemx2ASFYDzSCpXaAC92FYIQqVsPw8aQuBsYAdRgSjsYatQAElscWmrsfOkgmpaw6YG4OKEps5LBhPUTG3qgXbuFrKbMPeT4tPWD0mgMorBsOxWUeXgCj+gHeAAcgAARcD8oHYOiomYbGACs4AAWjQCAIFYABrccXaIYJTdFMBzDqS5GmzUhbgUB44lZdlhtcNB2H4Wj1T8V59eAs3KTIU3DaD+OmwLPg2TATk/tsXhGDVUctO4+kgfYOBX0/b9GFNnPSA5idTe4Ev4/LrTXwCurdvloX7vbqAbuYF2tCTukXbWdgSF7oPy4KePN7AcUqHTZgkFAeRfDgW2wDwZ2QAKAogA==="}
import { Base } from '@studiometa/js-toolkit-v4';

class Slider extends Base {
  static config = { name: 'Slider' };

  reset() {
    for (const item of this.$query('SliderItem')) {
      item.$el.removeAttribute('data-option-active');
    }
  }
}
```

For a collection kept over time rather than queried each time, prefer [`$watchChildren()`](#watchchildren).

## `$closest()` {#closest}

```ts
$closest<T extends Base = Base>(name: string): T | null
```

The nearest ancestor instance of `name`, or `null`.

::: warning Always guard it
It is resolved on every access and returns `null` when no matching ancestor instance has been constructed. Whether an ancestor is resolvable from a child's own `mounted()` depends on mount order, so never dereference it unguarded there.

```js
this.$closest('Slider')?.goNext();
```

:::

A child that reaches for its parent is usually a child that should `$emit()` instead.

## `$watchChildren()` {#watchchildren}

```ts
$watchChildren<T extends Base>(name: string, callbacks?: WatchChildrenCallbacks<T>): ChildrenCollection<T>
$watchChildren<T extends BaseConstructor>(ComponentClass: T, callbacks?: WatchChildrenCallbacks<InstanceType<T>>): ChildrenCollection<InstanceType<T>>
```

A **live collection** of descendant instances, in document order whatever the mount order is.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"ad81e10517c52399df1f705f00063ad91c736c3c6aa09d681f9b67415fc41c37","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

class SliderItem extends Base {
  static config = { name: 'SliderItem' };
}

class Slider extends Base {
  static config = { name: 'Slider', components: { SliderItem } };

  // Exact `config.name`.
  items = this.$watchChildren('SliderItem', {
    added(item) {},
    removed(item) {},
  });

  // Also every named subclass, through `instanceof`.
  allItems = this.$watchChildren(SliderItem);
}
```

```ts
interface ChildrenCollection<T extends Base = Base> extends Iterable<T> {
  readonly size: number;
  readonly items: T[];
}
```

- **The string overload** looks up the exact `config.name`.
- **The constructor overload** walks the descendant elements in document order, reads their instance maps, keeps the instances where `instance instanceof ComponentClass`, excludes the watching instance, and removes duplicates.
- Callbacks passed to the decorator form are bound to the instance.

::: tip It is instance-scoped, not unmount-scoped
The subscription stays active through unmount and mount cycles, for the whole life of the watching instance, which is why the call belongs in a field initializer. It is never released and dies with the element.
:::

The initial sweep is deferred to a microtask, because the call is usually a field initializer; the announcement listeners attach at once, so nothing is missed. No global instance registry is added — unmounted instances announce from `document`, so one lazy, realm-shared listener serves every watcher and the document holds nothing but weak references.

## `$provide()`

```ts
$provide<V>(key: ContextKey<V>, value: V): V
```

Provides a value to the subtree and returns it, so the call is a field initializer. **The value is provided as it is** — nothing is wrapped.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"639a498f90aa34a2ce145e328bdb8fa9fb4189e349aa5548487d428f90f8af49","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACAZWYEtY5KnDStSDRADYqzGGADmafEmnUx8mBJC8BZSiH5hciAAxVG+Ma0Y1yUgL4V02YwWJ6qNengAUrfuwAlJws7FwAQuwwADwAKpx0NGBQEVEACqQQWFwAvJyRcDAZWXAAfAA6YHwAtlgQ4vlR+iJiEgBMAIwycorKiAAsnuqaeAW4MnxGSGYgFlY2eoidjs44eIQkQtSJvliZOOIYwTqCAHSMEGAAZnzyiJzAlZzPnGCs1TD3IqST8gDclXszVE4iQAGYAOzdBRKFRDUgaLQXa63fSGYxdWaWUjWWxIACcK2oLnW7i2Xi0Pj2WTImGCbw+XzQPwUwNaSH6AA5ob0OfDEXgGeMDJMMeZsbjFm0TETMGtEG5NvoKbt9rSjjx+GdWFg+PcAK5gADWkAA7mA2aCpPiebDEGD+SMFTq+GjReDxfM8UtZSSFRsPNtvAqfB8lNBgmNomNitlSqcACTUoi6aKGk0Qc2lHxGmAYe4AYUuFIA0nm08azWBShROER/PrPpx01XAgbK5mLVQoBBGAgFcUU7BOKw6w2YHWyAAjVhoGqcNAQBf4CdwfVT5kwCdXeojrjMS7yPfLicwWQfMBoTj8EhwU6VWIr14wMTwK/J3SkTimyZ3yoPp8P0ETg4D4NAuEuE8EnPOQ0FrSAr0gpQJ2qCBDSvRgMBYGBazgJcwJHMA4FNMg4EqJRMn1eR8ASTYMGbMBUPQwioE4JjL1OTgADkICUX5OFIM8X0KLgCJfUhmHzEcQggWpLlgypTUIQpOFgUIcTnSC+C4H8lCgHFzU4XMYGyTggP49C+GYTgwK4ISLyveQIHgU5LQkTkZlkGE+m5NQESdEAk0yIdhXRD0sS9RYOjBX15UVQMVQVZERE1T8i0vRJC2LRIywwCsMyzNykE5G0DB6O1osdLQTjIdKVQmKZ7U9HEFjsNo2li1wA3JHYQ2pA46RA0QaHubhbjeZhokeMAXhs5I6HuMB9WqKcyABMB7FKIrEA6DpPPKvoAFYqrwFoaDdRrBgilrvX6TrSSVTxepAPwAjgYJQPkCapqeF5JlgWhFuW1bSHWzafEmMC+H8AA1cd7mm2b/oW15gbWwE2x4cb/B+ma/vmwHUZW9GNoqKo5IaT6Jv0Hs+zwAtBNnCdR0Zmw+BIMdmEbe8wEqAB1H4aC4Qo0DQWQQIwMALEySB9TgSTOIAQQErdLxxS9v0F1d9QOQpYC4ZCQn1UhBI12AbzIDBcKXSAQPXOBGB+EHOAgKdClIW9CJd5hgPrLnmauWxpKMEiv3k1zhBBCRdqhMrvLhPyBQVKn/Au4wrrmG6oo6e7/TJZVnqpNVDmCZHCaW4mthaK0OjaVQvN5RBjsTgKy7TvlrslNqZScYk4u6gvgxe/r1WCJyuMyzgfGCHJSjrCABG2jp+gdOPG9UEEk5Acedga4xm8zruOXsABdcxoFcUIOFS4DEjkFJGhUxGhtnPhGBklEjzyYBXneJsAHIaqkH/pwew61fouk4HkPid4grEF0D4IBdVEi1mfs8M6TYU7MB8D/Mu9wTCgMCBQX6zwd70HuNPKBc9gCOF+vYQIYN9BhlYEgUAd8iJ8EuHgAAVggew9ggA="}
import { Base, createContext, signal } from '@studiometa/js-toolkit-v4';

const SliderContext = createContext('slider');
// ---cut---
class Slider extends Base {
  static config = { name: 'Slider' };

  api = this.$provide(SliderContext, {
    state: signal({ index: 0 }),
    goNext: () => {},
  });
}
```

Instance-scoped: never released, and it dies with the element. A component whose declaration is withdrawn keeps providing until its element goes.

## `$inject()`

```ts
$inject<V>(key: ContextKey<V>): Promise<V>
```

Resolves with the nearest provided value. **When nothing provides, it never settles** — a missing provider means "not yet", not "no".

```js
async mounted() {
  const api = await this.$inject(SliderContext);
  return api.state.subscribe((state) => this.render(state));
}
```

The pending request is **unmount-scoped**: `$unmount()` cancels it, and a new mount runs `mounted()` again and asks again.

## `$injectSync()`

```ts
$injectSync<V>(key: ContextKey<V>): V | undefined
```

The value, synchronously, or `undefined`. For the case where the answer is optional and the caller has a fallback.

## `$read()` and `$write()`

```ts
$read<T>(fn: () => T): ScheduledTask<T>
$write<T>(fn: () => T): ScheduledTask<T>
```

Schedules a layout read or a DOM write in the frame's matching phase, tied to this instance. `$unmount()` cancels the pending ones.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"aa09fa66b3e1840ca512c30fc43e687c671d8e62b8a61d3a949f09133821d6a5","data":"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="}
import { Base } from '@studiometa/js-toolkit-v4';

class Reveal extends Base {
  static config = { name: 'Reveal' };

  async mounted() {
    const box = await this.$read(() => this.$el.getBoundingClientRect()).promise;
    this.$write(() => {
      this.$el.style.setProperty('--height', `${box?.height}px`);
    });
  }
}
```

```ts
interface ScheduledTask<T = unknown> {
  promise: Promise<T | undefined>;
  cancel(): void;
}
```

Every read runs before every write, once, before paint. A `read` scheduled from a `write` runs in the next frame; a `write` scheduled from a `read` runs in the same frame. See [The scheduler](/guide/going-further/scheduling-work.html).

## `$warn()` and `$error()`

```ts
$warn(code: ToolkitDiagnosticCode, message: string): void
$error(code: ToolkitDiagnosticCode, message: string, error: unknown): void
```

Report on the [diagnostic channel](/guide/going-further/handling-diagnostics.html) with this component's name filled in.

```js
this.$warn('carousel.no-slides', 'A Carousel with no slide does nothing.');
```

## What does not exist

| Not in v4      | Use instead                              |
| -------------- | ---------------------------------------- |
| `$parent`      | `$closest(name)`                         |
| `$children`    | `$watchChildren(name)` or `$query(name)` |
| `$root`        | `$closest(name)` with the real name      |
| `$update()`    | nothing — refs are live                  |
| `$terminate()` | nothing — there is no permanent state    |
