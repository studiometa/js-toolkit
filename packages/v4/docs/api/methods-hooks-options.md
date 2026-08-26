# Options hooks

```ts
option<Name>Changed(change: OptionChange): OptionChangedReturn
```

A declared method named after an option makes that option a **live effect**. A component without the convention pays no setup cost and reads its options directly.

[[toc]]

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"ba70fb2a1f7698f89b8c706175f61c4b4066add969bea6626cd95fbfa93b2b15","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

function connect(url) {
  return { dispose() {} };
}

class Feed extends Base {
  static config = {
    name: 'Feed',
    options: { source: String },
  };

  optionSourceChanged({ value, previousValue, initial }) {
    const connection = connect(value);
    // The cleanup for *this* value.
    return () => connection.dispose();
  }
}
```

The method name is the option name in pascal case: `dragThreshold` is `optionDragThresholdChanged`.

## The payload

```ts
interface OptionChange<T = unknown> {
  name: string;
  value: T;
  previousValue: T | undefined;
  rawValue: string | null;
  previousRawValue: string | null;
  initial: boolean;
}
```

| Field              | Meaning                                               |
| ------------------ | ----------------------------------------------------- |
| `name`             | the option name                                       |
| `value`            | the parsed value now                                  |
| `previousValue`    | the parsed value before, `undefined` on the first run |
| `rawValue`         | the raw attribute string, `null` when absent          |
| `previousRawValue` | the raw string before, `null` when it was absent      |
| `initial`          | `true` on the first run of a mount cycle              |

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"4cd88625ab83348c1d21a249c933001c3d5b10c5e831316ca6237daa3601aacf","data":"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"}
import { Base, type OptionChange } from '@studiometa/js-toolkit-v4';

class Feed extends Base {
  static config = { name: 'Feed', options: { source: String } };

  optionSourceChanged({ value, previousValue, initial }: OptionChange<string>) {
    console.log(value, previousValue, initial);
  }
}
```

## The return value

```ts
type OptionChangedReturn = void | (() => void);
```

Return a function to release what this value acquired. The previous cleanup runs **before** an update, and every active cleanup runs on `$unmount()`.

## When it runs

- **Before `mounted()`**, on each mount cycle, with `initial: true`.
- On an attribute change, once the batch is processed.
- On a **breakpoint crossing** that changes the resolved raw value.
- Removal of the attribute applies the declared default, which is a change like any other.
- A new mount starts each effect again with `initial: true`.

## Coalescing

Several writes to one attribute in one batch give **one** change, from the first old raw value to the final DOM value. A write that ends where it started is **not** a change.

The comparison uses raw strings, so a breakpoint crossing and an attribute write are the same kind of event. A crossing to the same resolved value announces nothing, and a write to `data-option-columns:s` while the viewport is at `l` announces nothing.

## What it costs

**A `matchMedia` subscription opens only for a component that declares one of these hooks.** `$unmount()` releases it. A page that only reads options holds no listener at all.

## Not for arbitrary attributes

This hook is for **declared options**. For an attribute the framework does not read, use [`watchAttributes()`](/api/dom/watchAttributes.html), which shares the same coalescing rule and the same batch.
