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
