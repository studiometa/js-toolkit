# useKey

```ts
useKey(target?: Document | Element | Window): Service<KeyProps>
```

The keyboard as a service, one instance per target, defaulting to the document.

## Props

```ts
interface KeyProps {
  readonly event: KeyboardEvent | null;
  readonly triggered: number;
  readonly isDown: boolean;
  readonly isUp: boolean;
  // plus one boolean per named key
  readonly ENTER: boolean;
  readonly SPACE: boolean;
  readonly TAB: boolean;
  readonly ESC: boolean;
  readonly LEFT: boolean;
  readonly UP: boolean;
  readonly RIGHT: boolean;
  readonly DOWN: boolean;
}
```

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"80cad821b6c7252a115d1a888d1131f61d38dc0d5dd9c58540cbcb2d15037ef9","data":"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="}
import { Base, useKey } from '@studiometa/js-toolkit';

class Dialog extends Base {
  static config = { name: 'Dialog' };

  mounted() {
    return useKey().subscribe(({ ESC, isDown }) => {
      if (ESC && isDown) this.$el.removeAttribute('data-option-open');
    });
  }
}
```

A region rather than the document:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b8590c3f281df475a444ac4c4ac00466186621247358ce2dfbe0900594688db7","data":"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"}
import { Base, useKey } from '@studiometa/js-toolkit';

class Menu extends Base {
  static config = { name: 'Menu' };

  mounted() {
    return useKey(this.$el).subscribe(({ DOWN, isDown }) => {
      if (DOWN && isDown) this.focusNext();
    });
  }

  focusNext() {}
}
```

**An element target is what removes the `hasFocus` bookkeeping** a document-only service forces on a consumer.

## The eight names

The eight names of v3 are kept, resolved from `KeyboardEvent.key` rather than from the deprecated `keyCode`:

| Name    | `event.key`  |
| ------- | ------------ |
| `ENTER` | `Enter`      |
| `SPACE` | `' '`        |
| `TAB`   | `Tab`        |
| `ESC`   | `Escape`     |
| `LEFT`  | `ArrowLeft`  |
| `UP`    | `ArrowUp`    |
| `RIGHT` | `ArrowRight` |
| `DOWN`  | `ArrowDown`  |

The constant that maps them is **module-internal**: the names reach a consumer as props, so nothing is left to compare against. The flags are a mapped type over that constant, so the props cannot drift from it.

::: tip Why they are an exception
Props are flat and nothing derivable is a field — and each of these compares `event.key` against a named value, so nothing about them is unavailable from `event`. They are kept for call-site parity with v3, where `keyed({ ESC })` is how components read the keyboard.
:::

## `triggered` counts repeats of _one_ key

A keydown whose key matches the previous event's **while that key is still down** increments it. A different key, or any keyup, sets it back to `1`.

v3 incremented on any two consecutive keydowns, so holding `A` and then pressing `B` reported `2`.

## The listeners are neither passive nor capturing

- **Not passive**, because `trapFocus()` and every keyboard shortcut call `preventDefault()` on the event the subscriber is handed, and a passive listener cannot.
- **No capture**, unlike the pointer service, because a descendant that handles its own keys and stops the propagation is **respected** rather than overheard.

## Mixin

```js
class Dialog extends withKey(Base) {
  keyed({ ESC, isDown }) {}
}
```

`withKey` takes the document default too, as `withScroll` and `withResize` do for their own page-wide source. A region is `withKey(Base, { target: (instance) => instance.$refs.wrapper })`.
