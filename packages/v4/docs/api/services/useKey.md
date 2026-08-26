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
// @twoslash-cache: {"v":1,"hash":"f65fcfcaecb1b7e2e2b514d328cd5f1804ff23c2894212e46750a52135b94aad","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XgAMy6YAefTAvC6qgA0jAMIw9gc0AB+RC8BEYaQLVHcTEAZTIRHY/Ck2MM2jMFnCdhh8MRThcbjwAFVVLwIj4cojeKpSKTybwcKReCiBvFeAARGAg5hdVhoES1cXeXgsrqWKJoRK7VLpTLZPJUApFOClCrVWr1RrNNodbq9fqDYajcYlAVC+AlWEwbHxAqWVjTWYgeaLRAARgArKt1pskAA2fX7Q4eP3YpzZL5XEA3O4PMhIWNvD44PA/Yu7f4eQTCGWcVgQFJOCMMRBJuNZBNbTup1F4aVNlvZs5fABM11upHuj2TZeon0rxGr1FrIBYHC4fHr/gcUlksUUygMmm0vD0xypJnMVhs9OOzNc7k86r3ASCIX4YRskWicj0HEcB6tQBpIBkWRnCaBCFMUZSVDUdQNE0LTtJ0PR9NqrqBO6EyhnMewdgAHHmaxgBsfY7GBaYdiAT6nOciBTvmM5zsWzFRoumAVt8q7kDW9BMFg55kJgfDDmwLbxD+YAguwKSYsA5i8KpvBgMw2qYp0pBnCkADc5gvG2RHLCmPYUYm/Y0YOdYRPJraMV8ADM06FvOzzccufG/IJdGMCJWhiRgfAaVp/JoLpFEmQsHZRhcADs8aWVRA7puAmknFBTGuax7kcROFxebxBD8X8QkeIw2GEFAEkjik8SWBA4I0FAjAErwbJgHAXQAEZwPwum9VlLKvgAMuwIIwPwGCCD4hAQDkFC8NqzAAaqw1ckEulQLAYBSgAsswISkAMXSkNCzC+DAa1dFgoLgpCETmIwti8Gt72kLOIQQCCaowJYfCbMw9ikOCIgRP96nyLwAAGAAk4JNS17Ww7wgAoBPyGAQlypDmFw2P8Ig5gqWpBM48j0QwG1fDKdCamqbJnT8gpGmsJe70AO7ME0arsCB8NnOU01oIwhL9AAwhEND0Nwhn0wzp3dBdLMpGzHR9QNQ0wIwjBEGwXQwHwOjGLwwC8IAZAS8C8cuk6pLwk2AACCoThP+MRAYoenvSt7C0GcvBK+d3W8Jztz2Lzx5KO9zYUaHTT4LwTRwOYECc2Ay0B2tISRJ0enE2Adsrc1VM02bReqUHKvID1oqNSXrXtct7WXqb5tWy8UzywzxmEbFJYTsRyWUUgSU2ellOtWOTHdgWs5Fk8E7FV8pW+euFWboCO4Mv6iLIniAwYliiK4rRHXEoKZIUoiN40vetj2JmTJUKN7KctyvC8iEXpXyKZDigfXUMo5QKiVCqCAUNNTamiKBZIaQIJGmgvkOCFoELWmQnaNCjpMIumYEMXCYwJg/3JHAX0jIMCBjQMGAi4ZTLRhjFGYeVlzISjok/DA08vjmTnuxJ4UYuLvCXCVKsAl17+WqtAPgF9vSSEpOeOAy0iAQHYFAYwGt+qDXYMNRg/A2CsF6vcHIRISRXwlnogx/AciyJvvIxRyjVHLS0GgKEcAj6Ek1po4aAB5LAziIg8ExF1HqGjtbPlZB4dxIStE+FVJsHwxCYDLXbN7Xmk0k72G5iISAoNwQWAorA8CKBMhV26k4IJHjtZSi8PEkxwpOhGHjpsdJIg/D2GCVraJpBEgzD7pGKMSYyK9mWGlOi7TPFZRzMmNy88PKFWXiuNeMt/JYDuNhMgfAACihIJaYl6shG6YAYp9ISrlciI9EC5VYXgLZEtOFTLyjMjizlnLzJ8muJZwlVkDHWUnOA0o05gF2fstaRy4oJSHhZc5LDAF4H5v89OdzrI8IXkgZyxFXmr3eRuAKXzHibO2UC+oBzQVIEKqcoZFyRnXO2YiseyKPLxQxSI8qyzcU/LhQCwlawQW9I7BOeKTC+zQtorCv5ALaXTN4SWBKTKyp+WEqJOwIUDySGvPItR8MYCsExAACWkAdMaGy1jQIYLy0lE5yUpVRVSjwmqQxOVHpKlFFyiqCJ4ivZl8rKoSNqrwI1AMdTxFOk1EgTtChDS6DQRgABHLogJ5LUwAHKZW0pFPSHUlEqLCa+apfrjU6hWgMGqvAABUJbYbBtXGGtNvVI0624LDMtgcAarhVOqEGNa62NMTnE/kOB+CTXYNTdSmVQSaEsFDLVAaYGO2QAdaUibeAACU5RkCiOSKYjAzTwRKMMLVQUulNQAF7sFYEIeItgUi7pfCUAA6jAXqJQnZqAAJIlH9SakolbQ3hq0XW7gJLmITjHmcqysYbUgG/TAatEaaASoeVKi5rRO7XGgCve+9JzbHGWuw62Y6wi8AAOQAAEMLOmwswK0SFbSoTaIR+W5gPyNikikQCCho7HHLvTeYzj+ChDkgpDm5swowExIRySzYUiEetgx+mk9qYtzporM6Kt2HtXUR07RjBzY3MzmK9O1tjZtwrknP6jAbm8AAGSWd+fCsAQN8D83iHaoNLaf2dqjYRqAINmBVCcVCPzOAwCEdtgrQz3drZGScBRpAoBjxwChHgSoIAXgvCAA="}
import { Base, useKey } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"b5dcd145a338d22e35caff747a178a30c382af20ebc843cccb70776a2c610492","data":"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"}
import { Base, useKey } from '@studiometa/js-toolkit-v4';

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
