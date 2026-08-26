# `data-option-<name>`

Sets the value of one declared option.

```html
<div data-component="Slider" data-option-speed="2"></div>
```

The name is the option name in **kebab case**: `dragThreshold` is `data-option-drag-threshold`.

[[toc]]

## An option's name is inside its namespace

Every declared option owns the attribute built for it, so `data-option-` is a namespace _family_ rather than a namespace. It is `data-option-columns:s`, never `data-option:columns:s`.

That is what keeps the page-wide `attributeFilter` precise: the set of names is enumerable _because_ it comes from a declaration, so no option costs a second observer.

## The five types

| Declared  | `data-option-x="…"` | Reads as   |
| --------- | ------------------- | ---------- |
| `String`  | `"hello"`           | `'hello'`  |
| `Number`  | `"2"`               | `2`        |
| `Boolean` | presence only       | `true`     |
| `Array`   | `"[1, 2]"`          | `[1, 2]`   |
| `Object`  | `'{"a": 1}'`        | `{ a: 1 }` |

A union is declared in order — `[Number, Array]` reads `"10"` as a number and `"[10, 20]"` as an array. Each parser must give a value of its declared type before the next runs.

An absent attribute gives the declared default, or the empty value of the first declared type.

## A boolean reads presence

The string the attribute carries is **never read**, the way `disabled` and `checked` work on the platform:

```html
<div data-component="Panel" data-option-open></div>
<!-- true -->
<div data-component="Panel" data-option-open="false"></div>
<!-- true — the value says nothing -->
<div data-component="Panel"></div>
<!-- the declared default -->
```

A template must write the attribute conditionally rather than interpolate a boolean:

```html
{# Correct #}
<div data-component="Panel" {% if isOpen %}data-option-open{% endif %}></div>
```

### `data-option-no-<name>` turns one off

```html
<div data-component="Dialog" data-option-no-trap-focus></div>
```

- It is how an option declared `default: true` is turned off, since removing an attribute that is not there says nothing.
- **Only an option that can hold `false` has one** — a declared `Boolean`, or a union containing it. A `String` option has nothing to turn off, so `data-option-no-label` is not an attribute and the observer never watches for it.
- **Presence is the whole statement.** `data-option-no-x="false"` is not a double negative; it is the same flag.
- **An option whose own name starts with `no` negates independently.** `noSort` owns `data-option-no-sort`, and its off spelling doubles the prefix, `data-option-no-no-sort`, so no attribute an author writes means two things.

The cost is paid by boolean options only: each adds its negated name, plus one scoped spelling per breakpoint, to the observer's filter.

## Every option is responsive

There is nothing to declare for it. **The suffix names one breakpoint and it cascades upwards:**

```html
<div
  data-component="Grid"
  data-option-columns="1"
  data-option-columns:s="2"
  data-option-columns:l="4"></div>
```

`$options.columns` walks from the active breakpoint down to the base value and gives the first attribute present. v3 spelled a set (`:xs:s`); v4 does not.

**The separator is a colon**, because an option name in kebab case can contain a dash.

### The negated spelling is responsive too

One cascade, from the active breakpoint down. At each level the value-carrying spelling is read first, then the negation, and the first hit wins — so a narrower breakpoint turns an option back **on**, and at one breakpoint an explicit value outranks a flag:

```html
<div data-component="Panel" data-option-no-x data-option-x:l="true"></div>
```

::: warning A suffix must name a configured breakpoint
An unknown suffix gives one `responsive.unknown-breakpoint` warning per mount.
:::

## Writing one from code

`$options` is read-only, so the way to change a value is to write the attribute — the same statement the markup makes:

```js
this.$el.setAttribute('data-option-speed', '4');
this.$el.removeAttribute('data-option-disabled');
flag ? el.setAttribute('data-option-open', '') : el.removeAttribute('data-option-open');
```

The next read gives the new value, and [`option<Name>Changed()`](/api/methods-hooks-options.html) announces it.

Several writes in one batch give **one** change, from the value before the first write to the value at the end. A write that ends where it started is not a change.

See [Options](/guide/introduction/managing-options.html).
