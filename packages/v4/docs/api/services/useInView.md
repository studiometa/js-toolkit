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
