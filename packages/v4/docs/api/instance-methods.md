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
// @twoslash-cache: {"v":1,"hash":"102500b8b1a4e480a7feb85d058c82ff62998a81a59afcba3a358f1b285dbe5e","data":"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"}
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
// @twoslash-cache: {"v":1,"hash":"144c6974e762968259ceeddf9eeb1d51fa2c2eee46f73913e39b5b5c439295ca","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8ADKHFg5DmewYiAArAB2VbrTZIABsuwWB2hIFB7HBTmyXwATNdbqR7o9UW8Pjg8D8yH96Ew2JweL4gccZHJ6HFlAZNNpeHpjoZtGYLOE7A4Ts5XO5PN42f45EEQvwwjZItEuQoEklUulMtk8lQCkU4KUKtVavVGs02h1ur1+oNhqNxpMZpCFtC4cSskitogdtQMYcPMd8WciSS7g96YhCQBGKnUT604j03b/DyMLD8siYPg48HxNVgABm7BSiF4wHMvAbvDAzEsMBrnVIZxSAG5zC8nPNFogABzDxFgDaBtEh/ZhkBlyspSPnRAAZhjZLjT1e71TNO+GYh1GzIFz+bsGD4zdb7bQnYnA6hyxW/onyKD6NnWOv0oJSHX86kuS8aEhcKaYPuBCHgyWKMK2mzQEWYJkPEpDwAMjDcDWRAQLij7ekgiageOk5IDCn6YngaGqAwpwruRgGxhSCbgWmB6/FmjIeGWnS8E0MCWDWHLCvyJj4UOiatAxaxvoGwZ7JRHj8ZYy5fNONxMfGiYwqxkF0keNBcae8GEFAfDCXyRjGPEAAkACOXRkBgkgWaoIomMYjA/re94pFhUouZZorIFMTguG4eAALIQF00QwFAvCwHA/BxMwWpnPMYApSIABGqrqhEUT2D+FB8WAvAACIAPKRbwtgluJ0LaWOr6kYg04KXO9mOcEqmohuwFPISw66V8UEcceRk8fYylCRIgVuaJxiNYRo4ke+8mhliyl9YgCKMZuzEoqN6YTYZsF5loBaXgFIlWbZMCsDWAAS0iRQAMgAomsrbRCtiCJksAEyW1AGdViNmPbt+0aYdWnJruEFjfpMFMCZiG8N9AlFahAkZgAgoUnY5V0NCMA5zKVvFAByLZtrwHZdv5OF4VQ4Vyl4PhY799jowlABU/MAAZoZYBNE+wJNk9wQuC7wosZiImw+MwEtSz4ADuTT4LwysMzg/DsFTCU/rw5aaJYusKo92PRPE5jmMgkUVdTvAAEowOWZBRClUyMKaxRlMMj1XaQ8RiwAXuwrBCPEtgpCU7MlAA6jAOUlPjagAJIlNzRUlArJCE3ekukzA3D/YD+0g++2kUXOhcwMXxNl9DA1boROmzPO0BjVYNiSsAUq8C8ZsW7wADkAACnQ9H08HMJaNR1A0TQtK0E+9mA5iAkqxZkNqPLD3W5UM8kaDsPwoQVlWgq1k2dM1hP++kBPI9b/W8voWgmG1p/DbllsLwRg00+I0EthAcsVt2BwFsg5JyjBn7IVIFncBE9uB8BPo2RsykHqsFxmLIuasy6IKgKrZgVQtAXwiFUck7ASDoK3tgl4n8WFgH7FQBeSBQCxDAHAPoYA8CVBAC8F4QA="}
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
// @twoslash-cache: {"v":1,"hash":"639a498f90aa34a2ce145e328bdb8fa9fb4189e349aa5548487d428f90f8af49","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACAZWYEtY5KnDStSDRADYqzGGADmafEmnUx8mBJC8BZSiH5hciAAxVG+Ma0Y1yUgL4V02YwWJ6qNengAUrfuwAlJws7FwAQuwwADwAKpx0NGBQEVEACqQQWFwAvJyRcDAZWXAAfAA6YHwAtlgQ4vlR+lAQjAiIILH4MCFsHAkkpBghELUQRmBoCfRyKQB0+qLy7cjIBnxgANb6+Gho2YgA9IcAVnAAtGgQEMybfGjnRAAscyIArlB8o5qsc7BEh1YWD4hxAAF0wcJROIkAAmACMMjkimUiCennUmjwBVwMg2xjMIAsVhsekQCMczhweEIg0WiV8WEyOHEGGCOkEc0Y4wAZnx5IhOMBKpxRZwwKxqjBBSJSBt5ABuSr2fQiMQSADMAHYkQolCoMaQNFpuWA+fJ9IZjIiiZZSNZbEgAJyU6guGnuITUBkdHxMrJkTDBCVSmVoOUKVXQiRPAAcupRSHRaiNWI6Idx6yMSBtxPtpLssJMrsw1I6tI83u8vv9LKDPH4nKBfEFby2kAA7mAo+qVE6E/rEBrDca8M3LfikMPbSTHeSS+7y576dWQD4pUpoMEcdEccVsqU5gASf1EXTRNubTtgUo+TYwDCCgDC4y8aAA0g+L+2IF3ShROCIfw3mlThL2vQJWx/LtmladoQGKM9YE4VhAOAnpBgAI1YNAak4K58O6Tg4DeTDwxgHoeXqFCuGYcZ5BowiehgWQpUmTh+BIOA5kqLoeiMMR4CmU9dFITgOw2bjKl4oiRMEYj7i4cYmISVi5DQADICmZSlB6aoIDbKZGAwFgYAAuAIE4e4ULAOAOzIOBKiUTI3nkfABjIYY230wybKgTgfMmOZOAAOQgJR5U4UgWJgKIuGs2LSGYR8UJGMYJjQSoO0IQpOFgUJ7Vw5S+C4CSlCge0u04e8YGyTg5Miwy+GYKy0C4GK2KmeQIHgBYoV7RBY0JWQ9VReMU1HDoT0yJDMytKdzDtB0yXhDUFzLNw6U8H0iXGEQG1El9JkSZ9X0ST8MG/K9fxvHsYUG/sDGRQdVpHNNtEbMgjrfCdsyHRbZzJWFYXW1wKy9H6a2ZQM2WI0QaEFbh+QlZhomFMAxSs5I6EFMA3mqTCyCVMB7FKO6JHheFhue1EAFY3q0NUaF+4xkzzZa7CeUGPS2qstD8AI4GCOBkf8NGRTFDZYFoXH8cJ0hidJnwNnuPh/AANXQwV0cxqWcfFOWieVSCeFF1Gdcl7GZYNgmjZJioqjGBoRfkFHYLaPAn2inCelQ72bD4Eg0OYECeLASoAHU5RoLhCj2WRiIwMALEySA3jgZLgoAQSiijJntdiO2jnoSJZQpYC4XSQjeUhovY2BOM88zLMgYjSLgRg5XlzgIEwwpSC4mye+YeSgJD32eVsVKjHssTxhgPq1GWJBVizbYqF2fY4COU4LiuG47geZ5XjQD4vg3X5/kBYFDlNN9DhdlG5l2apmHBSEQDVe7KZ1J7RoNCa71H7+BZkmAG+Y5yU25kuXmkM1y1hhsEPW1s8a2y9F/CmsJVAjUTIgemgCtDINAWicBHM4TFicG6Da4MVz8wQayYI3UQonU4D4YIORSiAQgAIcmOYnjThwYOVQ0JJogCYQyPEf18HswLEmewH9uSwCYH0LgHIyDTCSCkRouULZMz4IwEYZp+ScDyMAcUkpQIAHI1GkEsZwewxMJbNhMYREqx45IwB8DY76iQAIW1FEzUCwDmA+DMcgwUJh7GBAoBLUU4j6CCjYSYzhwBHAS3sIERW+gL5IFAIkOQItxh4DOCAew9ggA"}
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
// @twoslash-cache: {"v":1,"hash":"aa09fa66b3e1840ca512c30fc43e687c671d8e62b8a61d3a949f09133821d6a5","data":"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"}
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
