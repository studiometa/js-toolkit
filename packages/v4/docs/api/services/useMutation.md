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
// @twoslash-cache: {"v":1,"hash":"5ff3567daab2ab423c3d4a7f332d22d61c5a3b9aff2948d530dfb00c4d791bcf","data":"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="}
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
