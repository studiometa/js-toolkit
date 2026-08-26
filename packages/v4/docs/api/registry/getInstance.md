# getInstance

```ts
getInstance<T extends Base = Base>(el: Element | null, name: string): T | undefined
```

The instance of `name` on `el`, mounted or not.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"cc4f5e2f8d72bfff764bc550cec00a791fd4f3f5cc22348a02fa9dbae9b92e89","data":"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"}
import { Base, getInstance } from '@studiometa/js-toolkit-v4';

class Dialog extends Base {
  static config = { name: 'Dialog' };

  close() {}
}
// ---cut---
// `el` may be null — a querySelector() result passes straight through.
const dialog = getInstance<Dialog>(document.querySelector('[data-component="Dialog"]'), 'Dialog');

if (dialog?.$isMounted) dialog.close();
```

**Parameters**

- `el` (`Element | null`) — the element to read.
- `name` (`string`) — the component name.

**Return value**

- `T | undefined`.

## Why it is a function of its own

One map read and no scan. The caller already holds the element and the name, so there is nothing left to search — which is what makes it different from a filter over [`getInstances()`](./getInstances.html).

It is also the answer to "is this element's instance there yet", which every plural form loses by returning a list.

## Why `el` accepts `null` but the return is not

`el` accepts `null` so a `querySelector()` result can be passed straight through. The two ways of having no instance — no element, and an element without one — are the same answer to the caller, and `undefined` says it for both. Narrowing the parameter to `Element` would buy nothing back: the body reads an optional map either way, so the only thing a stricter type produces is a `!` at every call site asserting something the function never needed.

The **return** stays `T | undefined`, and that asymmetry is deliberate. An absent element is a fact the caller may reasonably not know; an absent instance is a fact the caller must handle.

## There is no `getMountedInstance`

The result is one object, so a caller who needs the live one reads `.$isMounted` on it. A second export would only hide that check behind an `undefined` that means two things.

## Detached elements

This form reads the element's instance map directly and never consults the DOM, so it answers for a detached element as readily as for a connected one.
