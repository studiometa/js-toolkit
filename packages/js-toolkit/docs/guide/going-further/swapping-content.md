# Swapping content

`swap()` replaces the **content** of an element with new markup and resolves once the framework has caught up: the mutation is applied, the new components are mounted and the old ones are unmounted.

[[toc]]

## The call

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"f45199cf0ca0a525f638b6a32ec92b2480e2d5142845f2772b65ad572bfd2415","data":"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"}
import { swap } from '@studiometa/js-toolkit';

async function load(target: Element) {
  const response = await fetch('/fragment');
  await swap(target, await response.text());
  // Every eager component in the new markup has mounted.
}
```

`swap(target, content, options?)` returns a promise that resolves after [`whenDOMSettled()`](/api/dom/whenDOMSettled.html).

## What survives

By default the element **itself** is never replaced, so the caller's reference, its `id` and any instance on it survive. Only its children change.

`content` is a markup string parsed in the parsing context of the target, so `<tr>`, `<li>` and `<option>` survive. It can also be an `Element` or a `DocumentFragment`, read as the incoming counterpart of the target, whose children become the new content.

## The four modes

```js
import { swap, SWAP_MODES } from '@studiometa/js-toolkit';

await swap(el, html); // 'replace' — the default
await swap(el, html, { mode: SWAP_MODES.PREPEND });
await swap(el, html, { mode: SWAP_MODES.APPEND });
await swap(el, html, { mode: SWAP_MODES.MORPH });
```

| Mode      | Effect                                              |
| --------- | --------------------------------------------------- |
| `replace` | the children are replaced                           |
| `prepend` | the new content goes before the existing children   |
| `append`  | the new content goes after them                     |
| `morph`   | the children are morphed in place, keeping identity |

`prepend` and `append` stay in core because they need the same before-and-after script diff as the other two.

### `morph` keeps identity

Nodes, focus, expandos and instances survive a morph — **but markup that is not sent does not**. Two consequences are morphdom's policy, not `swap()`'s:

- an element the incoming markup does not contain is discarded even from a preserved parent;
- morphdom syncs the `value` of an input from the incoming markup.

Core passes `childrenOnly: true` without `self`, so **attributes are not synced** on the target: `data-component` and `data-mount` are lifecycle declarations of the target, not content.

## `self` — replacing the element itself

```js
await swap(el, html, { mode: 'replace', self: true });
```

This is the axis a caller that matches an element of a response to an element of the page needs: an id-matched section otherwise keeps the classes of the element it replaces.

- With `self`, an `Element` content **is** the replacement rather than a container — the only way its own attributes reach the page. A string or a `DocumentFragment` contributes its first top-level element.
- `replace` puts the replacement in the place of the target, so the target **leaves** the document.
- `morph` morphs the target from the replacement without `childrenOnly`, so the element and its identity survive while its attributes are updated.
- `append` and `prepend` add to the children by definition, so `self` with either is a `swap.self-ignored` warning — as is content that holds no element.

## Scripts

A `<script>` produced by the fragment parser is flagged as already started by the HTML specification and stays inert wherever it is moved. It runs only if it is **recreated**, and a script that was already in the page runs **twice** if it is recreated.

`swap()` owns that rule, once. Script adoption follows whatever ends up in the document, so a replacement carrying a script still runs it exactly once.

## Wrapping the mutation

`wrap` is the whole seam. It receives the single mutation of the swap and decides when it runs:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"c3479fff358da0d86318bc2163a33d820746d7d1fef87b3c5094cc66bb7990d6","data":"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"}
import { swap, viewTransition } from '@studiometa/js-toolkit';

async function load(el: Element, html: string) {
  await swap(el, html, { wrap: (mutate) => viewTransition(mutate) });
}
```

[`domUpdate()`](/api/dom/domUpdate.html) produces that wrapper and nothing else, so an ancestor can claim the lane. Resilience policy stays with `domUpdate()`.

## What is deliberately not in core

- **Attribute syncing in a default `morph`** — see above.
- **Transitions, view transitions, history, `id` matching and response parsing.** All of these are caller policy.

`swap()` is a free function, not a `Base` method. `morphdom` is a real, statically imported dependency, and the subpath layout contains the cost: it is reachable through `swap()` only, so a page that never swaps never downloads it.
