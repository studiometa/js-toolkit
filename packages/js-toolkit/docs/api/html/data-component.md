# `data-component`

Declares which components run on an element. **The instance exists because this attribute is here and the name is registered.**

[[toc]]

## One component

```html
<div data-component="Slider"></div>
```

The token is the component's `config.name`.

## Several components

The value is a whitespace-separated token list, and each token gets its own instance:

```html
<a href="/next" data-component="Action Analytics Prefetch">Next</a>
```

The instances are independent. They share the element and nothing else.

## On native elements

`data-component` improves a native element rather than replacing it:

```html
<form data-component="Fetch">…</form>
<details data-component="Disclosure">…</details>
<a href="/page" data-component="Prefetch">…</a>
<tr data-component="Row">…</tr>
```

## Nesting

A nested declaration is discovered by the same registry, on its own. Nesting is DOM ancestry, never ownership:

```html
<div data-component="Accordion">
  <div data-component="AccordionItem">…</div>
  <div data-component="AccordionItem">…</div>
</div>
```

Unmounting the parent does not unmount the children.

## Responsive declarations

One breakpoint-scoped companion attribute exists, with the spelling of responsive options:

```html
<div
  data-component="Action Analytics"
  data-component:xxs="MobileMenu MobileSearch"
  data-component:m="DesktopMenu DesktopSearch"></div>
```

- The plain token set is **always active**.
- At the active breakpoint the registry walks from the widest active suffix **down** and takes the first attribute present.
- That value is the **complete** responsive set. A wider value **replaces** every lower value; it does not merge with it.
- An empty value is a **stop**, so a name can be removed above a breakpoint.
- The effective declaration is the **union** of the unconditional set and the selected responsive set, without duplicates.

`TabletFeature` below runs at `s` and `m`, and is removed at `l`:

```html
<div data-component="Base" data-component:s="TabletFeature" data-component:l=""></div>
```

### What a crossing does

A crossing compares the effective set against the element's current state:

| Case                      | Effect                                                                |
| ------------------------- | --------------------------------------------------------------------- |
| a name is in both         | it keeps its controller and its instance — nothing happens            |
| a name is no longer there | `$unmount()`, then the instance is dropped from the element           |
| a name is new             | the normal pipeline: mount strategy, `data-mount`, lazy entry, events |

A crossing back gives a **new** identity, because the DOM stopped declaring that one. An inactive lazy declaration imports nothing.

Connected elements with a scoped declaration share **one** reference-counted `useBreakpoint()` subscription. A page with plain declarations opens none. Breakpoint work runs through the background lane, so `whenDOMSettled()` covers the teardown, import and mount work of a crossing.

::: warning A suffix must name a configured breakpoint
An unknown suffix is ignored with one `responsive.unknown-breakpoint` warning. That includes the v3 list syntax `data-component:xxs:xs:s`.
:::

See [`setBreakpoints()`](/api/dom/breakpoints.html).

## Changing it from code

The attribute is live. Adding a token mounts a new instance; removing one unmounts and drops it:

```js
el.dataset.component = 'Slider Analytics';
await whenDOMSettled();
```

## Where the instances go

Each instance is published on the element under `Symbol.for('@studiometa/js-toolkit/instances')`. That map is not public API — [`getInstance()`](/api/registry/getInstance.html) and its three siblings are. In a console:

```js
$0[Symbol.for('@studiometa/js-toolkit/instances')];
```
