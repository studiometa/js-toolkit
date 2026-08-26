# useInView

```ts
useInView(target: Element, init?: IntersectionObserverInit): Service<InViewProps>
```

An `IntersectionObserver` as a service.

## Props

```ts
interface InViewProps {
  readonly isInView: boolean;
  readonly entry: IntersectionObserverEntry | null;
}
```

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"2e3cbb622c72e3c4d145df90b3a22c9e93783fb63827a9c89e12f82c84166e19","data":"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"}
import { Base, useInView } from '@studiometa/js-toolkit';

class Reveal extends Base {
  static config = { name: 'Reveal' };

  mounted() {
    return useInView(this.$el, { threshold: 0.25 }).subscribe(({ isInView }) => {
      this.$el.classList.toggle('is-in-view', isInView);
    });
  }
}
```

## Keying

`useInView()` keys **every `IntersectionObserverInit` field**, and gives an object root a stable weak identity so two callers passing the same root element share one service.

The options are read by meaning, not by spelling: keys are sorted at every depth and the ones holding `undefined` are dropped, so `{ threshold: 0.5, rootMargin: '0px' }` and `{ rootMargin: '0px', threshold: 0.5 }` are the same service.

**Nothing groups observers across targets.**

## `{ immediate: true }` is the default here

`withInView` defaults it to `true`, because "am I in view" has a current answer and a consumer that has to wait for the first crossing to find out would be wrong on load.

## This is not a mount strategy

`useInView` and `withInView` observe a component that is **already mounted**. They do not replace `data-mount="visible"` or `data-mount="in-view"`, which decide whether the instance exists at all.

| Want                                           | Use                          |
| ---------------------------------------------- | ---------------------------- |
| the component to exist only once seen          | `data-mount="visible"`       |
| the component to come and go with the viewport | `data-mount="in-view"`       |
| a mounted component to react to crossings      | `useInView()` / `withInView` |

See [Mount strategies](/guide/going-further/mount-strategies.html).

## Mixin

```js
class Reveal extends withInView(Base, { threshold: 0.25 }) {
  intersected({ isInView }) {}
}
```
