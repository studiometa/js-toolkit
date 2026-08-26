# Lifecycle hooks

```ts
mounted(): MountedReturn
unmounted(): void
```

```ts
type MountedReturn = void | (() => void) | MountedReturn[] | Promise<MountedReturn>;
```

Both are meant to be overridden and neither needs a `super` call.

[[toc]]

## `mounted()`

Runs when the element is in the document and the component's mount conditions are met. It runs **after** every `option<Name>Changed()` hook of the same cycle.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c73d87c823884887b52b87e2568efcd1bbd548ab0ff4aac6e130a265e01ca58d","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8NRCDBkJzzRaIACsAHZVutNkgAGy7BYHBgeEHMMHkU7nRAAJmut1I90eKLeHxweB+4N2/w8LA4XD4gP8DiksliimUBk02l4emOhm0Zgs4TsnKcLjceC8PnZASCIX4YRskWicnocTgiTRaSQGSyZzyVAKRTgpQq1Vq9UazTaHW6vX6g2Go3Gkxmcz2mNhxKyiK2iB21HRhw8xyc2S+gZudwe4KJAEYqdRPrTiPTqIyQIwsAKyJg+NjcfE1WAAGbsFKIXjAcy8Zu8MDMSwweudUhnFIAbnMLwhfqQAA5RwiwBsQ6jw/tIyBKzWUjGzl8AMwkxMU57pzA077ZvG5+hMQtaYsYPhtjtdtA9qfDhaYpYrINTpGhtHzzHgdsnE0CU3RdSXJZNCQuPdM0PX4GVPJkO02aBS1BMh4ksCAumiGAoEYbh6yICB2CgGVXHcEAABl2CrGB+AwQQfEICAcgoXgO2YLVal4AAjHwjx7KBYDAeJeAAWRxXhSAGLpSDAXhmF8GAOK6LBeCrLCHj6MBzEYWx5LkhYyRCCAq14TYYEsPhNmYexSCwkQIjM7xW3kXgAAMABIsIwrC0DwtzeEAFAJeDgDAwH4XhbHMLgwv4RBzCbFsYvCtjMOw3C+EbOSW2bStOhC2s21YIV5IAd2YJonPYPUPLOcpaL8gBlfoAGEIhoehuAHbKcqk7pZIKlIio6LpuLgfge14xhGCINguhgPgdGMBteEAMgJeBeLrEubF4ErAABBUJwk1GIdUUXt5LY9haDOSTpNkkRStuexKp5JR5NYCIUl4UqmnwXgmjgcwIFKsBWNujiQkiTpe3i7SetS3ycLwhttpbPqZLk5A4BUtCfPSvDWJRpaVvWl4pm6nKh19Z8kBTCDJ2nJB4TnDE8HxmgSPxL5oS3MkkyeQkoIPAgjz+eD83PHA7CvTlJBFAUTHiDyYFYesAAlpFEiiAFE1g7aInyhFNWhTRnP2AvY2Y8FXWFXAlZwTfmd1ed4MxFuljw639GEQwgoD4PWLKiNAOgGfbCkmroaEYABHLo2Go9gcIAOX/O8HxSVjZtYeaM97fDeEI4jSLlDwFV4AAqSu3NUNAI/vdhuOjmB/OrtiBn9yLTPM3gg4Nl7sNIKt7h8OuRF7nP5u7/T5MjpuW8iuTe7gHB+CTnC5H1kORIASR75ybMb5uaA+qTmCgEI6GqtA4FYye5p8areBUqAbJwvtIvM0hftUS7IlKnPY+i9n4X1gFAH6f0nJjzXhvCBN4fAcQgVPGA8Q9rIFEgAERTrwAASjAGiUlwowCmIwC0xQyjDFVheUg6EIAAC92CsCEPEWwKQSiyjgCUAA6jAbiJR9pqF3iUfuIcSh1wblHGg3AjaYhNrzd8TNED02/NbEAEj54nwArGFEfMwJPBTOucm1xoBfBAFYGwUpgCcg2mpTQlheAAHIAACnQeh9EQswG0NQ6gNCaC0VojjurmCVMCVCpBtQKHescVG2V5hoHYBFJctYSrWIQfWRxZYyCOI2sE7KHNkaZTRpsaqytVZh3rpolujBHELE4FUDgJBHGsUcTYDgNBHFbWyrtMA1MQCeKQKAHkcAtJ4EqCAF4LwgA=="}
import { Base } from '@studiometa/js-toolkit-v4';

class Player extends Base {
  static config = { name: 'Player' };

  mounted() {
    this.$el.setAttribute('aria-live', 'polite');
  }
}
```

### It returns its cleanup

A function, an array of functions, sync or async. They run on the next `$unmount()`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"65c97bb3e072f561f3f82e0efa745ba727394588f4aeb9192836987a68682ef7","data":"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"}
import { Base, useScroll } from '@studiometa/js-toolkit-v4';

class Header extends Base {
  static config = { name: 'Header' };

  mounted() {
    return useScroll().subscribe(({ directionY }) => {
      this.$el.classList.toggle('is-hidden', directionY > 0);
    });
  }
}
```

If an async `mounted()` resolves **after** the unmount, the cleanup runs immediately.

## `unmounted()`

Runs at the end of `$unmount()`, after the cycle's listeners are unbound, the `mounted()` cleanups have run and the scheduled tasks are cancelled.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"bcb99a06ee028ded48090efd63d787ab29c27f71ced2d96f4a38eec5f6969e24","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8NRCDBkJzzRaIACsAHZVutNkgAGy7BYHBgeEHMMHkU7nRAAJmut1I90eKLeHxweB+4N2/w8LA4XD4gP8DiksliimUBk02l4emOhm0Zgs4TsnKcLjceC8PnZASCIX4YRskWicnocTgiTRaSQGSyZzyVAKRTgpQq1Vq9UazTaHW6vX6g2Go3Gkxmcz2mNhxKyiK2iB21HRhw8xyc2S+gZudwe4KJAEYqdRPrTiPTqIyQIwsAKyJg+NjcfE1WAAGbsFKIXjAcy8Zu8MDMSwweudUhnFIAbnMLwhfqQAA5RwiwBsQ6jw/tIyBKzWUjGzl8AMwkxMU57pzA077ZvG5+hMQtaYsYPhtjtdtA9qfDhaYpYrINTpGhtHzzHgdsnE0CU3RdSXJZNCQuPdM0PX4GVPJkO02aBS1BMh4i6MBLAgDCaCgRhuHrIgIHYKAZVcdwQAAGXYKsYH4DBBB8QgIByCheA7ZgtVqXgACMfCPHsoFgMB4l4AAlDCRGYexNh8OJeAgKteAAAwAEgwrCcPw5SKHMZgq0eXhZJUzTohgPDuGU3wYE4rptDYzioF4UgBi6UgwBESBNl7etmCMmzSBcAB3MAjNuNBzD41gIjSIyIF4Py4BwfgaPYfheHGOj+KU1RuiwXh2BEPjCjIXggp7ErQq4MLFTWWysHMZTTNw7TnNc9y4DYyJ6DimreFyuyCvsDCXHgfUQEhTEUwgydp2Wb8MTwDTsLM0j8S+aEtzJJMnkJKCDwII8/ng/NzxwOwr05SQRQFEx4lUmBWHrAAJaQAFlKIAUTWDtoifKEU1aYC1g/ENgL2RaPAe1hVwJWcE22ndXneDMDrpY8aBOxhEMIKA+G+mBfrQeIXKwkgAEFCh7HiuhoRgAEcujYVLzIAOX/O8HxSAjeCIkiyLlDwFV4AmifYgZcd4AAqKXlNJ7NKfvdgabpyyZbasn4D66SlZVnwgqafA+qSuiWacm8fCrTRLD6x7CaiYnzHMZA3oAEVZ8SYFolywH4GApkYC1ijKYZHovUh4iwgAvdhWCEeJbBSEpZTgEoAHUYB4kpybUABJEpRYdkp5YpqnldpmBuH+qbWnhd85sQFNNrnSGQBLmBFepivYa+eHQJ2pAU3XF5ZkXaAvhAKwbClYBOV4F5eCtsJeAAcgAAU6Ho+kQ5gbRqOoGiaFpWhXgcwHMJVgVQ0htQUJQ58bUL+uSNA0tCatayFBtWw51eyzIFe88z5Nl4MtHC5l8INhAc2byepoYk0JgrMuetGArwWJwKoHASAr24GfZsLxBxOB3kgUAPI4B9DAHgSoIAXgvCAA"}
import { Base } from '@studiometa/js-toolkit-v4';

class Player extends Base {
  static config = { name: 'Player' };

  unmounted() {
    this.$el.removeAttribute('aria-live');
  }
}
```

It stays available for the cases the returned cleanup does not fit. When both exist, the returned cleanup runs first.

## What triggers each

| Cause                                       | Calls                                         |
| ------------------------------------------- | --------------------------------------------- |
| the element enters the document             | `mounted()`                                   |
| a mount strategy's condition becomes true   | `mounted()`                                   |
| the element leaves the document             | `unmounted()`                                 |
| the component token leaves `data-component` | `unmounted()`, then the instance is dropped   |
| a breakpoint withdraws the declaration      | `unmounted()`, then the instance is dropped   |
| a reversible strategy's condition ends      | `unmounted()`                                 |
| the node is **moved**                       | `unmounted()` then `mounted()`, same identity |

**Unmounting a parent does not unmount its children.**

## What is not a lifecycle hook

- **`updated()` does not exist.** For an option that chooses a resource, use [`option<Name>Changed()`](/api/methods-hooks-options.html). For an attribute the framework does not read, use [`watchAttributes()`](/api/dom/watchAttributes.html).
- **There is no permanent state.** A component never declares that its work is over. "Once per element" is a plain field — see [Lifecycle](/guide/introduction/lifecycle-hooks.html#do-this-once-per-element).
- **A service mixin never occupies either hook.** It overrides `$mount()`/`$unmount()`, so a class that writes its own `mounted()` without `super.mounted()` still subscribes.

## Failures

A hook that throws is reported once as `component.lifecycle-failed` and the cycle continues. It does not stop the other instances in the same batch.
