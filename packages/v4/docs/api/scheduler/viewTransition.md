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
