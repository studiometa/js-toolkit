# Shared state

Two components that must agree on something share it through **provide/inject** — the shape of Vue's `provide`/`inject`, with the mechanics of the WICG context protocol.

[[toc]]

## A typed key

A key is a value, not a string, so keys cannot collide:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"679dade20075b17a5d35d7d969706d08f3f42b2eae35f2e977c3aaf86120302d","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAYUk16AHgAqvALy9hAa0gB3MAD5GsODPZZxkgPyJecNKXZgA5t0dKwKtAGkYDA0TAB0wdgBbLAhSNGlZeRgfP0oQKAgRBEQQBUSaXmZeTBwoaWU6eL0ggDo0tGZ3bORkEA4wPTT8NDQsOEQAegGAKzgAWjQICFY9djQxogAWGudBKAlImAaa2CIB5ix2AZEK+mP85NO0Gu7I1hAAXQeqZ2Y4pABOKlYYDzR8JAARgAzFQGqR3Fs8DI5Iorml2rhEAAGKgifBvZhiMifAC+FHQ2CRBGIOLBlSYbE4PF4bhopH4WJgvAAyux3GA2BptLoOkZTOEojE4qz2Zz7lQMlk8ABBXiJMTsEi8IhsQTMwxzfBODCifCkSQQQRwJyCABGllcNgkYDgdRe4IYiAATF82r93P8kAA2MFvSFOkBsjlsBFuJGokDozHY8guj74wk4PCEEjkcn0PB0siMkTMlkcWCkGWHNKvd6IAAckZ+fwBiDd4IDeAL7CLJfYYbASOdaIxpCx9KByMT1CJKdJ6eoFJyjCwBpwcQwfFb7cOKwaNEcwfFqmA4V4h9pYFgtEcYEEkTNZAA3Aej5MGqxz5fr6Q72BcSYy47Potvh6XqIAArH6EJQjkrw0F2SKglG/aDjiLqjiUxKpmS06ZrOVJcHw2YMkyoohqw3I6Po/JhBE0SxPEO6hpKmTZCAcoKuIyqqqw6q8Jq/w6nqBqQMapoWlY1qSHaP5vE6gLIoCAF1j6YHNjkdESm04ZIHB0YDrGeIEmOyY5OhU6pLO84QIumB4SedAvleGHltJMnyZ69agdQ/oQSAbinjBml9jGQ6IIClYoeORmTvUM4gHOC5kFZxQQE+dlvpJFaAs67m1q5SDuU2XmPvR6ndv58GBUhwLAmFhkkmmUVYTFmz/NAK6FmQHY1O4EAAHKVIwXgqhAbZpdJixZYB9a+h54GBl1vWZt8GmIP+ZU6UFzrVWhkUZoGJy2rRbWkCklTeFcgTBKu7WHN+DpSUCADs90uUBIJKV5l1HfCi0lYgT2rYhcYgptE51TtlIcLhCSwpcviVKoH0dmYFiibYYAOE4LhuJ4p2w/Q53w4diOCtRIowkkx0LekjF4Hk0OFMURJlHtfi8NUGD2h5TRIC0xWdFQ3S9P0QyjBMUwzHMCzLKs6wQE1zA7DAewHEczOVOc0MU9ctz3E8t3pR8cHZS9cH5btFya35v0BWtSGusDEWg5hgb4bm+aE6WetOs6yJ/Ub9aNp5gYIx7xVIn92kA0gixVc8UbQMSQo0bwwBQ+TVwUAzOBEeKvC4gIBqRLwADkAAC0sbFszAjOMkzTLMaBFx+gqwwReasu77DJ/eUEwNuYpcinPm2bwF72e+iXJSPr5kLnJgfoec19QNRBDVAH64uE4R0MK8R7c47dtmQms8mTcK42gBOH8W12MEXcCHUX3A3mkctIKAlS/HANp4GgCC4riQA"}
import { createContext, type Signal } from '@studiometa/js-toolkit';

interface SliderApi {
  state: Signal<{ index: number; total: number }>;
  goNext(): void;
}

export const SliderContext = createContext<SliderApi>('slider');
```

The description is for debugging only. The identity of the key is what resolves.

## Providing

The coordinator provides what a control can ask for. **The value is provided as it is** — nothing is wrapped, so the type of the key is the contract from end to end:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"d068eb1815a038a30bff63af84b2bf39500f1098f60ba6bfc09063fc2c1e9661","data":"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"}
import { Base, createContext, signal, type Signal } from '@studiometa/js-toolkit';

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
    goNext: () => this.goNext(), // what a control can command
  });

  goNext() {
    this.api.state.value = {
      ...this.api.state.value,
      index: this.api.state.value.index + 1,
    };
  }
}
```

- The **scope is the subtree**, and the nearest provider wins.
- A reactive value is a provided `Signal`. A command surface is a provided object.
- `$provide()` in a field initializer is **instance-scoped**: it is never released and dies with the element. A component whose declaration is withdrawn keeps providing until its element goes.

## Injecting

| Form               | Resolves                          | When nothing provides                                 |
| ------------------ | --------------------------------- | ----------------------------------------------------- |
| `$inject(key)`     | a promise, awaited in `mounted()` | it never settles: a missing provider means "not yet". |
| `$injectSync(key)` | the value, synchronously          | `undefined`: the caller falls back or does nothing.   |

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"a6b016aa643a9f1353dac8f11a41771fcffc3ff5e31e875da1830a37f66eaca8","data":"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"}
import { Base, createContext, type Signal } from '@studiometa/js-toolkit';

interface SliderApi {
  state: Signal<{ index: number; total: number }>;
  goNext(): void;
}
const SliderContext = createContext<SliderApi>('slider');
// ---cut---
class SliderNext extends Base {
  static config = { name: 'SliderNext' };

  async mounted() {
    const api = await this.$inject(SliderContext);
    return api.state.subscribe(({ index, total }) => {
      this.$el.toggleAttribute('disabled', index >= total - 1);
    });
  }
}
```

The pending request of the async form is **unmount-scoped**. A new mount runs `mounted()` again and asks again.

::: tip Which form to reach for
`$inject()` from `mounted()` is the default: it waits, so mount order does not matter. `$injectSync()` is for the case where the answer is optional and the caller has a fallback. The [`@inject`](/api/decorators/inject.html) field decorator asks once, at construction.
:::

## Page-wide state

`provideRootContext(key, create)` makes the page-wide case the outermost scope of the same mechanism. The value is provided on `document.documentElement`, so a request from anywhere reaches it by bubbling — and a nearer provider still wins:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"7e3d1b4f0b72f553913a29f5590ca8e5bc02f3b2ffa53b435be03daa3fbd941d","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAkfwEMwwYANnETsAstywAeXhgrsZAPkog23Ug0QA2ABxUBMMAHM0+JLuprDMDSC69+Q5QICW/JAEYqd0t0Y1yWgC+FOjYuIgExGTKNPR4ABTcLtxwAJTsrgBWMH4AwiyxaADKGGCMkuJSbKSuhnIArmAA1pAA7mAKCvGCIgCi+gC2BmhyTTAYIvlghQDS4xUSktW1Dc1tHQqpIpVLaDVGqy0Q7QrsAD7sjbAAZq4wUAA6YM4DWBDqGWDZeQV0xaWMZRQCCMBARABK8AgAhI7BMMHY/DU8A4WFIxGcsCg7CISXqCLgAPw6Mg9TgAlk7He7FI1nqpDA7AABlcYLd+FAmQA6GLcQxg5DIEAuZrKfBoNBYYQAemlmTgAFo0BBoU1nGgFUQACxctj1KDOCBDNDcLmwIjSiTOaXMaZ/aVZHJoKaFEplLnigYCEAAXR9VFU6jMnmFBmMpkQ7gA7FQTaQrDZHT87fQ3YC9HckAAmLw8Hx+aKILPBUI4PCEEjkWN/JgsNjsHrsAASABVRAAZfowIbTZSBjQATgHejDJmzscs1jwgicmaLubUvn82YADCXqGFy1Eq9QaxFbfWACLcE25Hh8QTCdguv5zDALKp7FaXNbHDZ9uMadwrgDMI6MY6RjmFjxlOETHqe54OAgGZuPOth5kuhZZlq66YGWEQVtE1ZxBEiTJGk7BohisDgiqzq/PQD7SGAlKKF0YwTNelFoHe1EyHI9FyIwtInjAIjxOkAC8pw7Bx8i0Zs2yLOJihPC8bwfMRRCYjAZEQBRKYMFQwKgngAAK6IqbA8jsLp9Q9hqrSqTieIIjxMB8diLCMAiOCkOwjFcuwAByjm0h5ymqaQcBUpWNQmeqXJPE86mokZwWhciRF8jACouNc1gvAivDYow9gaewABGCIGnAbxwPcPITvySCCsKrhNGKEpSogsrykqKoCGqGrarqaD6oaxqmualpYNatqFNKQWkeRN70B6aBer6/oqJ+HhZiu/7hh45hxgmeAzWpc0sbOcHAd4SEBFq7hoZumHbjEe62HWHAQdwZ72JekwsWxOzLAcL5HCcSgButkY/sOoYARG7jAftYEgO9n0Xo4sHhBdiEFgEmhriEG4YZElZPbhIC4h5lTSVgUzVPUfjvE8/CtOwgnsCJYgybRnGSSzADUP5hWQAgQNwUBpB+ahfpof7QztiAywjNiVGdGMLvmy6INoqGrcwsB4LK7BFMwODOYFqUKtZsByLScDQiQ2LwuwcDcEM7CtNwlJIjbHC3CFaDRWUr2cFBl5s087CfN8mmugC3QCHIyMh0I6QAPwp0RCWzRp81oPEidfUIcis+zTMc1ggmpAA3Mow1IKAfwGHAhpgHgaAIIEgRAA="}
import { createContext, injectContextSync, provideRootContext } from '@studiometa/js-toolkit';

const DataChannels = createContext<Map<string, unknown>>('channels');
const el = document.body;
// ---cut---
// Scoped or page-wide, resolved the same way, nearest first.
const channels =
  injectContextSync(el, DataChannels) ?? provideRootContext(DataChannels, () => new Map());
```

`create` runs at most once per key, and nothing is created at import time. A root provider cannot be disposed and it outlives the instance that asked first, because it is page state.

`withGroup` is not ported.

## `Signal`

`signal(initialValue)` is a factory over a closure. The accessor is `.value`:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"5e6bae8295e85f9d59ffb590205cee82faca8abe70e47ec51649b8040a9d8b77","data":"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"}
import { signal } from '@studiometa/js-toolkit';

const count = signal(0);

const unsubscribe = count.subscribe((value) => console.log(value), { immediate: true });

count.value = 1;
count.value += 1;

unsubscribe();
```

**A write settles synchronously and the newest value wins.** The delivery loop re-reads the value after each callback; if the value moved, the loop abandons the round and starts again on the new value, so a subscriber not reached yet skips the old value. Delivery stays in the same task.

::: warning A subscriber that writes on every delivery live-locks the loop
Guard the write, or move it out of the subscriber.
:::

## Reacting to a provider that appears later

`subscribeContext(el, key, onProvide)` is the subscription behaviour of the WICG protocol. The callback runs synchronously for each answer and receives the value and the same unsubscribe function the helper returns:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"4c589cac947f7aeda7b8c5d2bd2055e82e6f7c2091cc407a7485a09faf11a600","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACAEQEs4WEOAFdSuKnDStSDRADYqzGGADmafEgCMABipTSKmLJB8BzIaPEhmvMLkS6QjfNNaMa5eQF8K6bPYJiMkpqOmMAClYbdgBKThZ2LgAhdhgAHgAVTjDlKGTUgAVSCCwuAF5OFLgYIpK4AD4AHTBeAFssCBlK1JCoCEYERBAM/Bh4tg5sklIMeIh2iDswNGz6XLgAOhCpFUHkZGtbAGsQ/DQ0UsQAeiuAKzgAWjQICGYj3jQHogAWDclhKC8eZGVgbWBEK6sLC8K4gAC6cIk+lkACYAKyKZRqDSIb56aSGYxVKw2OxIRzOVzuYKIdE+Pw4PCEabbMJ4cJYYo4GQYOKmQQiMQbRiLABmvBUiE4wGanDlnDArFaMClklIthUAG5ml4QpJpLJvppMap1EgFNQCUYmGKJSFSfZjU4XKQ3B4kABOenUfxMoLkPRsoYcrlkTBxRXK1VodWqPXIpBolEm7FIPGWgzWoaRkm2R1USmu6meFHab2YRlDZnBQP0dmckph3k8fgCywbFTFYRYAD8UoA4l2sABBaGcAA+nGEYFg4rsUHjBqQAHZlymzYgMRnCXhOxBu/a80gAMwFl1umko8u+qv+1l1oa2DyitxjQf7kfQxcyJAADi3Simjiv74pmxjvt2o68IeZKIKezpUu6iA6NelaBCytYRMq6jQHyrbmIKMAbK0+7LDAUDhDEUqUZwZT1JwRAQLwC5UH0Ax4AAMrwoowIwGAsGMhAQEcFCcMqrDLJwzycAARmM/rqlAsBgBsnAALKsLMYhoKIYCcKw4wwBJ3acKK07uECYDNOEnT6Xp0iurMECilJoytHE6isCspDTlwiyuWMdj0JwAAGAAk04kdOaCUSFnCACgEnBwBgYCMJwnTNOwKWMIgzSyvKWWpWJpE0BRcQynp8pyiKYCSElEqKswtH6QA7qwHyufwGxhbYty8TFADKwIAMKLDQ9AxNqlVVdpun1SojV/MIMkCOqcnhOERBRMIMBxHR0qcIAZAScF4k35XKXh5WAw5zAsSwrDkM4avpYm8LQticLNpC1ZwLUuCsHWPXk+nmKov0fPgnAfHAzQQC1YCiR9EmzHYkgarlVnTcV0XkTRFVVXKX16cgIjcsRJW4zEok0ftwBHSdcJTVVupIkuiAeiB1hYhua7blmIBRWRLGHLBW6FheJaoQE1YBqED4gJE0RwHEIgrYwa0wKNZH0GkEGfrw9ThDAzBSgAokoyrLKJRwwBgUpa+NaAANK27rQ5QfUomLLURDMSqnAO2Ew1RMwMluEcbsfh7VGcDT9GMcxzRtB0XSq6tvByYHdasf0gwgANy3p3JUkQAFCpGWIdU1Y7DHbURV0jGMYgAI7CLwYhQPEIdh4wRyfb5SXZfgxSQMIcDMLMoq2eoYziqQdUSXALVkHZncwNMGDNJSqjkXZS8r6KxStC9djSCvDa+7ApCqQAkmgXA0NIfTw/3P1yVPYhl0FaBby4O+d1tZgO1V7pT0r5Qu6sM5EU4DdC+ftSDxD/oYVyXkkrdiwDYeAZc4BKhgM0QBwDFgTynFgKAXksFwKvuleGZA4D4F4FgEBfQsGQG8vAZEZdGDd3DlsfEuwkD7BAETBAVAADydgpy1QgRrUy5k0CWS2IiA4pIThUDOBcOA1w7iPGeK8d4nwfh/B0oCYEUgwTr0hNCK41cwhXDTpAzOY0wgbDOK0Zg8JEQgH1D+ZCKInSAVTMhC0+gdxDHsRrLODBFBHnkGeRCNJNCaCln6DCcsIgNm5OGbo1Q0jElqKUeo3VjZSgABIZDUhxc2MBLZRK8QmZC3x4IBI3PBEJ/MwrGxgvYC04tiwnmPMk28qTHY2lqisfkBFLB60ifbJx9AXYYEjpBaE9RvyyE0N8TmzScQomTHzYwEyLBiGmXM2pDpzRxKLEhY8v5BnoRrGk+srhsJkDiHubsA53ZflZj4zQy4mncxxFuNpxh3lYC6RchCVyaRyAGb4H0aEZb3nSaGHkeEzBHKImCvsnA9ZQQnJI2ceZhbePWR6C02zEygVCSAMFELEC816UhRJdykWYSea6F5pA3lDk+VHb5dS2alnTJSzc1L+Z0uibBRl54+nIS9PCis0s7zsqGDVOqShWAkGonteOTESX1N2QCoCVL9l4E1SQelnMmUJKvIqm89zZYjODFgZ5RhXmcDBXy5Z0EfmomPP4wFpqQW7iHFay5EskCllZSqx5wZsKECgHEPF0INi3CYmADkMAyBSmJDHOODF9VrKjceXmor0whqGOm2w4aoWRtpHIGNwygxOEWBqoy2rY66sLcxYtcFNBbKDWKs1QwLW5lgokiNcrbn2sRbG51CsMlNnRW2IU2LvX6wJdOIl84+3Hm+I4UVwKrSgrDVKx0eybWeE0HChkyrm3yy2gg7dMA5zkT3Zs9cOIPTiuMC+t9wtzm+KnUhPxXhPEilgEwCYXBDmEVWDQGc+RqjSnyvqeRaUarihUM1OmOYpQAHI4OWAIydKa+V124q+bwcjlVBalTxudT6Rg5rhKgZE8I6guodOYKJYjxyhyROpmC7t+MCZcc2GC5qYKmYE3VSsMd0mhxpozZx+hytZNVRuJwRuUkK7Pz0h/TgAAqCTxna5APrljQmLHvpdtovRMTBNOBjsopp8T6mOxDmav+4l7mLrudOrJy6YAWYCxBEgUAj04CWTwPfEAXgvBAA="}
import { Base, createContext, subscribeContext } from '@studiometa/js-toolkit';

interface GroupApi {
  join(peer: Base): () => void;
}
const DisclosureGroupContext = createContext<GroupApi>('disclosure-group');
// ---cut---
class Disclosure extends Base {
  static config = { name: 'Disclosure' };

  group?: GroupApi;

  mounted() {
    return subscribeContext(this.$el, DisclosureGroupContext, (group) => {
      this.group = group;
      const leave = group.join(this);
      // The teardown for *this* value.
      return () => {
        leave();
        this.group = undefined;
      };
    });
  }
}
```

- **The trigger is the mount announcement**, not a broadcast from the provider, and it runs after `mounted()`.
- **A new answer replaces; it never accumulates.** The teardown runs before the next _different_ value and on unsubscribe. An identical value is not an answer.
- **The registry holds nothing.** A subscription is anchored on its consumer element through a `WeakMap`, and the iterable index holds `WeakRef`s that the sweep prunes.
- Callback and teardown failures are isolated, so one consumer cannot stop the shared sweep.
- Two `contains()` calls bound the cost per mount. A mount that changes nothing checks nothing.

## Groups of peers

`createGroup()` holds a `Set` and a `Signal`. It names no group and resolves no scope — the coordinator owns the membership and gives out the ways in:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"655c12f81c76d15623983338eafed9979fab53c96eb553db901307ed2b48ba03","data":"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"}
import { Base, createContext, createGroup, type Signal } from '@studiometa/js-toolkit';

interface GroupApi {
  members: Signal<readonly Base[]>;
  join(peer: Base): () => void;
  open(peer: Base): void;
}
const DisclosureGroupContext = createContext<GroupApi>('disclosure-group');
// ---cut---
class DisclosureGroup extends Base {
  static config = { name: 'DisclosureGroup' };

  #peers = createGroup<Base>();

  api = this.$provide(DisclosureGroupContext, {
    members: this.#peers.members, // the members to read, in document order
    join: (peer: Base) => this.#peers.join(peer), // returns the leave function
    open: (peer: Base) => this.open(peer), // the invariant stays here
  });

  open(peer: Base) {}
}
```

- `join()` returns its own `leave`, so a member that moves to a nearer group leaves the old one first.
- Scope comes from nearest-provider-wins, so a nested group takes its own members only.
- **The membership is a value.** A coordinator subscribes to it and re-checks its invariant on each change.
- **Document order is the tie-breaker**, so the markup decides which peer keeps its state.
- Nothing sweeps disconnected members. The teardown of the member removes it.

## How the mechanics work

The consumer dispatches a bubbling, **module-private** `js-toolkit:context:request` event carrying a key, a callback and a subscription marker. It is deliberately not part of public `EVENTS`. The nearest mounted provider answers and stops propagation. `provideContext()` replays the requests that have no first answer yet, which is what makes mount order irrelevant. `injectContext()` and `$inject()` are one-shot.

Outside a component the same three functions work on a bare element:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"a4afdc2f6fd701f6bc05a43918ff6863c2db6cccbf30348cac28d2cebb2fcab6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAiIEMAbAVxiJ2YPgFsARmUog2XUg0QAOKjxhgA5mnxIArFTRz1MBSG79cKgJZhciAAxVG+OV0Y1ySgL4V02WwWIpfToTZlYOKEs4LAg4QXYACgBKdgBeAD5OCEsoaVl5JABGPRBVDS0kAHZ9Q2M8SOjYi1LrWwcQJxc3KURi718cPEIScmD6PATeSy44FKxSYhyYAGEWGnoAHhEJMnSEmB4hAFFVUTU0CnYAaxgMIVWwdbQAaVutsUlSdMuzASFtz5JITAAA6YHYEM4vD+wg+ZAA3GDIewGjE4kJkmlMkRslBEWBPGDLKIYvJ2PNFrAHk9pFAIIwEIgQAAFBZEJbsLhQ8ycMjiLhoYnsABmEFInPYcD44jQpBgMAAdOwACr4GDCGByeAcCns2DigDu1jgCukBnUjOQyBaYCu0nwaDQWDgiAA9K6AFZwAC0aAgEB4V0saG9RAALAq2HxIhAzgYFbAiK6uFhLK6wk9XbqltSQgqHaIeCAALrFqj5BQAJmqpTUmm0vTDNVIRhM2apaxC0h4rSQ7U6pFc7iQ1f61D8Q0Co2oXaZYTY7AOQgAEsqALIAGROMDOjzyBgKiDDlZUdYqiBP1FqJgO3d79kczkH3Q8x7HmEGTOGQRn4znLAXV47nYXN6CA94di+fc5AUMMADZT3KBsAGZm1bPAgLvGw+0fLphyPOD3wnL8pzNWcOgAnUFlEKJ4lZWNaIgz50mgw84KbWskKqNC6iZCkaLiLDbEKXDn3wxQiM/AIRjIv8KPCdhGC4MBGCXRIUgyLIclYhRKlQzj6yQBCrxbXiOmU1SiysbDelEocekKSpJP8b9pxpJlJh7GYUmsD0YDcUC0CY3Z9kOdht13C5rlue5OzAt4AV2IF2FBcFIX42ihHogSYGCr58WRJSVLUzFNJxHJ8UJMBiVJDhfP8tBAtpelGRAAAleAAxIdgtHVGwtQXdsYCgbkBBFMV2AAAxuDBJsuSADXYCaDTVcEuSG0gwRTHA5BNFV8Cidg5QARwEBdDpYGBvTgQg0CEXqRUsUgF2UuADTISVjDQVQ4B6tVyWo2jOTAKAwTlURAl+h6TrOtAFTBMFVXVDK4klAwMF+nAQesdR2BWyxVGECAAcpD66CiNA9smorLOSSajp3SG/oFMEsciDQGdO7VgZGul4CJrQcc5YV3GB4G3rIU0agtJArRtO0qAdJ0XXdL1fX9QNg1DCMoxjOMuATGAkxTNMMxCV16oCuK4YLItS3LA8FEUDiykM3p9IPdCmUtxrraEoo7JfEcJJ8ccpNc2TQkoxcwtXTcIvOHSkAATmUAzz0vT2zNvazhMD/C31Dj8XNIsYo4UoDYseEJwMSqCHZgoo7EvV3zw968MNuf3bI6J97NfQii+I6Sf3c+SF1ELgMEkf44XFAAfdg+BBmBhVaXIG8PQpChds8GxKLOTEn6fmh7GzLwHfujOcycZLLiYpm89gfcCgBlDAVLyvY1ITx5LhmquTxa5z3SMlOu7BF7L1gGvGwoNqokjFHVMAfkrbV3oO/FSzUGR4A6nALq6oHr9TlINNkSwRq/HVHAD+TgFiQD4HAHgGBLgTTlGgPgpBwSTSgavdek0pZXhliga0Z8FYEEdM6N0nofR+gDEGEM4ZIxsL1sYA2iZkypnTNbC2yCGpv2ofmNAhYSxlhkI7IolYW57yKDWQ+eAX7WwwYwbuF8+5B0bDfEid9fzlwXGpOOW5TiJ03goHe7RW4Nkzh3JkOcbS2BcXhHoyFKweJHm5ci84OCVxAtbYBkEWLBKKGGXeXFEDt1MiYTCucRz50SYRExzBYBMGjsAUaMBLioiaOwTwaQSZ6hWNbUKlwgKXGPEkfEGSUokxypcGmBwuk9PsWgtAgz2BATGWCCZx9JALJ0agp4jiVlrPhNIfWSBQAhDUHASwLA8CUxAJ4TwQA="}
import {
  createContext,
  injectContext,
  injectContextSync,
  provideContext,
} from '@studiometa/js-toolkit';

const Key = createContext<number>('key');
const el = document.body;
// ---cut---
const { value, dispose } = provideContext(el, Key, 42);
const { promise, cancel } = injectContext(el, Key);
const maybe = injectContextSync(el, Key);
```
