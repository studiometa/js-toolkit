# Swapping content

`swap()` replaces the **content** of an element with new markup and resolves once the framework has caught up: the mutation is applied, the new components are mounted and the old ones are unmounted.

[[toc]]

## The call

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"0695f5794c4a167d4cb8628966455b699138db043b42a88ab3c1c4361707c3db","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvOAHdmWRmmakA5jDSJeAUVYwAtjDBoKvEZJpHNAZTlYAwucPHeELOMlwA/NdsB5NxJgPJoACqQQeuxwMAA8RBDsUAB8ADpg7HpYEKRo0raUIFAQIgiIIDbyvMxSMLoGRgDkcKaORlVgULxy7Ln82S4ARtGkRMwDui2Zkk68HPwwIhgiEzLZANYAdAVKKqXIyCBYysx628pquQAq+DC8tfozMoTRLUYzIvjVanAbvADqPXwvAABtFWPxgSY0Dc7nUZj0wfwtgBdCgHI6kE4FMxvNrXW5gGAyV4WNAotEgUjqQSkIIFABK8AgrBIzWY/BopDuzDUXLmCyWK3WvwcHR6gTYvD0EGEuTgaExNBU7HgVSpvEguWY3RoUHJBw4YDWBXwaDQWDgiAA9FaAFZwAC0aAgzLWPQdRAALBt5YIoBIDEoNrAiFb5OwrUU9FbZPINqa9KwQMjUSB5coGIgAJxUXRgFTQpCeqhKVTqPCxrAFQ24RAABioH2OYjISCzAF8KOhsLWCMRWyW6JmQEJRO4pKwIMwoIpzupNDoHkZuKFwpFonEEskCumckgAGz73OGAv4IslufDyfT6vsQlIABMjc+mJb5EQAEYAKyd7s4PCECQ5CDvQTAYic6hkHwpYXAucJGDupaZgA7B+x75oWiBHtQl54DB5a5netZPiATavpyj51r+1A9gB/bAdQQ54HenL8MwIi3Iu9QMFQRQlHgABUAnAlxTjAkJvBRLw0K3NK8q8GohKYqwvADFwtzLFwzT8GuXT4OwHxVKwKn3Nxgy2gsaDNIw7AbDAGwmBAAwWWIzTQswuRUlgVLRG0plODwklSMwvAACLFIIZl3jcpA9L8ACSuSSKwGC8J8zSBoQUBsh0vDea4ZDiKqZh6NKUjOkZKluh0zQQPwsJLlZvwALLZLccA4CI7D8AZpisFpqrRWQPQCLpolGBsaRpMgzWhQAcrwjLzFSogwMijCmualo2iGtQFaQGzSgAXuwxnMBs2QqJGxRwFafwwAMVoAIIhPFVrjWg3CIRmSDITmIB5qev0XmWw4fbe96ICRZHsRRUMABzUZg/5lIBA6MaBZQ4vJPlZEEMCaIyHUeLgVC7pmWbw+hQOIFTOGg3guMkxDtYAMzPs2cOI12NEo32QHbExZSjmIgQCOoHw2WAWCCBoi0wAAjoI8BoPFYB9LwAA+vAAKr0gAMiYd49N48tKyras9CuvBhBEUSxETePREkBR8aUIAzfN8vLYYHHrZtFrWpGMAkJOOAHcdp39RdqjXSUd0Pc9r13XeRQyFa8xoB8X1k0hSAft+1OYV+IMXHgmcfCzSDs6RL6w62UM/jzyO9mjDE0JjIAsBwXB8JWs6g3BjUmDipI+PIoqko5AQeKbFRYP447BDba725uiSpOkUw5Hk8iuzdeDz+0DXcU0JIzNUnQ6gI/ROcMozjBpER4zM/KLMstyrKQmxnLsSD7IcY4pxS7qF4PiE+jxnhP1xLkJs+Z4C/ABNCEEiJITSRhP5NoCJahImTBScCwDSKtCuDCQkxJR5OH1JSaktIEBUCJsyVkVQORkG5LyWY3UBQfy6MKXgop/TjklNKWU0gFQeRgMqVUygCQQC1DqGAeo8EGjvMaKgAdtp2kdM6V07ovQ+jQH6AM6hzohjDFgCMUYYy2HjGgRMyZUzk3zp6GugNMLFnpmXMolYq6IHcTDN8SBuZ/lbvRQWndGAEMgqQaCl4h7cW+nuT8no6auLPFhEBw58I8QBkRc8tdOYNw/KzJGtFUahJAsObGnl4BOwJvLYm+MEmZg/PuEiqTAkZMZjU5mhFIZ+LrgEqGyESl8zbmE4cjBMrQD4AAIWgBgDYHc0CMGtrbdcsR5SxXzC7XiB8yiewWktMgvs1obTNIHHaIc9rh0OhAE6Z0Y5XTdgnR6L03qMnNvKK0Syc5pjzp+VCRc0nuKyXhJivTaz9IKe+Vm+52ypjMLAZi29cjAF3lgXg7ZRoRF4A0AAAr6f0ERjGaKdC6Vgbo0Aek9A0AA3FNMAXAMCiAEMIUWkhZhThnFkuJTg+DADSLwV4ONun414AAXiqNfCu+BGANAzpiFQp9uD0qkFK5gI1+5ZJMNqDV1SGnREWUOFZKrBW8BtNoICqUYA8lYSVF+WDyqkKJFKZQaxBAYvSlKGUbw9RpHbAUQMzAkCgCHIYOAgQ8IIHbO2IAA="}
import { swap } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"2e0bdc661a4a26adc4c54b6e1377928b8e4a98aebf68f79754d9f7d771327325","data":"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="}
import { swap, viewTransition } from '@studiometa/js-toolkit-v4';

async function load(el: Element, html: string) {
  await swap(el, html, { wrap: (mutate) => viewTransition(mutate) });
}
```

[`domUpdate()`](/api/dom/domUpdate.html) produces that wrapper and nothing else, so an ancestor can claim the lane. Resilience policy stays with `domUpdate()`.

## What is deliberately not in core

- **Attribute syncing in a default `morph`** — see above.
- **Transitions, view transitions, history, `id` matching and response parsing.** All of these are caller policy.

`swap()` is a free function, not a `Base` method. `morphdom` is a real, statically imported dependency, and the subpath layout contains the cost: it is reachable through `swap()` only, so a page that never swaps never downloads it.
