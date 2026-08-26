# Transitions

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b3352a3e41525528b2094ef9c6cbcddbe6bd4c30bf080c65e3c7f93d7425d706","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvGGBqkAKqWZg47cZMYxWiXgAl5AWQAyAUVYwAtjLQVeELOpU7Fy1Y4DyDiSu46ACqQQFuxwMAA8RBDsUAB8ADpg7BZYEKRo0rJkLipq3pQgUBAiCIggAErCvGj4MBlyVUo5jnZSytLmVrIAdAkJ8jV2WClutVDspDBi3gDkcLwABmgQ87wirFyhc8wTq+bbMFAC43BoOgDuavgL1mQA0jAwWCupCfN7JPePK9UwGLz7vBO7FYrBaVQGWks1gEgQs4Nq6xODVcuUktmUh2YryWKxOzBovHM/HSACMYPh2GBDvx2ABzfBoOY/Fq1MmU2n/IYcA5dfJ4tJIACcVHMYFp1SQAEYAKxUNDbWkwBilG4KRpuPIiym4RAABioInw22YYjIQoAvhR0NgdQRiGa5XRlSAWBwuHwhKJmu8YNkNRotDp9MYzFDZLZ7I44M51aiwJ4o75eAEgiFwpFovFEslUukfX64/lCsU8BUpMyfcimt4wW1IZ00LyqPzlQAmABsIpk4vwUtl1AVSrw+djjnyHDAOv1IENxtN5EQHct1pweEIJHIjvoTDYnB4AmEU0kVf9YE02j0hlMHWstjAzCs7lIAGVMOZo4C0KR2bwAD68AtHFfDB31sCxoBgAB+HQ4hAABrB4sFgv9eFgiZwJIWCkxTYJQgiKJYgSJIUjSE9CyoYsSnKSpmF4ABhZ9nzI5pjzrG9ul6MAAEFmJrFsDl4M4KXMf5IB+UgWV4UhhDmY9mTgB9anraFKTkaSHDgIjTnhXhVLIdSaEOSRanQ+05iE/FdPSZguXYASMSk+AIFYEg4FsOAIH+VY2HMUgEmYM5mFyMUrN0uZJw3QkYGJQSgvEEL+FSUSMkOIT2ENQTgVBMTViCGAmwHWkSmQZAQCwY0LHycDYF4AB1GpxJ0xZlk/fFahCXgEIcOwJNMkhMXSZkZCgXkAF1RubeUBUQAAWABmLsxQlRBJWnKbFWdL8UTHLVJyQadZyUeckHm80JpnCC8GI3NeGAOoslHbxbBHbant449zRhIJeGmAABE5BDGPL5QAegAKzgABaJZnLgtRIaIGaQcEcRWDgaYAG4qqVZgkFAJ0ZFUSQ8AhkBzXNIA==="}
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
