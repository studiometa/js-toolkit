# Transitions

```js twoslash
// @twoslash-cache: {"v":1,"hash":"7d5c92c816440f40503399129cef0568cc7cf850a1cab25e6e59e1e0c66c16e7","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvGGBqkAKqWZg47cZMYxWiXgAl5AWQAyAUVYwAtjLQVeELOpU7Fy1Y4DyDiSu46ACqQQFuxwMAA8RBDsUAB8ADpg7BZYEKRo0rJkLipq3pQgUBAiCIggAErCvGj4MBlyVUo5jnZSytLmVrIAdAkJ8jV2WClutVDspDBi3gDkcLwABmgQ87wirFyhc8wTq+bbMFAC43BoOgDuavgL1mQA0jAwWCupCfN7JPePK9UwGLz7vBO7FYrBaVQGWks1gEgQs4Nq6xODVcuUktmUh2YryWKxOzBovHM/HSACMYPh2GBDvx2ABzfBoOY/Fq1MmU2n/IYcA5dfJoZi0krIZAgDhgADW+QZaCwcEQAHp5QArOAAWiWEFY4rUqqIABYuidBGMgjB+V1YER5YJxKw4PK0I03N44F0GRZWABiG5pJ2osAgAC6gaoeLSSAAnFRzGBadUkABGACsVH5pFpZrwPuyzsk+TFuEQAAYqCJ8NtmGIyJGAL4UdDYQsEYjV1N0BilFgcLh8ISiZrvGA5/2abR6QymDrWWz2Rxy3jDjxeSQ8fywkLhSLReKJZKpdKDxd5KiFYp4CpSZmD5FNbxgtqQzpoXmpgVCkViyVUaWyhXKtUalqOr6oaaDGhIVjmpa1q2vajoonObpoB6nqDvBt55sGoZph2ABMABs0YyHG+CJim1DbBmHaijAzAkEeebRpShYliAZYVlW5CIARdYNjgeCECQ5BtvQTBsJwPACMIUySDeuZgKOOj6MYZhQrIthgMwVjuKQADKmDmPOJykOyvAAD4Ln6jj6Rghm2BY0AwAA/DocQgOKDxYG55m8G5EwOSQbm+LwARBBuERRLECRJCkaRyf6+SniU5SVMwvAAMK6bp8XNLJD5Tt0vRgAAgjld5hjQhxnBS5j/JAPykCyvCkMIcyycycBabUj7QpScgtQ4cDRac8K8H1ZADZVTX+S2czVfiY3pMwXLsAcdWHBMcCaiQcC2Ft/yrGw5ikAkzBnMwuSxotY1zGAMBCYSMDErw52XRy/CpHVGRVRSZYvcCoL1aspovhRgpIMKIBYBWFj5A5sC8AA6jUDWjYsyyAvyBIhLwHkOHYjUzSQmLpMyMhQLyIYfpSX4EGgMpyoqKrqhAmramguoGkaJqQcwFr3TBwJwVZLpISh6HyUGIYgBVSB6gAzERsbxogCasWmVF4BLCVMXdSCsexSicXL8s1tLIiOXgMX7rwwB1FkItoo9dFDo7YC2NrzQ1jCQS8NMAAC3MQWazD/izbNqILdrTAA3HDIdIKA7YyKoealCqIA1jWQA==="}
import { enterTransition, leaveTransition, transition } from '@studiometa/js-toolkit/utils';
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
// @twoslash-cache: {"v":1,"hash":"3c691516325916983ac0e2cffe0936886fe8855ab6bb1395abb83892f65832f8","data":"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"}
import { transition } from '@studiometa/js-toolkit/utils';

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
