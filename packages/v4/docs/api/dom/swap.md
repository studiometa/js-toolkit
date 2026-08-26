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
// @twoslash-cache: {"v":1,"hash":"41bdc4a10a8acab5c35bbba672e7f138055fcbf457a441876558d375674ad388","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAZQDqAQQAKAfQCyAeQAiAUTGJewADpheB3qRjMoQ1hl4AlNTIAyUgMJqtOkMaytm/GG4DceoZGJmZgFrwyNjJqAHIqriBYHjBgUP6Bhsam5pay0XEJzFg4qen6mSE5vMpWMgASCQC2EKRY+GUAvnrsjVgtopKyiqoalCBm/AiIIDHMjTBQAkI0YKJwAO5FvM2wcAB0Y2jMAOZTyMggHGAA1mP4aGhYcIgA9C8AVnAAtGgQEKzXdhoL5EAAsexEAFcoOwIPMjntYEQXkV2C8zI0Xhsint7o1WCAALqEqgiZikBiIACcVFYKWOaHwSAAjAAGKhHUjHGCUkCDeTKdRiMZXXCIdkgfj4cneGjkakdCjobBigjEMiHOi8lgcLh8QTCAbSAUjTTaDIGLKhcJRBzOBIeLw+MpBK1VSK2WLxXhuJIwEppEABcqWyphXIyfLetxFAMuirZcPVJS1Bo+kDNVrtIN6LpgHp9CniY3DIVjCZTGZzBZLVYpNabLDbaDwA4ck5nC5XW5Ue6PZ5vT4/P4AoEg8FQmFwnnMREwZGo9FwrGN3FofFEkkgMkUpAAVgA7LT6YyWRLOdzefzS6NaewwGKAExUKUy/hypCsxXKnB4QgkcgOS1JgkggHAKQwPhbScFx00dbxfBAMYd0pAA2AAOY8wAZJlECPahyUvPBoOcEV7yfF9pVIWUNUQZlmW/agVT/dVAOoYDph1TgeFrERiyGQUNC0XQQ2CRMbVsO1YLceDnRzUS3STD0owSP043k10w3CPIvUKYoUkDYNNPEywanqJoWjaTpul6fp+JNMsqArPBZnmRYDRWBsth2VtDg7JBzkue8ewIB4nleD5vl+f5AWBMEITQaFYXhWckRRLA0QxFccTxAliVJTlKTZUEsJws92y5Hk8GvQThTvB8kAAZkot8P3FRjMF/aZ/w1ID6BA0gwLITA+GU3T0zUgy3GQwqWWZPdStPPCKqI6YxriMiGsQZrJSomj5XojrmO61jNX6zi2G4/UhD4mrTWEi0xOtSwSOk9x/SdRCjITZ6IiicbfWSUoNJ+qodIKdNYymkHQxM5NUwsrNrPzWyizuxzxggSYXOrdzlnrXhsSbHz9j804Aq7YK7jCgdIuHGKx3iydkpnOcFwypdMSJtcN3y7dZroxr8LpbClrZFaqumdHbyCraSt21raK/JUmK6tUALO7VQPAkbeHB6MQCh4GZvJIrQUwy4T1w1CJd5fXNrFeXX2o99aMOlXOtVHq2Joc6QC4vVeKNAT7vNBStJeySYIdD6EPjWHfvWg3JuB76E7ByMAcN/TU8exTwjMtM3EzKz5LzAs7OlurMex6ZXJrDyCaJ5tdjbAjyZQSmbmp/sIqHaLRziidEqnFK2fSzLl253LNwK02WQwxbcPFgjKqvEtaod/cWpdtrlZ/L3Tr6rXBp1yD4fM9MS+zE3dzog8aUt0XcIW1fVpAQut8QV/nf2uaOi3IIWAeAK5FmAPZG8YheAdF4AAM0Go0XgAByAAAszacRw6YD1iuOJBwY9BVz2K9PwvA3jINkjAJBvBAAoBLwRkMBeCwFgcwSErA0AEI3qaPYScSFkKQSnKASCOEhyFHsfWvCXjIKNoI4RDkNB7ELhI5B18kFjBSkgUAWoUhwFhGAPAnwQAdA6EAA="}
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
// @twoslash-cache: {"v":1,"hash":"2e0bdc661a4a26adc4c54b6e1377928b8e4a98aebf68f79754d9f7d771327325","data":"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="}
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
