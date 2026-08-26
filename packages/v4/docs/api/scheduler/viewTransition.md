# viewTransition

```ts
viewTransition(update: () => void | Promise<void>): Promise<void>
```

Runs a DOM update inside a native view transition, with a progressive-enhancement contract: where the platform has no `startViewTransition`, the update simply runs.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"44022243230d8b1a84f1176389993adf166e2b9cd491a9670cd17be8faf1ef1f","data":"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"}
import { viewTransition } from '@studiometa/js-toolkit-v4';

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
