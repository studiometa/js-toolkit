# Transitions

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b3352a3e41525528b2094ef9c6cbcddbe6bd4c30bf080c65e3c7f93d7425d706","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvGGBqkAKqWZg47cZMYxWiXgAl5AWQAyAUVYwAtjLQVeELOpU7Fy1Y4DyDiSu46ACqQQFuxwMAA8RBDsUAB8ADpg7BZYEKRo0rJkLipq3pQgUBAiCIggAErCvGj4MBlyVUo5jnZSytLmVrIAdAkJ8jV2WClutVDspDBi3gDkcLwABmgQ87wirFyhc8wTq+bbMFAC43BoOgDuavgL1mQA0jAwWCupCfN7JPePK9UwGLz7vBO7FYrBaVQGWks1gEgQs4Nq6xODVcuUktmUh2YryWKxOzBovHM/HSACMYPh2GBDvx2ABzfBoOY/Fq1MmU2n/IYcA5dfJoZi0krIZAgDhgADW+QZaCwcEQAHp5QArOAAWiWEFY4rUqqIABYuidBGMgjB+V1YER5YJxKw4PK0I03N44F0GRZWABiG5pJ2osAgAC6gaoeLSSAAnFRzGBadUkABGACsVH5pFpZrwPuyzsk+TFuEQAAYqCJ8NtmGIyJGAL4UdDYQsEYjV1N0BilFgcLh8ISiZrvGA5/2abR6QymDrWWz2Rxy3jDjxeSQ8fywkLhSLReKJZKpdKDxd5KiFYp4CpSZmD5FNbxgtqQzpoXmpgVCkViyVUaWyhXKtUalqOr6oaaDGhIVjmpa1q2vajoonObpoB6nqDvBt55sGoZph2ABMABs0YyHG+CJim1DbBmHaijAzAkEeebRpShYliAZYVlW5CIARdYNjgeCECQ5BtvQTBsJwPACMIUySDeuZgKOOj6MYZhQrIthgMwVjuKQADKmDmPOJykOyvAAD4Ln6jj6Rghm2BY0AwAA/DocQgOKDxYG55m8G5EwOSQbm+LwARBBuERRLECRJCkaRyf6+SniU5SVMwvAAMK6bp8XNLJD5Tt0vRgAAgjld5hjQhxnBS5j/JAPykCyvCkMIcyycycBabUj7QpScgtQ4cDRac8K8H1ZADZVTX+S2czVfiY3pMwXLsAcdWHBMcCaiQcC2Ft/yrGw5ikAkzBnMwuSxotY1zGAMBCYSMDErw52XRy/CpHVGRVRSZYvcCoL1aspovhRgpIMKIBYBWFj5A5sC8AA6jUDWjYsyyAvyBIhLwHkOHYjUzSQmLpMyMhQLyIYfpSX4EGgMpyoqKrqhAmramguoGkaJqQcwFr3TBwJwVZLpISh6HyUGIYgBVSB6gAzERsbxogCasWmVF4BLCVMXdSCsexSicXL8s1tLIiOXgMX7rwwB1FkItoo9dFDo7YC2NrzQ1jCQS8NMAAC3MQWazD/izbPAXqgt2tMADccMh0goDtjIqh5qUKogDWNZAA="}
import { enterTransition, leaveTransition, transition } from '@studiometa/js-toolkit-v4/utils';
```

Promoted into core from the migration set, beside the easings, `spring()` and `smoothTo()`.

[[toc]]

## transition

```ts
transition(
  el: HTMLElement,
  nameOrStyles: string | TransitionStyles,
  mode?: 'keep' | 'remove',
): Promise<void>
```

```ts
interface TransitionStyles {
  from?: string | string[] | Partial<CSSStyleDeclaration>;
  active?: string | string[] | Partial<CSSStyleDeclaration>;
  to?: string | string[] | Partial<CSSStyleDeclaration>;
}
```

The three-state dance every CSS transition needs, with the frame boundaries in the right places:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b3e1a13fcd5bb55f39bc7848470b4a5be2ca5fdd31c5a795c399ac9e79f05811","data":"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"}
import { transition } from '@studiometa/js-toolkit-v4/utils';

const el = document.body;

async function run() {
  // The class form: `fade-from`, `fade-active`, `fade-to`.
  await transition(el, 'fade');

  // The inline-style form.
  await transition(el, {
    from: { opacity: '0' },
    active: { transition: 'opacity 300ms' },
    to: { opacity: '1' },
  });

  // Keep the `to` state when it ends.
  await transition(el, 'fade', 'keep');
}
```

`mode` decides what happens at the end: `'remove'` (the default) clears the states, `'keep'` leaves the `to` state applied.

Each of the three states takes a class name, an array of class names, or an inline-style object — [`setClassesOrStyles()`](./css.html#setclassesorstyles) is what makes that work.

## The two directions

```ts
type TransitionOptions = {
  enterFrom: string;
  enterActive: string;
  enterTo: string;
  enterKeep: boolean;
  leaveFrom: string;
  leaveActive: string;
  leaveTo: string;
  leaveKeep: boolean;
};
```

One option object, so a component declares eight options once and both calls read the same thing:

```js
await enterTransition(this.$el, this.$options);
await leaveTransition(this.$el, this.$options);
```

### enterTransition

```ts
enterTransition(el: HTMLElement, options: TransitionOptions): Promise<void>
```

### leaveTransition

```ts
leaveTransition(el: HTMLElement, options: TransitionOptions): Promise<void>
```

### TRANSITION_OPTIONS

```ts
const TRANSITION_OPTIONS: Record<string, OptionDefinition>;
```

That option set as a `config.options` fragment, ready to spread:

```js
static config = {
  name: 'Panel',
  options: {
    ...TRANSITION_OPTIONS,
    open: Boolean,
  },
};
```

Which means the eight names, their types and their defaults are declared in **one** place, and a component that wants them writes one line.

## Testing them

::: warning A transition's end state is asserted by polling, never by `settle()`
A method that starts a transition does not hand it back, and a kept end state lands only after `nextFrame()`, the `from` and `active` states, and either a `transitionend` or one more frame. `settle()` is generous rather than deterministic, which is a flake that passes alone and fails under load.

**Polling for an _absence_ is wrong** for the mirror-image reason: `leaveTransition()` clears the other direction's `to` state **synchronously**, so the poll passes before anything has happened.
:::

See [`waitFor()`](/api/test/#waitfor).

## What is not here

Time-based playback, stagger, sequencing, morphing and text splitting are the separate `ui-animation` package. `tween` and `animate` are not shipped.

`exit`, `layout` and `layoutId` are not an engine's job — [`viewTransition()`](/api/scheduler/viewTransition.html) solves them, and it is in core.
