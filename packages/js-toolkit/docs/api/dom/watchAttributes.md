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
// @twoslash-cache: {"v":1,"hash":"eb12d563a326294262b975b87672a340ff69d8d56c868e6d9a4a3c88e199c317","data":"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"}
import { Base, watchAttributes } from '@studiometa/js-toolkit';

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
