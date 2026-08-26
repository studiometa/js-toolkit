# viewTransition

```ts
viewTransition(update: () => void | Promise<void>): Promise<void>
```

Runs a DOM update inside a native view transition, with a progressive-enhancement contract: where the platform has no `startViewTransition`, the update simply runs.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"e16da0d78ec62db5b5072a89f783c7c38d9b68b241b41bfd6faf1ccdd5c8f8c0","data":"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"}
import { viewTransition } from '@studiometa/js-toolkit';

async function replace(el: Element, html: string) {
  await viewTransition(() => {
    el.innerHTML = html;
  });
}
```

## Batching

**Updates queued in the same flush batch into one `startViewTransition()` call**, so a backdrop and a panel animate as one transition rather than two fighting each other.

Each later batch is appended to **one promise tail**, so several flushes during one running transition stay serialized instead of interleaving.

The scheduler flushes the pending `write` tasks **before the snapshot**, so a pending write is part of the "before" state rather than landing mid-transition. Writes scheduled _inside_ the update callback run within the transition.

## It is standalone

`Base` has no view-transition method and no import of one. The helper is a free function, and the whole view-transition graph stays out of the `Base` module graph — a page that never calls it never downloads it.

## Composing it

It is a `DomUpdateRunner`, so an ancestor can claim a [negotiated update](/api/dom/domUpdate.html) with it:

```js
this.$on(EVENTS.dom.update, ({ detail }) => detail.wrap(viewTransition));
```

and it is a `SwapWrap`, so a [`swap()`](/api/dom/swap.html) can play as one transition:

```js
await swap(el, html, { wrap: (mutate) => viewTransition(mutate) });
```

Neither is the default. **The ancestor chooses the lane, because it knows whether the region animates.**

## `exit`, `layout` and `layoutId`

They are not an animation engine's job. Native view transitions solve them, which is why this is in core while `tween` and `animate` are not shipped at all.

`@studiometa/ui` keeps a declarative `ViewTransition` component, rebuilt on this helper.
