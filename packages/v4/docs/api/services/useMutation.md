# useMutation

```ts
useMutation(target: Node, init?: MutationObserverInit): Service<MutationProps>
```

A general `MutationObserver` as a service, for "tell me when anything under this node changes".

## Props

```ts
interface MutationProps {
  readonly records: readonly MutationRecord[];
}
```

The default observation is `{ childList: true, subtree: true }`.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"5ff3567daab2ab423c3d4a7f332d22d61c5a3b9aff2948d530dfb00c4d791bcf","data":"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"}
import { Base, useMutation } from '@studiometa/js-toolkit-v4';

class Counter extends Base {
  static config = { name: 'Counter', refs: ['list'] };

  mounted() {
    return useMutation(this.$el, { childList: true }).subscribe(({ records }) => {
      this.$el.dataset.count = String(this.$el.children.length);
    });
  }
}
```

## Reach for something narrower first

| Want                                         | Use                                                                  |
| -------------------------------------------- | -------------------------------------------------------------------- |
| one attribute of one element                 | [`watchAttributes()`](/api/dom/watchAttributes.html)                 |
| a whole namespace of attributes              | [`watchAttributeNamespace()`](/api/dom/watchAttributeNamespace.html) |
| what the framework already reconciles        | the registry — it is already watching                                |
| a subtree, character data, or a foreign node | **this**                                                             |

## It keeps nothing after the delivery

`props()` is **empty between deliveries**, so `{ immediate: true }` waits for a real batch rather than inventing one. That is the honest answer for a service whose value _is_ a batch.

## Platform timing, not framework order

This service delivers on the **platform's** timing. A subscriber that needs the framework's order awaits `whenDOMSettled()` in its callback:

```js
useMutation(el).subscribe(async () => {
  await whenDOMSettled();
  // the new components have mounted
});
```

## Keying

Its key is a **canonical init**, through `resolveInit()`, which keeps the DOM contract rather than sorting the object blindly. See [`perTarget()`](./perTarget.html).

## Mixin

```js
class Counter extends withMutation(Base, { childList: true }) {
  mutated({ records }) {}
}
```
