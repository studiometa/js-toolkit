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
