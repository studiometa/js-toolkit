# watchAttributes

```ts
watchAttributes(el: Element, callback: (change: AttributeChange) => void): () => void
```

Observes **every** attribute of one element, through a second, unfiltered observer.

```ts
interface AttributeChange {
  name: string;
  value: string | null;
  previousValue: string | null;
}
```

[[toc]]

## Why it exists

`attributeFilter` takes exact names and the DOM has no wildcard, so the engine cannot see an attribute the framework cannot name. This is the opt-in, and **the page pays for the elements that ask**.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"8b544d5da3bc3eec34f1b143a49fb436a64004b14af6da8a4a920825ac12844c","data":"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"}
import { Base, watchAttributes } from '@studiometa/js-toolkit-v4';

class Bindings extends Base {
  static config = { name: 'Bindings' };

  mounted() {
    return watchAttributes(this.$el, ({ name, value, previousValue }) => {
      if (!name.startsWith('data-my-')) return;
      // …
    });
  }
}
```

**The caller owns it.** The helper returns one idempotent cleanup and knows nothing about `Base`: a component calls it from `mounted()` and returns the cleanup.

## The contract

- **The records join the shared queue.** They are drained wherever the engine drains its own, [`whenDOMSettled()`](./whenDOMSettled.html) included, and they are reported from the same background task — as the last step of the batch.
- **A callback runs after the framework work of the batch.** So a component that stops its watcher during the same batch in which its own declaration is withdrawn hears nothing about the attribute change.
- **Changes are coalesced**, with the rule of [`option<Name>Changed()`](/api/methods-hooks-options.html): several writes in one batch give one change, from the value before the first write to the value at the end, and a write that ends where it started is not a change.
- **The payload covers the element's whole attribute set**, framework names included, with raw strings and `null` for an absent attribute. **A caller narrows by prefix.**
- A failing callback is reported as `callback.attribute-watcher-failed`, so one watcher cannot stop another.

## What to reach for instead

| Want                                         | Use                                                           |
| -------------------------------------------- | ------------------------------------------------------------- |
| a declared option                            | [`option<Name>Changed()`](/api/methods-hooks-options.html)    |
| a whole namespace, with keyed bindings       | [`watchAttributeNamespace()`](./watchAttributeNamespace.html) |
| a subtree, character data, or a foreign node | [`useMutation()`](/api/services/useMutation.html)             |

A declared option is already in the one page-wide filter, and costs no second observer.
