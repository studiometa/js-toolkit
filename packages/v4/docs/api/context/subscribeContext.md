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
