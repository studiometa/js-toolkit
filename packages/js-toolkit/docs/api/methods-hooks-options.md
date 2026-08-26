# Options hooks

```ts
option<Name>Changed(change: OptionChange): OptionChangedReturn
```

A declared method named after an option makes that option a **live effect**. A component without the convention pays no setup cost and reads its options directly.

[[toc]]

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"094eee5fd08ec2ab17ff6865aed392c6656d3cf1598041c33edd98e4646233cd","data":"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"}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"0bb64e793a298a46e8f7f4681da53ad5ae44adcbbf73df3fc7b2a08cae3775b0","data":"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="}
import { Base, type OptionChange } from '@studiometa/js-toolkit';

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
