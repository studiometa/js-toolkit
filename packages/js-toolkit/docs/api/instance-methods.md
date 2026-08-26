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
// @twoslash-cache: {"v":1,"hash":"6e50e28b2631698e0689811f83ad643c734cbad53d0d6102db1948bf672ba7d9","data":"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"}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"9d186cae88f82143b93f2512c1cf2942164c3fe4d3e48b155e89dd95381f0a9d","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8ADKHFg5DmewYiAArDssutNkgAGy7BYHaEgUHscFObJfABM11upHujxRbw+ODwPzIf3oTDYnB4viBxxkcnocWUBk02l4emOhm0Zgs4TsDhOzlc7k83lZ/jkQRC/DCNki0U5CgSSVS6Uy2TyVAKRTgpQq1Vq9UazTaHW6vX6g2Go3GkxmkIW0ORKwRYA2W0Q8L2GKOEjxZ0JxLuDzpiAJAEZKdRPjTiHTdv8PIwsHyyJg+NjwfFVWAAGbsFKIXjAcy8eu8MDMSwwaudUhnFIAbnMLyc80WiAAHDDVojA6jqOjDh5SxWUhHzogAMzR0mxp6vd4p6nfdMQ6hZkA5vN2DB8JstttoDv+/tQ5aTtb+pFBtH7GfgZtS/FIVcgG4Y3JeMLmTTBdwIfd6UxRgW02aBCzBMh4lIeABkYbhqyICAcXvL0kATBMAHYxxfQNRynD9MVQ1QGFOJcKMA9dgIJMDUz3X5MwZWcIk6XgmhgSxq3ZIU+RMPDBwTVoiT9ANtnfUMPAEyxFy+ScmLJOMExhNiINpA8aG4484MIKA+BE3kjGMeIABIAEcujIDBJAs1RhRMYxGEvVteHbTtMMlFzLJFZApicFw3DwABZCAumiGAoF4WA4H4OJmE1M55jAVKRAAIxVNUIiiexvIofiwF4AARAB5KLeFsYsJOhbSKOfOTEEnENP3sxzglUlE100p4CSHXSvkgzjDyM0s+OU4SJCCtyxOMJqCJHUj2uDadMWU/rEBIgCSSGilt3A8b9Ogphcy0fNz0C0SrNsmBWGrAAJaQooAGQAUTWFtolWxAEyWK5ZNff8usxGznr2g6NI3Aik1O9iJozKaYJMhDeF+wTipQwT0wAQUKDtcq6GhGAcpkKwSgA5b9r1vFIAuw3CqAi2UvB8HH/vsTHEoAKgFgADVDLCJkn2DJinuGFoXeDF9MRE2HxmEl6WfAAdyafBeBV3ycH4dgacS7zeDLTRLD1+Vntx6J4nMcxkCiyrad4AAlGAyzIKJUqmRgTWKMphmem7SHicWAC92FYIR4lsFISg5koAHUYFykpCbUABJEoeeKkpFZIYmbyl8mYG4QHgfhNrX20hTPyLmAS9J8vYcGhGgZ02YAOgcarBsCVgElXgXnNy3eAAcgAAU6Ho+jg5gLRqOoGiaSeezAcxAUVIsyC1bkR9rCrfOSNB2H4UJy0rAUa0bBmp730hJ9Hze6wVtC0Awmt3/rMtbF4IwGa9hlL1TLNbdgcBbIOScowSeT9s40EsJPbgfBj4NgbMpJ6rB8bi2LurcucCoBq2YFULQ58IhVDJOwEgKDN4YJeO/RhYA+xUEXkgUAsQwBwD6GAPAlQQAvBeEAA=="}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"8432981355de14f5c10410fadf5ffb6ed9bb2c1b99c00f05abefd97e143c53ee","data":"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"}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"ffc7ace2309293fee95f06f34c6275f999b7eb0f757867b3afc34bd976556429","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACAZWYEtY5KnDStSDRADYqzGGADmafEmnUx8mBJC8BZSiH5hciAAxVG+Ma0Y1yUgL4V02YwWJ6qNengAUrfuwAlJws7FwAQuwwADwAKpx0NGBQEVEACqQQWFwAvJyRcDAZWXAAfAA6YHwAtlgQ4vlR+lAQjAiIILH4MCFsHAkkpBghELUQRmBoCfRyKQB0+qLy7cjIBnxgANb6+Gho2YgA9IcAVnAAtGgQEMybfGjnRAAscyIArlB8o5qsc7BEh1YWD4hxAAF0wcJROIkAAmACMMjkimUiCennUmjwBVwMg2xjMIAsVhsekQCMczhweEIg0WiV8WEyOHEGGCOkEc0Y4wAZnx5IhOMBKpxRZwwKxqjBBSJSBt5ABuSr2fQiMQSADMAHYkQolCoMaQNFpuWA+fJ9IZjIiiZZSNZbEgAJyU6guGnuITUBkdHxMrJkTDBCVSmVoOUKVXQiRPAAcupRSHRaiNWI6Idx6yMSBtxPtpLssJMrsw1I6tI83u8vv9LKDPH4nKBfEFby2kAA7mAo+qVE6E/rEBrDca8M3LfikMPbSTHeSS+7y576dWQD4pUpoMEcdEccVsqU5gASf1EXTRNubTtgUo+TYwDCCgDC4y8aAA0g+L+2IF3ShROCIfw3mlThL2vQJWx/LtmladoQGKM9YE4VhAOAnpBgAI1YNAak4K58O6Tg4DeTDwxgHoeXqFCuGYcZ5BowiehgWQpUmTh+BIOA5kqLoeiMMR4CmU9dFITgOw2bjKl4oiRMEYj7i4cYmISVi5DQADICmZSlB6aoIDbKZGAwFgYAAuAIE4e4ULAOAOzIOBKiUTI3nkfABjIYY230wybKgTgfMmOZOAAOQgJR5U4UgWJgKIuGs2LSGYR8UJGMYJjQSoO0IQpOFgUJ7Vw5S+C4CSlCge0u04e8YGyTg5Miwy+GYKy0C4GK2KmeQIHgBYoV7RBY0JWQ9VReMU1HDoT0yJDMytKdzDtB0yXhDUFzLNw6U8H0iXGEQG1El9JkSZ9X0ST8MG/K9fxvHsYUG/sDGRQdVpHNNtEbMgjrfCdsyHRbZzJWFYXW1wKy9H6a2ZQM2WI0QaEFbh+QlZhomFMAxSs5I6EFMA3mqTCyCVMB7FKO6JHheFhue1EAFY3q0NUaF+4xkzzZa7CeUGPS2qstD8AI4GCOBkf8NGRTFDZYFoXH8cJ0hidJnwNnuPh/AANXQwV0cxqWcfFOWieVSCeFF1Gdcl7GZYNgmjZJioqjGBoRfkFHYLaPAn2inCelQ72bD4Eg0OYECeLASoAHU5RoLhCj2WRiIwMALEySA3jgZLgoAQSiijJntdiO2jnoSJZQpYC4XSQjeUhovY2BOM88zLMgYjSLgRg5XlzgIEwwpSC4mye+YeSgJD32eVsVKjHssTxhgPq1GWJBVizbYqF2fY4COU4LiuG47geZ5XjQD4vg3X5/kBYFDlNN9DhdlG5l2apmHBSEQDVe7KZ1J7RoNCa71H7+BZkmAG+Y5yU25kuXmkM1y1hhsEPW1s8a2y9F/CmsJVAjUTIgemgCtDINAWicBHM4TFicG6Da4MVz8wQayYI3UQonU4D4YIORSiAQgAIcmOYnjThwYOVQ0JJogCYQyPEf18HswLEmewH9uSwCYH0LgHIyDTCSCkRouULZMz4IwEYZp+ScDyMAcUkpQIAHI1GkEsZwewxMJbNhMYREqx45IwB8DY76iQAIW1FEzUCwDmA+DMcgwUJh7GBAoBLUU4j6CCjYSYzhwBHAS3sIERW+gL5IFAIkOQItxh4DOCAew9ggA"}
import { Base, createContext, signal } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"b10b232776562f97e931c674e6e444c9aa15b397816a44f0c1893e5a351835cb","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8ABKgRgbCc80WiAArDssutNkgAGy7BYHBgeUEkCGnc6IABM11upHujxRbw+ODwPzIf3oTDYnB4viBxxkcnocWUBk02l4emOhm0Zgs4TsDhOzlc7k83lZ/jkQRC/DCNki0U5CgSSVS6Uy2TyVAKRTgpQq1Vq9UazTaHW6vX6g2Go3Gkxmcz2mORKwRYA2W0Q8L2GKOEic2S+RJANzuDzphIAjJTqJ8acQ6bt/h5GFg+WRMHxseDWPFVWAAGbsFKIXjAcy8Ru8MDMSwwWudUhnFIAbnML0hXqQAA4YatEYHUdR0YcPOWqykI2cvgBmYlx8nPFOYanfDPkLMMnN5rQFjB8FttjtoLv+wcLTFLKdrf1IoNo/az8CtqWRpBrmMSTJBMCQubc0z3X5D0xEBGDbTZoCLME2HiSwIC6aIYCgRhuFrQxLHYVRJCICB2CgYwnBcNw8AAGXYCsYH4DBBB8QgIByCheDbZhNVqXgACMfH3LsoFgMB4l4ABZZgQlIAYulIMBeGYXxwTALosF4CsMIePowHMRhbGUpSFlJEIIArXhNhgSw+E2Zh7FIDCRAiKz5UieheAAAwAEgwtCMLQHCvN4QAUAl4OAMDAfheFscwuCi/hEHMBsmwS6KuPQzDsL4eslKbRty06CLqxbVgBWUgB3Zgmjcwj4h8s5ykYoKAGV+gAYQiGh6G4Pt8oKuTukUkqUjKjoun4uB+C7QTGEYIg2C6GA+B0Yw614QAyAl4F4+tSxsXhSsAAEFQnCDUYi5RRu2Urj2FoM5eCGhSwBESrbnsWrYkUEQ2AiFJeEqpp8F4Jo4HMCBKrATjHp4kJIk6btkv0gbMsCrCcLrfam2ekbkDgDSyFQrKaByzjMbWjbtpeKZ+oKgdPQfJBEwJACXwDJAAHYP1DDwAuypd8THQCNwTYdwN3Ah93pGCivsfiIFoWsABEAHlJNBB5eAAH14DDYCrSIoHvaFE1aYX2bfACQy/BXaEFr4p1jUl4yeRMwPeVNJdpA9qGzWD4MIKA+HZIU+RMBq5OYKBJDVjWWuMRgKzAWsKfWuPNbQXDeFam4sK6NYoGkLgclj9XM4oqgqNlXPvCgAufBUuOnvBKAewEHj+BgQvlK6WpLAc9h+DYVgQneqI3J8M55minx/JJuBEkZ03kWjS3A2Fm2YJ8qPjbxR31xdzcCU5iWvilqC/aPWCTxwOxz0lSQw6MYwGu72sAAlpEkmiAFE1jbNEE2mJEyc19Ovf8PMvw+W7g7FEh9gJPFaK0M+6ZL49RgnBAYQc+D/xslENA8QMSiCyr0f0HUOAEMzjhFW5cWqURlHgLwPgABULCvJ4MAYQ4hpDuwUPYFQlqwU2FcWwdAFuw1Xq3Qzi1WK/FmpaxPEQMiN0zgVlsAPNAellIKz7pPEqAAvISlkeJyAAQQ4yUBQZoBEDYOATRtFySEFokgVkID6OUTASqNg7DxCOsgSSysAByIIYAMTkrPKYjATTFDKMMbup5SDEwMewVgQh4i2BSCUauJQADqMB+IlGOmoAAkiUThBCSg8P1nwyh0RM7cGAczYcbMJxIAJImKBMFqnXXIXUtAmc4GICdkBV22xxaex3OfH2MsmC3zPHwWu+dC7FzgKXGRDxX4ngIqoPCmgdlSA2fYXW+swnLnIk0wkFxhzjlfIGbm05PwwW2YRX8y54EiyPgmTmK5UGQUzFfTBgdEKP2fiKBqlUuw0GIqRciScU68DTrwEiZFs5LPriskuMKyKV2lNRDw6KG7SPVoDKFMB27D1nj3ZgfcwiD2Hmkse3glLWVBq9ZIs89ZgH5jYpeIAoSYgJASZ8bThldLwD5SFTQ3n4gec7RByw/kXwBRguZ+Z74hwkE/XkL836sE/t/P+5igHL0FTCNeorrYzm3rA/eI4EFjMQImZMkyILKt9qq486rCy8AqdEDqrVWolLAJGVqmA1j2gwGsWsAbA3hpgMrRiQhSRaIiAw/FIAAnBNCeEqIXcokxLNHEsErBEnJNSekzJ2SZR5IKUU0pJQv4/z9WgEonQo0rUuQSGEIq7lIE3tavA7a1hDJuZ8hVTqYRKpmdBJgwLg68FjWGjtibAQpr0scDoAxhRnlzN6jA15bwpE4otVgy1D03V1upNJnE8x9ChRgAA/Be/02cUV7zxbKZhvA2FeSXfG1dybB4RC3WgHd99hEsNEQhKxZxHgVnuD4VQNjbqREqsipaPh1GkFuvM++sUTKLsDRFeNvBYBruA0pCA8iWp+JRlmkJoJc2ROiYUWJ2SS1lrQiktJzAMn7GrW4WthTillP/SupNdxU1gDbdu/djTTXtNXrcjmTrOmPN5vyuTiTMCjodcfF1VJpnS1nXOCIxU7a0PjlrE5igzlGy7cOcBlrxUeDtnp8djrWgTKM2glV/s906Yfkc+I3hqwFFrOpSwgkcO2YNuc9NX75S/rCykAoXkRF4cwLFSyrKjlsvg4hlueZ4AEJEKy1LBQcv6Lkg8HiKQI28G/ae5aHclKCWbDAFIg8SB0fMAxnNZA80wALWxotHGSClrvuW3j/Gsk5PySJhtRySiVazl2pY8IIFio01+NbHn5WOphL82YMZoDnysD4+wwBJQ7S0vs3gAByAAAp0HofR4LMAtDUOoDQmiPf6uYQEipixsC1NyW7eVGzzC0TFec1YKo3cvO2J7oPWCPZ2oD/K6UYo8oxrlbGcsBKKwqswaqtVNj1R3q3eaq11qU8XjA0sPSyEpH4YIh4OFuDxBeaoOmTYGcQrJbTgU60ocFTqoz7ukaI3IfA5gRgj2qhVDW49zivlgB20faFmA4W0AvCwLQLye1Ua7X54dMADMQCfaQKAb69i00eEqCAF4LwgA="}
import { Base } from '@studiometa/js-toolkit';

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
