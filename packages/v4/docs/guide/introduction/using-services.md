# Services

A service is a shared source of props that components subscribe to. It is **lazy and reference-counted**: the source starts on the first subscriber and stops on the last, so with no subscriber there is no listener, no observer and no frame.

[[toc]]

## The sources

| Service                                                                       | Hook             | Props                                                                        |
| ----------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| [`useRaf()`](/api/services/useRaf.html)                                       | `ticked`         | `time`, `delta`                                                              |
| [`useScroll(target?)`](/api/services/useScroll.html)                          | `scrolled`       | `x`, `y`, `deltaX/Y`, `maxX/Y`, `progressX/Y`, `directionX/Y`, `isScrolling` |
| [`useResize(target?)`](/api/services/useResize.html)                          | `resized`        | `width`, `height`, `ratio`, `orientation`                                    |
| [`usePointer(target?)`](/api/services/usePointer.html)                        | `moved`          | `event`, `isDown`, `x`, `y`, `deltaX/Y`, `maxX/Y`, `progressX/Y`             |
| [`useDrag(target, options?)`](/api/services/useDrag.html)                     | `dragged`        | `mode`, `x`, `y`, `deltaX/Y`, `originX/Y`, `distanceX/Y`, `finalX/Y`         |
| [`useKey(target?)`](/api/services/useKey.html)                                | `keyed`          | `event`, `triggered`, `isDown`, `isUp`, plus one boolean per named key       |
| [`useInView(target, init?)`](/api/services/useInView.html)                    | `intersected`    | `isInView`, `entry`                                                          |
| [`useMutation(target, init?)`](/api/services/useMutation.html)                | `mutated`        | `records`                                                                    |
| [`useScrollProgress(target, options?)`](/api/services/useScrollProgress.html) | `scrolledInView` | `startX/Y`, `endX/Y`, `currentX/Y`, `progressX/Y`                            |
| [`useBreakpoint()`](/api/services/useBreakpoint.html)                         | —                | `name`                                                                       |
| [`useMediaQuery(query)`](/api/services/useMediaQuery.html)                    | —                | `matches`                                                                    |

`useWindowScroll()` and `useWindowSize()` name the default cases. `usePrefersReducedMotion()` is the named media query.

## Subscribing by hand

Every service has the same two-method surface, so subscribing is one line and the release is what `mounted()` returns:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"5ea3433084a63dd8488c57a8b4f52672a02d69bae833ead64ab922d282e447ba","data":"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="}
import { Base, useScroll } from '@studiometa/js-toolkit-v4';

class Header extends Base {
  static config = { name: 'Header' };

  mounted() {
    return useScroll().subscribe(({ directionY, y }) => {
      this.$el.classList.toggle('is-hidden', directionY > 0 && y > 100);
    });
  }
}
```

`subscribe(callback, options?)` returns the unsubscribe function. `props()` reads the current props with no subscription.

### Asking for the first delivery

```js
useScroll().subscribe(callback, { immediate: true });
```

The sources that have a current value honour it; the ones that do not, do nothing. The frame tick has no current value between two frames, the pointer has none before it is seen, and a drag has none outside a gesture. Only the new subscriber is called, and the first props of a run carry no movement.

## Mixins — the declarative form

A mixin binds one subscription per mount cycle, under the one method name the service owns:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"1283cff7395b87a275f88f37ec7b04f92c72568d939c7aeb23b471a3d45c248f","data":"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="}
import { Base, withScroll } from '@studiometa/js-toolkit-v4';

class Header extends withScroll(Base) {
  static config = { name: 'Header' };

  scrolled({ directionY }) {
    this.$el.classList.toggle('is-hidden', directionY > 0);
  }
}
```

The mixins are `withRaf`, `withScroll`, `withResize`, `withScrollProgress`, `withPointer`, `withDrag`, `withInView`, `withMutation` and `withKey`.

::: tip A mixin never occupies a lifecycle hook
`mounted()` and `unmounted()` belong to the component author. The subscription rides on the framework's own `$mount()`/`$unmount()` pair, so a class that mixes a service in and writes its own `mounted()` **without** `super.mounted()` still subscribes.
:::

The subscription therefore starts once the whole of `mounted()` has run — including an `immediate` first delivery, which reaches a component that is fully set up — and is released before `unmounted()`.

### Scoping a mixin to a ref

```js
import { Base, withResize } from '@studiometa/js-toolkit';

class Panel extends withResize(Base, { target: (instance) => instance.$refs.inner }) {
  static config = { name: 'Panel' };

  resized({ width }) {
    console.log(width);
  }
}
```

A resolver that comes back with `undefined` or `null` reports `service.missing-target` and starts **no** subscription — because a renamed ref arrives here as nothing, and a service with a default target would otherwise observe the wrong thing and look like it worked.

### Suspending a hook

`{ manual: true }` declares the hook without running it. `$services.<hook>` is the switch:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"2f7ca64f84e3f5c07aff443c0900718929470fa0a4e58b230a33cc208ea93d48","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPAIQYC68AO7sgQBKzABmiLwAymRE7PwwALLstImS3T0AEhAQANa8AGSDw6Mw88yKPnCSptSjyzBQx8YUvEQQ7FDXEABGAFYwOWYW1rb27V29TigEH4CBiAwArk84PxSOwnjBeAADNCnc6MbiI3hoCBY/AInqkZiWBGqUgjMa8Hq2OTZfC8SwQcFgez8DCCGAAOicLjc0QAjABWby+AJBRAAdjCbki0RAf3wcycHCSSDSIAyWRylUQgqKJRweEIJHIYXkeEEwkGHFgpAAkjRLNzwtEAGwu4X+QJIPlq8IyvADa1ke0wR0JFWIABM6UyhK1eRdeuopUNFRN1DNMRYHC4fHlc0kmBwEB6DhgxkYcQAwkI4HB+kWYCWy48sCimnAAPz9RjPN45dabMnbSbTMAAeTb7A7klu92ucUkcUM2mMxj4AB9eEzYD1EuduP1R+ca8JC6Vm3FrnNFitB0Nh2Ndvt4EcTvwzhcQGveIwANR8rwaasBAzBQNw5hWDYdhtB0CoAlQQIggGkLQrC8JIiiH5ohiWI4oE+KEsSvCkuS+LUjAtL0oyzICGyPhclQPLuIgAAcQogD4npipK1DSlEeD5ghnH7kg0bqrG2S5GJApJo2qbGlUmYgNm9R8BadZljIcj0L4ShliuugGZoq6Qd8MFxE6vKeAAzB6oohFKEQCTElnhsk4kanG0mIDZNlySmMRGpUpo1FmWAmWQmB8A+ZGjokk7ts0Mj8Wg1yLC0eiLsuJkmMYHKWHs4JsN2vBPEsPh7LwW47jAe5JFAgLAqCIAACI4pA9hwKhMJwgiTTUUyaAcrwVZNGgmisLiJI9bCU4DYEmjgn4dLIvg7BwByAAkpHbJtkiECsxiIoxzjOt6KR8vZXqIO6fHObKhVgMVrBKqJUYxpqPnBHyAUGkFaZKWFKkRVoUUYDFQZ2g6HL8E0e5+P0wDmLwqO8GARIwP0Liwv4ADc5gFFZLF8pGrHXWKd1+i56rw+wfhvRGdkSV92qFMUyb/eUimhbKjCgzgdgQ+jmPYxNiQM0x506jZXicSKN2hPd/oxBjxKM8kzNeVJ2qRikf1lMF6bVHzxKBNAkP3MGMNYZ+jDALwsCsK4vAFEjKNo07rj9HsGAE2ABSHjcdyNVL1k6i6StcQ5t1OSr76fhrSAcdr8ZiQbCkhRmwP81kZtkHwXvMD7YAYMT/Lisz0c3Rx1OykXSeICnklpzqv0c/JAM89nptRIQ4FWlb0OhhyzFoOi/RzqHZ3h5GesU8ncc02Pjdy6nPmRhnXdZybTAC+DfA7VsYz1rwyNgGjvCkJRQJgKwGBYqiUD9NIEB+H4Pj+0TYcsZGssL/kJesoj6PngI3H0n1vJsy3tzHeyl+aRSFnwW25wX5vw/vEGev9ghy2rpTIBeAUHT2VMkCBLMoF5D5OzfUhtAa8z3og6KvBX7vwYmPHsfAdDGGDvcJqyEwSzT6ujCArRrhMgOCIDovANokUEfCKAvA2DXzAhgU6K8owCjungxeytl7nXchdSBOs8iRkTB3QKsDjbwLNv3S2NoQyWFHtiLAE8eHT3UZGcU4ltGICVnXPALgtDgK1i3DeMCjZAz5vvJBvAQFkVPufS+yjb730fthZ+zD0Gf0JuXMSHg1Q+Llv4mIcS9rgKVuvaB5iuYRPoeFRhwsiFoNYZg9RNkUgFIVvg3RsoiHlKMa3Kh4S6E9wYWDGJLCMFOK0Bw3gXC3F8Jap0GAlVVDTVkVCXq80wDXHYKWKRmQRBNE5Lk3yKReI+L8alAJzj+nkOMWJRMABddI0AyhQR+GfFssF/ilgKJSTQlheAAHIAACLhwRQGnGbZgAB6F4cAAC02IICsGWB0RFRBgjAv9uYDSIhAxDwcTpBQ+khI9ErBIa4DsnovQbKQcECJA5nw9jyLCjQwAIzmV8tWWMQWEvsQ6YFrtcUXzSXbB2RdXZ8ESWjWFsLHbvCENfB4wj7AMrABYfwHsCjmFZc6dELKxWo0CBtbau0T4ciIU43k6J/ao11WAfVWhDWypNetTapTLXWsCS47g9rXY5KoDCpAoB5C+DgNOMAeAEUgAKAUIAA="}
import { Base, withRaf } from '@studiometa/js-toolkit-v4';

class SliderItem extends withRaf(Base, { manual: true }) {
  static config = { name: 'SliderItem' };

  ticked({ delta }) {
    // declared, not running
  }

  start() {
    this.$services.ticked.start();
  }

  stop() {
    this.$services.ticked.stop();
  }
}
```

### One hook per class, and that is the limit

A mixin binds **one** subscription, under one name, per mount cycle. A component whose subscriptions are one per markup declaration — an attribute-driven set, with its own modifiers and its own threshold, known only when the element is read — has no method to name and no fixed count. It calls `subscribe()` itself and returns the release from `mounted()`. That is the intended path, not a workaround.

`on<Event>` has the same shape: a handler name belongs to the class, while a set of events can be data.

## Two combinators

### `toggle()` — a subscription you can switch

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b52dfb62357981016ccb9e58eb953d48488a60ae96d48434585ed02ecbd52a67","data":"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"}
import { Base, toggle, useRaf } from '@studiometa/js-toolkit-v4';

class SliderItem extends Base {
  static config = { name: 'SliderItem' };

  #frame = toggle(() => useRaf().subscribe(({ delta }) => this.follow(delta)));

  mounted() {
    // `stop` is bound, so it is a cleanup as it is.
    return this.#frame.stop;
  }

  follow(delta) {}

  onSelected() {
    this.#frame.start();
  }

  onSettled() {
    this.#frame.stop();
  }
}
```

`start()` is idempotent and `stop()` is safe to repeat. It works on a `Signal`, on a bare listener, and outside a component.

### `until()` — a one-shot wait

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4b26b0180519477dfa48ba232d3edb5750858986f84cd686f312915b165ca2ba","data":"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"}
import { until, useScroll } from '@studiometa/js-toolkit-v4';

async function afterScroll() {
  const props = await until(useScroll(), ({ isScrolling }) => !isScrolling);
  console.log(props.y);
}
```

It resolves on the first update that matches, releases the subscription **before** it resolves, and resolves with a copy of the props. It resolves at once when the current props already match.

## The props contract

- **Props are flat, one field per axis, and nothing derivable is a field.** `lastX` is `x - deltaX`; `changedX` is `deltaX !== 0`. The grouped objects of v3 (`last`, `delta`, `max`, `progress`, `direction`, `changed`) are gone.
- **`directionX` and `directionY` are `-1 | 0 | 1`** — one signed value that multiplies.
- **Every field is `readonly`, and the props object belongs to its service.** It is valid for the duration of the call that received it. Use `{ ...props }` to keep one.

## One instance per target and per options

Services are keyed in a `WeakMap` by target **and** by the meaning of their options, so two callers asking for the same thing share one source:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4805eefd72c0ddc09b4a8a467692fd0750852015588ebb459aa85adbf8d72058","data":"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"}
import { useInView } from '@studiometa/js-toolkit-v4';

const el = document.body;

// The same service — the key is read by meaning, not by spelling.
useInView(el, { threshold: 0.5, rootMargin: '0px' });
useInView(el, { rootMargin: '0px', threshold: 0.5 });
```

Nothing groups observers across targets.

## No service owns a loop

The raf service and an active drag inertia subscribe to `scheduler.tick()`. The scroll service coalesces its events into one `read` per frame. The resize service is a `ResizeObserver`. See [The scheduler](/guide/going-further/scheduling-work.html).

## Writing your own

`createService()` is the whole primitive. Give it a `props` reader and a `start` function that returns its teardown:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"434d7febdbb1a7f3943d418ee74ccf445d4fe74fd95f6870ab5fe6d4133d9d04","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAZTJF2ImAB4AKhV4AlXgF5eRCOygA+RsF5ZSELHB1w0zUmh34uABTsPeAX0ReJVIVNQARGH52MHZxSS1zbiCQsI1tPXMAHViAWywIN2lZeRhU1VwqKAgRBEQQACFBdlYoXmZeOGUKgTtc3ji4Xlho2PiwADpKEGdXBkQATipWGDAAczR8JABGAGYqF1I1mHmQGTlFbrVpjjBcRAAGKhFPUmYxMiQF/wp0bHuCMRPgc6KcWBwuHwhKJxjYyJpXMc0FpESdeKDVlAhgB1OQAawA0jAMDoAIJHIYYsBY3jCPGQADuYGQAF0dBl9EYTGZLOdSkFGIckUEEUcTjoJpLEXAguS1jxDOZgld0jpdOYdHjiQB5fgAfgFkom0tlFL4BiVzlIMTWyV4gtRaBFjolUoppvl5qV5TUWjV2TyBSKOFIoqR02qtTwAGESjReJIYLwGfjWBhePgYK1Oiq4aReEK0cxqe0joJcqs0LwtRgpgdmPKkMhkCAsK5mLlpnz49G2Cs2pI1HmC472iXEeXKzZmOxSFM2S2229O1Qa7rlda2OwAF7wUtrSdgNBwCa8SL8ZiCVjHgsQXjAAACtzxnRcACMVkSMP552yZod5gAJgAFmWVYNi2RZ6zFU4QzDE4bhie4njOV53hochEBAn4/hwPBCBIcgQXoPAYgwi8hwAMRqQQ4B8ewECoWY3CQAAObYwPWTYdhQwtTmokRaPohxELuJBAOeNCPkw7YHhw6h/nwoEiOoUEmFsewyEwPgBKE3wT08OBdJlXg3wgCAVmLaZmPmWSAFZOIgtjoPDepDOM0T7n2VD22knZtnkzA8Lc5TphoEj6hESRnFpLpjIFPiggAURWCsjy9Dc0nUYzhMcYxTAsayAJ2XZvJWLjINYlyEPqWiYA85YkKQAA2STfIwlrAsUkLCLCtT6nBTgFTgx11BSmA0vcXhWR0HL9J0bkLEYbsYASx1ktSysMp9DQ5oYhaCo1asdX1AVGAyq0bT4AAfWlqSiJCoDtB0YI2iatsVTKKmymi6Pm/KeRydh8kKKsRpgiMajqEBYwuJNE2TVN00zbMulCHoQxHGCxzaCdJuO2swobOpm1bdsVzOOMk17Vh+wTUQk0xvicf3Q8wZnOcQAXMnl2mNd+A3TgOF3IY8crE8zyiS9ryGNA70fZ9X2YD8YC/H8ub/GydmA0CQHKpyoOoR08HB8NGrExBWp8t4/MQbYAHYuuCwFeuIsElw7E4yD4RLeHGyairmHY7IcvXwO4y3qtOPjPJatqbY6rDWKdgECOBVSIpAMiyAopN/crSGo3qAAqYuAAN86PMvS4GWXM14XIIBi447jeVhTK4JMRFYLghn4Ppk3wVR8HaWn0U2o8EzfAArGAxCGRh2AmGAJh0CAZ7nm9NnkXhZFseApyzd6jwVGJ2jPGj8ZiTNrTQU8AEkq0kNMMy4BuTkIGlizaDSQ3EPcoq5EblIOWo9254hiDSCAAsj6TQlgAWUKEmOAOARDsGiCIaQPc4BdCGNfMgcRegQH6JXO+OQcjIHgeEAAcnoKIZBVhqBZIwfAaA0AOEQAAek4bAEgrBNJzkbtuFoPcJiFDWDwqGnDcRvk4aSLw99OGkO4IHFidtmplXDpBe2Uc8CkNjpHa26FPiIF2M1FOSlXYZzBFuSExQ4Y7R+oJP6+0AZLWsL/PKNkPDeH0gEFIKpzwxDiBIMATi9IMSSAE9Gvo9oOAOoDQMoN7GlB2oXaGTQWi4xzDEpM/diEDBvCMYJ4w6z/iDnbe2Oiw4VRKroyKVM0nm3uNUl47UTGAQsT1dO4VTjZ1ILnXgcTGLlLUdsBYHEakG1kvUkAwyDGtKkonbY5jfgKWdmnFSvT1K+C0hgPgO0gljFCeElxDhzATE8QKDK8ymLFSwg8JYUyI6hxjvUTxBiqpGNtsBLpLsen9RAIwX+eydK/VyhMdyv0ghmQsnIMAqigKAVDvrCOXy3kEC4A1PWTVEBfLaQnDpck1lBVTqFN26lyZe1ID7dafsJ4MDuRUwCuwUVaLjkbCG9QY7NOct8xOuxiW4TJVY7ZA0KybGgHwah0AV5RSPDOMAcBGAQE2GQIIMrYC8FumAK8rA7SwssgiqoUM8CaHrqXMu8qXAxGVdwauxd36SoHALNVvBNVJn6YM2QaBBCkCVefQ18LjBsEEJ66kqh5A2kHh/Mg59IBavYKLYY8A1DUmLE/AWHQ1jsBIFIBNMAdDbyrEmgs9cC2FK6Kwfga87gJgFoMYYs5N7SCHq0WQUhlptqgB6ngtb4auvri8LJHaADkQwoDNrEK2kdqwdDf06HeSQExyHMiobQ3Q9CO1MJYWwjh3DeFZgERMIRIjmBiKOJI2o0iYCyPkYoj1nDrWKp4Ii8SwEJLPMqrM59trPnx2MZhXYjsSXdX+VswFRBXDDEvpWII4RYNHnSXgS1DJIEQAZBMSMbMHW7xOH6gNHRZD8AYQzW8ZakzYfxr+u4bQz5urQ9SDDK6wAUPXXQkj26YDMNYewmUB6YB8OPae2m57xFXrgDeu9CjpHoYZFetmKimVqORZM1F37OWuRAFRguvK8UAZ+as4VliAWZ2Bbstw+yL6CUmtqUgChPDVAZLocyd90K5pgKQt6+MdV6uQ/UTdvr/V10ozAGAOAYqwKnPR+uOnJ6bDsIINYI8GRDxeAmfMoDUvDwJuiPNN5XBJjfDAaNiWaBQFPOa0tSadCJeSy/FB+IbRFvrvwX6MA2hRcnjFyjiGyGsbANRTL9csB+oKLg+tZbS33p0Kl1Y59h3ZjfHYBkcBo3WtBLXAQ7WoA6EbTRuNpa2vOI6wMEBI3CuT2Wxhtb6xpCSF6aeIb6JaAdiwCsPbg6kx1XzI3EgIXtvOPIx0Xp92jx2HbmfYsAx+6exa562HFYttuq61WH1BHTtvnTG69zJBSG8HvWdijMPlwwHHbwCtcX+s5AUMDForg0yzczOdvJO3x7HxLXgqQHRJ38E41OCtaBZBJm3lIKndmHPMCcy51V8P2f43R/607aGx7FeJ4QGKxbyf8JEKUOjLPOiewp7Kgswv2gTr6xLxzGGZcloFuL+z1vnOua2x0OATuAC0MRu6CEnXd73rBaIebHGoZwhRJtuuO3VTrDL50ll1WPdBxvqdrpoRx0jO7eP7p4YJo9IYT0QGEaJi9EjIySZkXImTCGbOVk4bjzzDKlOjKAs1FC6m6maZqiAev+i9P4qWSYkOfzNl9TMyCyzBzAkPWOQkYZFybICgmnEAUVyhngv0hlRaGUACqSrBBvjgDIdgxX/MgAUABKeaMVDrFq/h/10a3U0FcE5yYq6y5L7QGXAQxYAeeITIIKsUBXPUgdMOAffQ/a0YrOcXgbETwKsN3cAo/KAvDILJVIGIYYrNAFMebQhBdRtK/HoQAFAJeAy46pdBmB+Bzov8opaZN4hgO1YB8xoQxBQk4Achi1kxmB0xiC4A7xIBNh1tiE9w3x3gXwb4V430k5NFalEBXljZ6gtY9MnkCVAMkBflQMNlyVrFKVScMI+AP8V99IghhlN8CpJDAJWInl29EBdYMUP8DFlCB8ZIhV1kRVTNTh5UYpJBoxPB1hVp7RTCzBJDBUrD2V9NO9ThvDfDjgDEZl+UTFthOkNC3CIMx8qU9D0Rchl97RV8TDPpFpgjAIrZrDbD5CQB7C9M4iVDbZAJvhkiTNUj3YLNtI19nEIUoVnEYVzIjVgjSpHI0VZkOjaJYiUJqiBUjNXCGjR93Z0jvYsZhR6UOdgjgJpCDYrYMUeUcULYqinC1CJjSUpiKVxUP4pV3VZUJgaNlVVUb4NUTdfNaYDVuj4VT9zUkxLVLiqCa4JVP4I964PUztyJ3gkxFdCNTInjocoNA9w1J1ddxA7s5s1V8wOgK1S0edU1MQM1Jts0PN81ZUWsd5S03UUTjwswa16YB1K0m1ZBp1FsoAO17RaTe1uB+1fiu5u0x0J0p0qxaSO0482heD6YWM2M09N1+cGYeM91+Mc8hN88RNRFxMy8pNK8H1ZUn0HsX0m8tZTE7I28wj0UyjLiRiDNE47Jdhh8tCxUQAoN8wqd4M+tT9UM5MsM+tcMQTk1iMM8Rc7w3UqcwcbVaMicGMnTV1KERSt1GFuNd0+MuFpS88yAC8i95TL1FSK971ZMmN5MqdNT7lWVQiZD9SuVtN7TKjRjdjLYkjjNulGidkBEWjq82YrcpcbdXNjQWC8cGVvMpx7jWBT9AsCMAdYBwt4AqxUdAzYs+sy06sUs0sR5w8ssZzctc8T5SwisSs7sysOtKsh48E8opyGscBmAIEb9ico8ugY8Ocxzesa8jwhTBs5yRsxsm49xoEpshgZsY1ucZ0lsVtbs1g/TNsjsds9sbwDt8xAKTt9diclwpxrtVtBCjxQQntw86A3sPsYdicfsG4gQAdTzgcCxNtrUIcidod0FSc5dSKjdCT65RyQTMdsd64e8GUCcFFLySdPZydKc+tbzacsie5SBGcPyTy2dRzqtPzecxSqxBczdRcYNry0BGzpdXM5caK78AyVd241c3UNdAC4Dtcag9dWK4AjcpKwtzdZKGzHcmzndVV0KHdJdFKbLUTOhPcA9fdo1XK1sSAQ9hzw8XzI9hLY8WYE9IcBZ+DbzQyN1wzxSozs9D1+FZTC8z0S8JMlS0z6zJo682yG8OdsyKkzEvlrC9hZlGKliSzjSTF7YAp6iqzpi8BrTzLJo7S5KHTy5GMnNnS5LXTVL3SoqhxQEfSJyDtIKgyMzwr2NRTPSJToyBMZT4y5SxNkypFUyZNsQ5MFNJpcq1FdgFhViBiIi8AqdYjJkxiTF9iwMR8jigVvjTj0rKxjQoAoAkp8sAAZJNGgVudQLIEAU8mIL6ywUlIIL6n61jSgXgDgZwVYdVe0AQkyW6o8HQQTYw36J6j6C0McEkBMLAcYOAA0MEuFaHW6UkB6lGo8V6iG1ubULG1gu0Rae0AAam2ATEIn4SlybzLzNQtXLil0epereshtIE+MdWupdWJxJrQHghLQQoGSBJzBvEECwHPmYNhA4PUtMi7j7GV2Z2AOJ0azQWiFOyXM5xTQ4EIlO36vrj4jGrDLFMz0lJjLiuE0SuLwVKWtvWVKUXywlrr2Jt5vJu9kkOAgeE/UKvWLKO5rFrJvevTluHuG2GOrLO2DsnNNFUBU8KfjAB8OLGOGuXyLMOU3mBWN1PzNmSiKzsqC2NjvjvaUwhWOTvcLqug1tOszZharLjauYypy6tQJ6ptq9OJ19KGtYvbswxDPGt6sjKzylIdoSsTIWtL1duk0UVWozPWq2gDuAmqWsILK00OsqM/ROswjOs0JTrM2Fr4Dhrcx9srEjv5s+u+t+ggAAL+sFH+EBvvucUfrQC+p0HBqjtIASm3KarZgRqICRucTFoymLAxvsGxtxqDQJoJyvtJr5opqpuihpoKnpsZuUhZqeheM5rLnDt9r/sFqdR+L8vrjFoloBJzhlq6DloVo6CVtCTLR3lVrV111oLaDmzuEIh1tQXQXYANvyy21gBNoYTaHNpF0dCtsit7qmtitz3irmqdqTPnuvWWsUSocdG9p5uvpQf9vzrULsmKLCJWWKqQbQBvtbliP3oTqTuqvA1qsiminTszr8JzrRoKKMZsNYjZWLv2vqFLr8NsfKprvUMrKccuvqqbovtbuHo6pwxrjdPPg9K43IwGrkr9MVVOx62TGDIGwivTy4wUanqUcdtnuSpTLdrTOXqc1XvSkkLsmRX6I0wxV3oru1jCbYjrurOOOdXPq4tkD+082IdvqBt+l+pAH+tft4AmecSmZ/oMf/uhsAebsmhAbAdoggc+igbXjQaVTgfBKkFugjuWcpuxowbMCwaZrIFwbZtNXqFeN4EtWGaBDOb9oFvtS+JOJFrdW0exi9Rlref+zHDyynF/v5psFkBUEfrgBflkBzQhtkG4biBHgBaRHur0eQc+fOiIX6Efxkd4GecNrBuWfIzVxBdybwVgCPEEdOyDzuw6EATfBiCjUkFZPBfi3+GUpEchdbgEGEBYI5cGFJL5JDWtDhcxvGDYGldYNYarFyC4PaD5xbTdSVbQGHTuw0lDzgAAG4cwkx4F5AtW/zSX+WyA+5w8QW2BZHimIzSn7bymZ6kqXaNGamZMMWThOEqWPm/7Nr5hTTdZCqnkMVfWxmbHKjdYD6dgQNImLrtCXGlU3Hoj/C8WvG87m8kATH/GDZt6u9gmYio3unfHennGrTG6+sgGA4TUi4QBHTRrO7knurUnx6MnxysnB68mEnR7rbJqYqynZrBFVG56UrNH0z6msymnWJg29TZkOmY7g4S3k5HGE3LTGAz71m7rw39HPm77TzP7n6Aa5n37aJD3QaLWVnBQ1mL7NnWjtn8tIGwBoGDmcauj8aTm/YI2yALnqaghabGAGbbn+KIBWb8G3jy4d2cWSHvmhbfnOWvXJbAShwqXRYpBzXyX95YXaIEWYAkWMJlc0Wv3KwJasW/X+a8X8kCWLaiWSW+XyXQFKWJogQ6MaXKx6W2hGW/zmXiFWWwB2WpAKGkxSXSVeWIXyXmGRWSTq1xXrSJBaI5XJBZWYH5WOClX0wKCSNp11WTWh5tW7BdWDWugjXdPo0MPPmrX8wbXWA7WJqSmB2nWh2EzXXFr3XF6PaSOdGoOrHlmA3s2drWmdhQ2yjvPrHo7cVE6S2HYy3Lq076Z3Hs6Ajc6gifHmoWmv0+UMVC3y7F27ZQ4Y2bDvg/wopYBSIQYihrAVododBTY0R/B8XeBR0HxnA3KhCXBOFp44APc5YLIIE0APciBgJR09XV0gWqJ18GJ7wcheA8MmywAX4hiTJ4GwARuwB/BV04u6pjJDA8wJbGAXoFjlFFRpuUlLhclTlcpLBgATuZvV902lQrBX4jJoV5iTgLj1TbVGAqdWzxB2ycqAhmSbulY3BGAP8+BrupAZuoe4vsudv7vMi4hHvFughLaPjvuSqNqAfVuoeof0fLGwuBbR1gbR1a0EuYBuBseceGq7qiHd2SGieH6ACSf4vU2KegeZuQSku0aIeqfcehnmO8dv3CfifSfWfKfefvvQvlnGAGeP6mfRey62fIecf/BxeAgKATv/BAewAKfpgJVmAkBQAqQ1tJA8BjwQB/B/AgA=="}
import { createService, perTarget } from '@studiometa/js-toolkit-v4';

interface FocusProps {
  readonly hasFocus: boolean;
}

const useFocus = perTarget((target: Element) =>
  createService<FocusProps>({
    props: () => ({ hasFocus: target.contains(document.activeElement) }),
    start(emit) {
      const onChange = () => emit({ hasFocus: target.contains(document.activeElement) });
      document.addEventListener('focusin', onChange);
      document.addEventListener('focusout', onChange);
      return () => {
        document.removeEventListener('focusin', onChange);
        document.removeEventListener('focusout', onChange);
      };
    },
  }),
);
```

`perTarget()` gives it the one-instance-per-target caching every built-in service has. See [`createService()`](/api/services/createService.html) and [`createServiceMixin()`](/api/services/createServiceMixin.html).
