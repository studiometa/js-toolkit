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
// @twoslash-cache: {"v":1,"hash":"f65fcfcaecb1b7e2e2b514d328cd5f1804ff23c2894212e46750a52135b94aad","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGC8zaoA0jAYjOGRaAD8iLz9GNJuI9wTAMpkROz8UlOG2mYW1rb2PTBTTlAQ/AgxAKqqvJ0wvADWA7yqpCtrvDikvMNRAHS8ABEYI1mM1WGgRGgIN98HcTvxmpZfGhfk4XG5ogBGACs3l8ASCiAAbGFZlE8Acjgkkkg0iAMlkcpVEDiiiUcHhCCRyGF5HhBMJAZxWBA/GjwtEibiQD5/IEkCTqGToiAAcLRU4ODTEAAmdKZUjZXIKtnUUqcio86h8mIsDhcPgCuDKCQyOT0XxKBzqTTaXh6OKbEzmKw2Oze8UYpAADjpsoJIVJEXJMTimsSyT19INRuZOsxpswHJiXMqvJqtqwvrImD4arYot+/E6jXYfgmwHMvG7vDAzCRExcpESfgA3OYCpH3PlFfH5cSkyN+S22+ntQBmfWM435QvmkuWqo2kCMKtaGsYPh9gfPNDD/xTrEpADseLlhNCSuTKuv8RlGaQTds23PMUj3Ytym5I8KxPJFAmgOt1T8X5LAgVoaCgRh5l4C4wDgZoACM4H4YcCL/eFzhAAAZdhGhgfgMEEO5CAge4KF4JFmDAewoV4Mibm5YcoFgMB/gAWWYDBeFIKJmlILpmAEHwuOaLAmladpOnMRhbF4Li9NIQ0pIgRoYRgSw+ECZh7FIVoRE6Mze3kXgAAMABJWlQ9CsJc3hABQCZ4MDaG5SHMLggv4RBzC7HtwuCrzuJgTC+E7Loe27Zs8PsOA2z7Vh/T0gB3Zh2B4/B2DgX43MSAArei0EYBYICRABhTpqjQbhxzS9KZLQOSuhyvw8t+fCiJI9gyMYRgiDYZoYD4HRjF4YBeEAMgJeAKLqYu7AporAABBARmpsJJuPdBQoBHPSOPYWhEmk2T5JEQrMnsUqLs9EQG38XhCtK/BeFKuBzAgQqwHYh6uKkpIXBHKKwB2ji0MS5KVqR7s+oG3hkHwz4UJRjCsPYrD/WW1aNoKABdbr0snKh0WnTEdWjN8E0QV8vyXGIEowtdkmlBlDSZPIdXAspSytDrantBpKQGIZlXGSYBhmb9sKWV5VnWAYg22UM9m6PoBmOU5KKuO5bgeJ4XjeO5Pm+ZV/iBEEwQhb5oUCOFTkRZFUQZiUkBxTE2fnRUfhVeWMH5hUt2FndMQLYozQgyXoJVRg4MIKA+E1u3JA2X04HYogIHYKBjFGwjiNImBGH4NhWAI7J7kWZZtZaxvm/4e4C91ouS7Liv2K0NAOjw5WFmriayIAeSwMfOh4CZcLGmvJvIs28Cn8ba49xzbe19jGbH36PtooH7GKkRIBs1oLH8f2lT8c5kGQEAseepxV+n2v/mkWEzx27vBcEYP6ANL4iCEC4Z4v8N6kFRFTKmAcowsiJHGfE84vBcxTM4OBZEY4LmAvHUC4sLRQXLBnLAWQ4JkD4AAUQWC1CYBEIAQGUmAR8QdnxATnISICEc8CMJaoQxUQtcx5HXOuMhB4KHWhgqeGhUQ6FAzgACMGYAWFsI4Vwlkz5WYykwYScOyo8AVXUeDURccJGAWjDIyCZZ5FUKUbkBhTCtHsJgFxXROoUi8KMYBRcuDhGEM5uIkWQcwLJyLBLQ8lCmDUMNLQ0gfBzEaI8TolB058wYPfLHHBKo0mWOpMkMJOYIl6PsWneJlZqx2EvN6SQgYi6VzcjAVgEwAAS0gxJUXoT4JE3EfE6n8XkxAAjTExDaawUJ1iKnriieyWJcjpa2izghXg/TzJ+xkqhEgB00B3kms0GgjAACOzQ6itiSgAOX7DAQcRz/DYVLuXU2Zw8AALuFswZ9h1lQF4AAKkBS5XZFQDlHIIicuu3AXLAsens+AjlrKQuheAwIB8cD8FouwJKvZ7lNE0JYRy7TtncV+PtZAYkAQ3N4AAJWBGQXwawqaMHwIc7QiAAD0XLYAkBFPjVCAAvdgrAhC/FsH4XlZsuUAHUYAES5QdNQABJLlPzkRcrBfsw5pFoXcGGZzPhQdpSCJiNqmAEK9U0FmcQmx4zgjU3SNAMoBtwyrTiOxKOm1CXNV4AAcgAAIuGaFdZqURmBcpqnAAAtFCdh9xSoxqIMEf13VzBOhEPWEUfhPqKBdNcVK3Z0Rj34MdMArZc16FWr+CY/rs2in9ZtdNaVeZJVJkWnsn8uhRywlXXeG9pqrWEZDNRGjNqLXJhjIGplGDCN4AAMgXaoixYBLLlUqtM34FqrXHNOf6qA1lmAxtHuPE9OAwD+u2j1CdtNNoTicHBZgSBQDyF8DlToeBo0gAKAUIAA==="}
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
