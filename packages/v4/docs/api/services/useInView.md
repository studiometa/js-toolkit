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
// @twoslash-cache: {"v":1,"hash":"139d7e8b98efd358c225ed08057e14338fc8947a818ca158b6dbf1ec1d2c79e0","data":"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"}
import { Base, useInView } from '@studiometa/js-toolkit-v4';

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
