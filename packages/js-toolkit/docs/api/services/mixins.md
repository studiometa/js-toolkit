# Service mixins

A mixin binds one subscription per mount cycle, under the **one method name the service owns**.

| Mixin                | Hook             | Service                                           |
| -------------------- | ---------------- | ------------------------------------------------- |
| `withRaf`            | `ticked`         | [`useRaf()`](./useRaf.html)                       |
| `withScroll`         | `scrolled`       | [`useScroll()`](./useScroll.html)                 |
| `withResize`         | `resized`        | [`useResize()`](./useResize.html)                 |
| `withPointer`        | `moved`          | [`usePointer()`](./usePointer.html)               |
| `withDrag`           | `dragged`        | [`useDrag()`](./useDrag.html)                     |
| `withKey`            | `keyed`          | [`useKey()`](./useKey.html)                       |
| `withInView`         | `intersected`    | [`useInView()`](./useInView.html)                 |
| `withMutation`       | `mutated`        | [`useMutation()`](./useMutation.html)             |
| `withScrollProgress` | `scrolledInView` | [`useScrollProgress()`](./useScrollProgress.html) |

[[toc]]

## Two call forms

```ts
withScroll(BaseClass, options?)   // a mixin
withScroll(options?)              // a class decorator
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e012d12a0a2aa2d10b51eedd8bb4b6057939803b937f279ea7fce5ea6dc403a2","data":"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"}
import { Base, withScroll } from '@studiometa/js-toolkit';

class Header extends withScroll(Base) {
  static config = { name: 'Header' };

  scrolled({ y, directionY }) {
    this.$el.classList.toggle('is-hidden', directionY > 0 && y > 100);
  }
}
```

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"3e0fe342789e92b8fa30e81fec695cbbc0b37e68e7012dfe7afd67c01237a033","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XgAMy6YAefTAoXCkWijH4ERB7BSiAcMAAwkiUdw0TI5PQ4soJFiwJ1SF0HrZjIwiGwujA0dIKKFovI0Ri/HAACIwRGkZi1Uikmj0GTGPg6Yy8IgQdhQcxWGx2GE2OEMKguNx4ADKA14mx8iNhUXsiLAyJSvGYil4pBgKXYnTIBu8vmEvAA7t5oU1eE7eLBkZEoIldql0plsnkqAUinBShVqrV6o1mm0Ot1ev1BsNRuMSrB+YLbHASsa1ab4gVLKxprMQPNFogAIwAVlW602y3D+0OHgrEVNTmyXyuIBudweZCQ7beHxweB+M92/w8LA4XD45s6Xqa+B1/E0rFYaL1pCI7H4MAAsuxaGdJIfj6wABJ1HK8ABkvHPl+vr42lAaxwJIpiNke9RrAqIDGCyz5QdICwHGgLIQAARuUfJoGYFjhCqnr7ghJ5OFq7ggDqXToXAR7sOhPgAAY0S+MBQIw3AMaCthyPc+C8JYEDgmaGCCDA8S8F4PiEYoECev6IiGoGMAgswXSsPYewoWG1ARkgGRZGcMYEIUxRlJUNR1A0TQtO0nQ9H0lgDMwQyBPmEyqBeV7wCUlj3mccDVmgtb1nMewMIgABMABsnZgBsWytuOmn9iAhGbMRdanOciDjpOArTk80XztQnxLsQK7UGuIAbkC25hJW8LmpaaLHKSlq4rw+KxIoxKqKS5KUkKNJ0qwDJMiy5qimgHJcryxZCiK8jipK0qyvKir4Wa9VDtEpGuOReoaW6g7qqylrWra9qOs6pCukaXJej6/r2AGQZnKx2nJGkelRoZ+QmQmZnJpZaY2Zm9k5s5eZjBMRa2CWpBlidVY1nWMyhQs4UAOwRbF8U9jpfbhRO23qiO71ILjE63PljyzsVmCLt85XkKu9BMFgmg4HYGB8K12IpPEYDMI5aLkmcKROE24UABw7FkXYJfLyXE8Ljnk9lVN5fcdOtgAzAzpXM78bPEzVW57ulkEnowWhoFCcAAPxorbmHYd+v5kP+t5+WAADyWD2xEoEZUhRMssckjHIY2jGBKvAAD68OCb0hh14q0vSjISRNERTTNwhzfDC150t0jx1KvB3rQrGcsIMjwdbb4fh7f5eYBiggWBEEsTBce8IwADULa8CzrAQMwUDcBtyr2GlB5N3t2oeJR1G0fRvBMU3rHsZxILcTAvH8YJ0QCCJaziZJe4yXJAaKUGqnqQayEDJ9ukoL9uT/fGibmSmVnplslmByTkXIjBhiUDy3syy+QfGSQKwV0aNjCrOC4es8bdkSr2FCeB54ZQ1l8dB1Mpy6xbIbJmBAWZ/HZgOB6r5D6wFZsgzGs4IpUzWHFTBMVCY4I8PQyeFVRzbGuDTHWM5EBRXIV8ShJtKo0OqoCC2ggPSR1kN1JQ6IY66E0VzEwM9bD2GOEvciV9lH+DkEEEIyNT7qICkkd++lozf1MkmCyqZrIZjstmRyuZXIQJCsw5sLY9ZYwwUrbBKUjFZS+PLbWBVKZkPeCVChy4mFTSYD4wgU9eD8MYR0bebEOprSgFLFBrZWjcI4fjRAMsInE2YlBViBCkAdmIbTcREUXgNkRLAPASoDG8GAOiXOJpogsjwU3XgLxQSaEsLwAA5AAAS8SA5Irj/5pnmQAbnMOYRZ1i0CMCGWrbO8zclkHmVM6eYBFkTJfOxcwZiRDnNurY9EgzzC8F4A0k8O8+DABeOYF4TgfHMCQKAbqcAoR4DQAgF4LwgA="}
import { Base, component, withScroll } from '@studiometa/js-toolkit';

@component({ name: 'Header' })
@withScroll()
class Header extends Base {
  scrolled() {}
}
```

**The mixin is the primitive**, because it needs no build step. The decorator is sugar over it.

## Stacking

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e688771335982a9c6c6c5cb390d0f1597b0f6aac3ee60c81fe5e74a4f7345d55","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8UJgTq8ADuTXwACVmAAzRC8ADKZCI7H4MAAsuxaGdJLC4QAJOo5XgAMmRqPRMEJzEUazgklM1HRORgUGZxgovCIEHYUG5EAARuUYA8zBZwnYIVCCU4XG48EiukK4PxSOwhT4AAZoVnsxjcbW8Wom7y8OGkZiWHyqUhojEW2xye74XiWCBdaICDCCGCJXapdKZbJ5KgFIpwUoVaq1eqNZptDrdXr9QbDUbjEp2h3wEqWHFnODxAqWVjTWYgeaLRAARgArKt1pskAB2QP7Q4eSGbOWnc6IK4gG53B5kJANt4fHB4H7j3b/DwsDhcPj8CJgnsw+DsABeMERKPt1OxuLA+J3++JEFJFKPudp9PgTJApEv7M53IAomsbdFBSKYpoBKVg2NKW7Qu+8quO4IDKqq6qajqb5wHuBpGk6pAujc7qet6/C+ms8S8F4PgKl0f4xL+UT2OwIibGRMBwswXSsPYewHGgAbUEGSAZFkZxhgQhTFGUlQ1HUDRNC07SdD0fQ2umgSZhMObUnA+aFqCJZoGWFZzHsDCIAATDsWTNlsdZDhxXYgBBUH9l8Q4jlaY5PKZU7UJ8s7EPO1CLsOfgiGodysEItBONWRmto25lgBslkABwdpxeAhVaYXMBFjlIMZ1y3K5jxIAAbJ5mAzt8vnkAu9AAiuwIQfCkinuyADCQWSOVMAQHCDgwNykGoVeJLkpSx4Yo+UAMi+KFoRyIDGItjDHO1wiIi1UCrf4nWfD1fUDe+163mND50lNz7MrN+7zYtgpYHqG4APyIowwqig8o33ieWkAPL3X0oKSLy/LcsckjHIY2jGKNg1oUdn1UhNZ3TZd743cYfAAD68F6sBwmc7LcOtOJtR1G1bYyXV7ccB1DTSI13ojNLIxdr5o5yXK8AS8OM+NzNPoy8RC4tvCMAA1LWvBVawEDMFA3DmKBtj2I1cLQYqHjwWqGparwur6lAhrGqaDEWlaNq8Gpjpws6MCurhXr2ARfrcckaR8SGgn5CJUZibGkkJjJybyWmzBDMpYyqUzGkFmexaluWMwGQsRlLHlcUJW2KW2arTjZF86cufcRUmQAzGV3mVb8NVGSAy5Anw9l0ztODUxIxjLRIFOIlTvU01L/1PS9b1AQjfOnmcf0PYDP4wJRoMSODBiaFDGO8NjuNMQT8vE7QpPCC33V9xItNwwzJ3UpNKNs3T6OixLUtBDLcsK5KYEq7KDnODBSoqtrSF6yuuhY0NssJ2xwh6R2PoXYkXNORSichqLejomaRizFWLsQWJxV2vEUCe1yN7SM0ZxJxikomWSKYFIDDDhmSO2Zo6aTjjpPSScqyGQnBcIcax4otistnWuTc0J5wJrlfKo4S6l1rBXCqBAqp/FqkuQEq5fDCD6jIOQ9A4jKGXkYXgegIYrxMIrKU9hjjq1gqRFR/g5BBBCOucIkRvSxEUMWJIuD+KhkIaJGMEl4zSSTHJVMikaERyzPpNhKcJy1lrE2HhlkzI2VrmYnKJkxGFXHIgVoxlpFfFkdXfyCi65YBXmQTAfB0psHCvEdcYB8YpERMAcwvBmm8DANaA8ls0AanigAbnMC8SK7C6zGRWBnXhxV+F4BqXU4RA5S5pOLhk147wvIyLnNVAptdGDFK0KUjAfA2k2kRJ0bpKRBmRLrK0LhFltiTI8Ick4Ak5kLLcrlC4OSfL5JoIUxgilCDy14BUzKtB4hAMNsAXg3h2ApAKLwF4DSmktKhTCtAiI6QYD6WAF4RMeR8igOcmstZirzLGZZdsPFOy1zBbMr4sUi6vJMh8quflvlbKwHcRSZA+DIoKGisAGACVGVrK2El3DM6IAmRS1K3wYDQoKDSpAdKCqLKeLWbJKyuqfJZQFX5Ax/nlNClUvU/A2Tgt4LANizA4UIrAC081MBLV8oxf0nFwN8XJ0JYlUZYrxl3JZCa9kCrEDkvpSXdV05cnrPkWyjlAwuX2sdbwdFgqJxLGSqSxVfqLXJCDSG5VDLokvErOuWAeAlbSghf3VW3JBH7jhWbMIvAADkAABQJVDkg+NIQmJtmLzCCFUUC8KGiFBKBlL2eEjBa0wE7qobgfBGm2s6cwY1II6l6N4BCh5iIm1Dqyk2uFfal1gsYBCnl9hsWbpeOYRFxrTWnoTckOFC7r1YqcMEpAoBnGoQiHgSoIAXgvCAA="}
import { Base, withRaf, withResize } from '@studiometa/js-toolkit';

class Parallax extends withRaf(withResize(Base)) {
  static config = { name: 'Parallax' };

  resized({ height }) {}

  ticked({ delta }) {}
}
```

`$services` keys accumulate through the intersection, so `$services.ticked` and `$services.resized` both complete.

## Options

```ts
interface ServiceMixinOptions<Target, Host = Base> {
  target?: (instance: Host) => Target;
  manual?: boolean;
  immediate?: boolean;
}
```

**The options of a mixin are not the options of the service.** `target`, `manual` and `immediate` describe the subscription; they are removed before the `use*()` call and they are absent from its options type. A service's own options go in the same object and are forwarded:

```js
withDrag(Base, { axis: 'x', inertia: false, immediate: true, manual: true });
```

### `target`

```js
withScroll(Base, { target: (instance) => instance.$refs.scroller });
```

A resolver that comes back with `undefined` or `null` reports `service.missing-target` and starts **no** subscription — because a renamed ref arrives here as nothing, and a service with a default target would otherwise observe the wrong thing and look like it worked.

A service whose **own** default target is nothing, like `withRaf`, is untouched: that is its contract, and only a caller's resolver can be wrong about it.

::: warning The resolver is typed against the host as declared
A mixin is applied while the extends clause of its class is still being evaluated, so `withDrag(Base, …)` types its resolver against `Base`. A component reaching further names the shape it needs — `(instance as Base & { readonly target: HTMLElement }).target` — which is an assertion rather than a check. v3 wrote the same line as an `@ts-expect-error`. That is why core checks the result at runtime.
:::

### `manual`

Declares the hook without running it, and `$services.<hook>` becomes the switch:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"3c9539c5761bd3c284afb45c1df5c18b6d7e9495e0b4e7f0895157c2fe86c714","data":"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"}
import { Base, withRaf } from '@studiometa/js-toolkit';

class SliderItem extends withRaf(Base, { manual: true }) {
  static config = { name: 'SliderItem' };

  ticked({ delta }) {}

  onSelected() {
    this.$services.ticked.start();
  }

  onSettled() {
    this.$services.ticked.stop();
  }
}
```

Each handle is a [`Toggle`](./toggle.html): `start()` is idempotent and `stop()` is safe to repeat.

### `immediate`

Asks for the first delivery at subscribe time. `withInView` defaults it to `true`.

## It never occupies a lifecycle hook

`mounted()` and `unmounted()` belong to the component author, so **nothing has to be chained**. A class that mixes a service in and writes its own `mounted()` without `super.mounted()` still subscribes: the framework's own `$mount()`/`$unmount()` pair carries the subscription.

- The subscription starts **once the whole of `mounted()` has run** — including an `immediate` first delivery, which therefore reaches a component that is fully set up.
- It is released **before `unmounted()`**, exactly where the mount cleanup used to release it.
- `$unmount()` releases unconditionally, so a manual subscription started outside a mount cycle is released too.

::: tip A userland mixin still chains
The rule is about what the mixin **overrides**, not who wrote it. A mixin that puts its work in `mounted()` needs its subclasses to call `super.mounted()` — and the way not to need that is to override `$mount()`. See [`createServiceMixin()`](./createServiceMixin.html).
:::

## One hook per class, and that is the limit

A mixin binds one subscription, under one name, for each mount cycle. There is **no `hook` option**.

A component whose subscriptions are **one per markup declaration** — one per attribute, with its own modifiers and its own threshold, known only when the element is read — has no method to name and no fixed count. It subscribes itself:

```js
mounted() {
  return useScroll(this.$refs.panel).subscribe((props) => {});
}
```

`on<Event>` has the same shape: a handler name belongs to the class, while a set of events can be data. Both sugars are keyed on a name a class declares, and both leave the same escape open — bind it yourself, own the cleanup.

Neither limit is about a build step: `withRaf(Base)` is an ordinary call, and the name is fixed by how the class is written.
