# swap

```ts
swap(target: Element, content: SwapContent, options?: SwapOptions): Promise<void>
```

Replaces the **content** of an element and resolves once the framework has caught up.

```ts
type SwapContent = string | Element | DocumentFragment;

interface SwapOptions {
  mode?: 'replace' | 'prepend' | 'append' | 'morph';
  wrap?: (mutate: () => void) => void | Promise<unknown>;
  self?: boolean;
}
```

[[toc]]

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"2437d3403c1db762b9fcc0b2492992495f429bd6ae9aaabfe2d324f20646ef39","data":"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="}
import { swap } from '@studiometa/js-toolkit-v4';

async function load(target: Element) {
  const response = await fetch('/fragment');
  await swap(target, await response.text());
  // The mutation is applied, the new components are mounted, the old ones unmounted.
}
```

The returned promise resolves after [`whenDOMSettled()`](./whenDOMSettled.html).

## What survives

**By default the element itself is never replaced**, so the caller's reference, its `id` and any instance on it survive. Only its children change.

`content` as a **string** is parsed in the parsing context of the target, so `<tr>`, `<li>` and `<option>` survive. As an `Element` or a `DocumentFragment` it is read as the incoming counterpart of the target, and its **children** become the new content.

## The modes

```js twoslash
// @twoslash-cache: {"v":1,"hash":"41bdc4a10a8acab5c35bbba672e7f138055fcbf457a441876558d375674ad388","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAZQDqAQQAKAfQCyAeQAiAUTGJewADpheB3qRjMoQ1hl4AlNTIAyUgMJqtOkMaytm/GG4DceoZGJmZgFrwyNjJqAHIqriBYHjBgUP6Bhsam5pay0XEJzFg4qen6mSE5vMpWMgASCQC2EKRY+GUAvnrsjVgtopKyiqoalCBm/AiIIDHMjTBQAkI0YKJwAO5FvM2wcAB0YyLMpAyIAJxUrCkA5mj4SACMAAxUaMfXMKcgg/LK6mJjDhgXCIF4gfj4Y7eGjkc4dCjobAggjEMhjGj0JhsTg8JbCAbSX4jTTaDIGLKhcJRBzOBIeLw+MpBClVSK2WLxXhuJIwEppEABcrkyphXIyfKctxFPlMirZUXVJS1BpckDNVrtAV6LpgHp9E7iQnDf5jCZTGZzBZ4lZrTZYbbQeAHKhHE5IACsAHZLjc7o8wW9SB8vj9jaNLuxgUgAExUCFQ/gwpBPeGInB4QgkcivOhfRhJCA4E4YPjUpwuVX07y+ECHQOnABsAA4fWBbvdEN7qO9Pngy85AZGQbHwZDSNC0YgHg9U9QkRnUdnqLmsRwuHxBPjDUM/hotLohcF5VTbDSK24q4ytYeWQq2RKEjyZdfmSLwnkOYViil+YLX8fLBqeomhaNpOm6Xp+m3IkTSoM08FmeZFk3G1eA2LYdidOtjlOZ4ABZW3bf1Xh7EMjV3AEIyjRAAGY4zHCdYRTBE53TaZMzRHNMWmfNSELMhMD4e9P1VJ8fzcbC3SnB53UIv1OxIoNe2mYS4kHai6NHBMk2k2dMDYlEs3RFceOxdc8REaCwxJA9/0pSx+3PdxeQZGs/zleyIiiETuWSUoXw8qoPwKVVpXEgLhQAxVlRAjVwN1SCDVDCjTQgSYEMtZDlhSW0MMdfZJNwmiuyuNt5OeRTgzwZLiXUkECK08dE0nZi02RDilwxPMCyLQTeGCyUQDC/zCsePCWxAUqiMQBtKuUkABrqpAGvjJqdOnPT53YxdjO4kAWDXXFN0smr/n3Mkj08xy6Rc6tZUizzVMGsT/Pch6gvFHyhu/V6LtvcIgJVNx1TA68dT1KDTvDcY0vNRCrRQnK0LtB1dmdEBXVw5s5I7CruyUsid1qqiQVkxrGOTTaDI63bur43qS2i4DVRBzVRqnT0Lkm30OzJwMqumQGlsQMnVop3SAF040dPAIYNYArIo3gOl4AAzPjGl4AByAABEQAFcoHYCB5jeAB6AArOAAFo0AgCBWAAa3YNBraIPCtcFPQobEPZHL8XgzbN7XLxgLXeEAFAJeDuGBeFgVXmH11g0G98jiT2J6A6D7WXqgLXU6J/49gGrPg614a84LmCND2QHS+11mtbGU3mCQUBcxSOBjbAPArZADoOiAA"}
import { SWAP_MODES } from '@studiometa/js-toolkit-v4';

SWAP_MODES.REPLACE; // 'replace' — the default
SWAP_MODES.PREPEND; // 'prepend'
SWAP_MODES.APPEND; // 'append'
SWAP_MODES.MORPH; // 'morph'
```

`SwapMode` is derived from the frozen object — the pattern for every closed set of strings in the framework.

`prepend` and `append` stay in core because they need the same before-and-after script diff as the other two.

### `morph`

Identity survives — nodes, focus, expandos, instances — **but markup that is not sent does not.** Two consequences are morphdom's policy, not `swap()`'s:

- an element the incoming markup does not contain is discarded even from a preserved parent;
- morphdom syncs the `value` of an input from the incoming markup.

**Attributes are not synced on the target.** Core passes `childrenOnly: true` without `self`, because `data-component` and `data-mount` are lifecycle declarations of the target, not content.

## `self`

Replaces the target element **itself**, attributes included, instead of its children:

```js
await swap(el, html, { mode: 'replace', self: true });
```

It is the axis a caller that matches an element of a response to an element of the page needs: an id-matched section otherwise keeps the classes of the element it replaces.

- With `self`, an `Element` content **is** the replacement rather than a container — the only way its own attributes reach the page. A string or a `DocumentFragment` contributes its **first top-level element**.
- `replace` puts the replacement in the place of the target, so the target **leaves** the document.
- `morph` morphs the target from the replacement without `childrenOnly`, so the element and its identity survive while its attributes are updated.
- `append` and `prepend` add to the children by definition, so `self` with either is a `swap.self-ignored` warning — as is content holding no element.

## Scripts

A `<script>` produced by the fragment parser is flagged as **already started** by the HTML specification and stays inert wherever it is moved. It runs only if it is **recreated** — and a script that was already in the page runs **twice** if it is recreated.

`swap()` owns that rule, once. Script adoption follows whatever ends up in the document, so a replacement carrying a script still runs it exactly once.

## `wrap`

The whole seam. It receives the single mutation of the swap and decides when it runs:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"2e0bdc661a4a26adc4c54b6e1377928b8e4a98aebf68f79754d9f7d771327325","data":"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"}
import { swap, viewTransition } from '@studiometa/js-toolkit-v4';

async function load(el: Element, html: string) {
  await swap(el, html, { wrap: (mutate) => viewTransition(mutate) });
}
```

[`domUpdate()`](./domUpdate.html) produces that wrapper and nothing else, so an ancestor can claim the lane. **Resilience policy stays with `domUpdate()`** — `swap()` itself throws rather than swallowing.

## What is deliberately not in core

- **Attribute syncing in a default `morph`** — see above.
- **Transitions, view transitions, history, `id` matching and response parsing.** All caller policy.

## It is a free function

Not a `Base` method. `morphdom` is a real, statically imported dependency, and the subpath layout contains the cost: it is reachable through `swap()` only, so a page that never swaps never downloads it.
