# Transitions

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b3352a3e41525528b2094ef9c6cbcddbe6bd4c30bf080c65e3c7f93d7425d706","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvGGBqkAKqWZg47cZMYxWiXgAl5AWQAyAUVYwAtjLQVeELOpU7Fy1Y4DyDiSu46ACqQQFuxwMAA8RBDsUAB8ADpg7BZYEKRo0rJkLipq3pQgUBAiCIggAErCvGj4MBlyVUo5jnZSytLmVrIAdAkJ8jV2WClutVDspDBi3gDkcLwABmgQ87wirFyhc8wTq+bbMFAC43BoOgDuavgL1mQA0jAwWCupCfN7JPePK9UwGLz7vBO7FYrBaVQGWks1gEgQs4Nq6xODVcuUktmUh2YryWKxOzBovHM/HSACMYPh2GBDvx2ABzfBoOY/Fq1MmU2n/IYcA5dfJ4tJIACcVHMYFp1SQAEYAKxUNDbWkwBilG4KRpuPIiym4RAABioInw22YYjIQoAvhR0NgdQRiGa5XRlSAWBwuHwhKJmu8YNkNRotDp9MYzFDZLZ7I44M51aiwJ4o75eAEgiFwpFovFEslUukfX64/lCsU8BUpMyfcimt4wW1IZ00LyqPzlQAmABsIpk4vwUtl1AVSrw+djjnyHDAOv1IENxtN5EQHct1pweEIJHIjvoTDYnB4AmEU0kVf9YE02j0hlMHWstjAzCs7lIAGVMOZo4C0KR2bwAD68AtHFfDB31sCxoBgAB+HQ4hAABrB4sFgv9eFgiZwJIWCkxTYJQgiKJYgSJIUjSE9CyoYsSnKSpmF4ABhZ9nzI5pjzrG9ul6MAAEFmJrFsDl4M4KXMf5IB+UgWV4UhhDmY9mTgB9anraFKTkaSHDgIjTnhXhVLIdSaEOSRanQ+05iE/FdPSZguXYASMSk+AIFYEg4FsOAIH+VY2HMUgEmYM5mFyMUrN0uZJw3QkYGJQSgvEEL+FSUSMkOIT2ENQTgVBMTViCGAmwHWkSmQZAQCwY0LHycDYF4AB1GpxJ0xZlk/fFahCXgEIcOwJNMkhMXSZkZCgXkAF1RubeUBUQAAWABmLsxQlRBJWnKbFWdL8UTHLVJyQadZyUeckHm80JpnCC8GI3NeGAOoslHbxbBHbant449zRhIJeGmAABE5BDGPL5QAegAKzgABaJZnLgtRIaIGaQcEcRWDgaYAG4qqVZgkFAJ0ZFUSQ8AhkBzXNIA==="}
import { enterTransition, leaveTransition, transition } from '@studiometa/js-toolkit-v4/utils';
```

Promoted into core from the migration set, beside the easings, `spring()` and `smoothTo()`.

[[toc]]

## `transition`

```ts
transition(el: HTMLElement, nameOrStyles: string | TransitionStyles, mode?: 'keep' | 'remove'): Promise<void>
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
// @twoslash-cache: {"v":1,"hash":"f7974e360499fb4e1289aa9837b82f4286bf1e5a7ff2593ac55b03ba96faf66e","data":"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A==="}
import { transition } from '@studiometa/js-toolkit-v4/utils';

const el = document.body;

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
```

`mode` decides what happens at the end: `'remove'` (the default) clears the states, `'keep'` leaves the `to` state applied.

Each of the three states takes a class name, an array of class names, or an inline-style object — [`setClassesOrStyles()`](./css.html#setclassesorstyles) is what makes that work.

## `enterTransition` and `leaveTransition`

```ts
enterTransition(el: HTMLElement, options: TransitionOptions): Promise<void>
leaveTransition(el: HTMLElement, options: TransitionOptions): Promise<void>
```

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

The two directions, from one option object — so a component declares eight options once and both calls read the same thing:

```js
await enterTransition(this.$el, this.$options);
await leaveTransition(this.$el, this.$options);
```

`TRANSITION_OPTIONS` is that option set as a `config.options` fragment, ready to spread:

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
