# subscribeContext

```ts
subscribeContext<T>(el: Element, key: ContextKey<T>, onProvide: ContextCallback<T>): () => void
```

The subscription behaviour of the WICG context protocol: **every** answer, as providers come and go.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"65ce851915063683b607e83637fd8bc2bed2356d8937f25732c6eb2e55bbe5d0","data":"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"}
import { Base, createContext, subscribeContext } from '@studiometa/js-toolkit-v4';

interface GroupApi {
  join(peer: Base): () => void;
}
const DisclosureGroupContext = createContext<GroupApi>('disclosure-group');
// ---cut---
class Disclosure extends Base {
  static config = { name: 'Disclosure' };

  group?: GroupApi;

  mounted() {
    return subscribeContext(this.$el, DisclosureGroupContext, (group) => {
      this.group = group;
      const leave = group.join(this);

      // The teardown for *this* value.
      return () => {
        leave();
        this.group = undefined;
      };
    });
  }
}
```

**Parameters**

- `onProvide` — **required**. It runs synchronously for each answer and receives the value and the same unsubscribe function the helper returns.

**Return value**

- the unsubscribe function. Call it from `mounted()`'s return value to get an unmount-scoped lifetime.

## A new answer replaces; it never accumulates

The callback can return a teardown for the value it received. That teardown runs:

- before the next **different** value;
- on unsubscribe.

**An identical value is not an answer**, so nothing runs and nothing is torn down.

That is what lets a member move between groups correctly: `join()` returns its own `leave`, the teardown calls it, and a member that moves to a nearer group leaves the old one first.

## When it fires

**The trigger is the mount announcement**, not a broadcast from the provider, and it runs after `mounted()`.

The optional `context-subscription` module keeps **one** listener on the document, attached on the first subscription and never at import time.

Two `contains()` calls bound the cost per mount: the new provider must contain the consumer, and it must sit inside the provider that answers it now. **A mount that changes nothing checks nothing.**

## What it holds

**The registry holds nothing.** A subscription is anchored on its consumer element through a `WeakMap`, and the iterable index holds `WeakRef`s that the sweep prunes.

Callback and teardown failures are isolated — `callback.context-subscription-failed` and `callback.context-teardown-failed` — so one consumer cannot stop the shared sweep.

`context.ts` and the `Base` graph import **none** of this optional state, so a page that never subscribes pays for none of it.
