# Services hooks

::: tip See also
For an introduction to using services in components, see the [Services guide](/guide/introduction/using-services.html). For the service architecture overview, see [Service Architecture](/guide/concepts/service-architecture.html).
:::

## `scrolled`

Called when the user is scrolling.

**Arguments**

- `props` (`ScrollServiceProps`): The [scroll service props](/api/services/useScroll.html#props).

**Example**

```js twoslash
// @twoslash-cache: {"v":1,"hash":"034ac5b7029bb78ee88e624229a89bc601f8118971653ff288266fb37ac5b4bf","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiABsg1EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+xRAEYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAAOADsQ0B4ymoLmCw8SyGiNWqJAWx2e2uiAAzMdTtRzoSriTqGSQIwsJocHYMHwoa93v5+DCAGbsEKIXjAcy8Qu8MDMGq50qkREhADcBaLrAgOd4ACNVTBmGBa2AjoLXO5IZnsxLqKFwpFonEqAkknBUhlsrl8oViqUKlUanUGk0Wil02AsyEyhi0FUwP4EpZWMbPr1vti1v7baN7b9HeC7oOQst3UhH170ZifpBviFxEtcpL0EwsZaGQmB8CWZa8BWVZOGad7YhaT5Ag6I5OhCCG4G6SKINM/4+liJF4iGBIeGBEY0JB5LQfGcG8A2Tatvk7ZgKhXxINikzYlhL5/rM74eOx37EQArGi5F+pMVGYDRlzEjcjHRhuhBQEmLwwqmcD8JorDDFAMZxrOvAdomuZEBA7BQLxt78T8GwAs+wKYbh4mmkZ+SmVJqxed6GK+gcyJKaGtHhupEIxjsG5kHwzGWdZTnmtifzCcCsnec6IApYFSDBQBYX8biwbKaBMUQXFzGwYmdKSJyFnGP4AAk7G5ow/i9WClllLEkAAO5gMg7R8Doxi8HZDm9sKHgAMqWGwrC8PgMCsPGvC5GxjZIeUGYZsOwRSig46IpOBAKrOSoLqqy4amu2qbvq26tIiPRgPwMBZFp0ABBerAAMTsVke4KAwnQ3hl1rZThYn5Z1jZFSCZGhRRwHUdVam1VBCW1ElvApbmaUw98yJrLlwweUguWIxChVEas/whYB4VWkcJrprAeC8rY9jAHSvBHLwGaaJYvAAOQAAKrlqG7MPOKpLkUUtduYdB8vYsAZswZSsPYNIiMm+lwnI9BMsoor5mAhY9Ce/ACJ+7J5nWhYEbmUum7CaBSxQ7t7U2aCkGUMAB3bIsa5HhnGaZ5lGHwttFjt+DsAEyMhIwUux/5Vb+8TFncF2hZHOYPZUIrSCgIyYBwKeeCZCARxHEAA="}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  scrolled(props) {
    this.$log('scrolling', props);
  }
}
```

:::tip Tip
See the [`useScroll` service](/api/services/useScroll.html) for more details.
:::

## `resized`

Called when the document has been resized.

**Arguments**

- `props` (`ResizeServiceProps`): The [resize service props](/api/services/useResize.html#props).

**Example**

```js twoslash
// @twoslash-cache: {"v":1,"hash":"175d415b09a346dfbab2110a8d125a790367fb90cd28da24ed0e1edfb13fe6bd","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiABsg1EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+xRAEYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAAOADsQ0B4ymoLmCw8SyGiNWqJAWx2e2uiAAzMdTtRzoSriTqGSQIwsJocHYMHwoa93v5+DCAGbsEKIXjAcy8Qu8MDMGq50qkREhADcBaLrAgOd4ACNVTBmGBa2AjoLXO5IZnsxLqKFwpFonEqAkknBUhlsrl8oViqUKlUanUGk0Wil02AsyEyhi0FUwP4EpZWMbPr1vti1v7baN7b9HeC7oOQst3UhH170ZifpBviFxEtcpL0EwsZaGQmB8CWZa8BWVZOGad7YhaT5Ag6I5OhCCG4G6SKINM/4+liJF4iGBIeGBEY0JB5LQfGcG8A2Tatvk7ZgKhXxINikzYlhL5/rM74eOx37EQArGi5F+pMVGYDRlzEjcjHRhuhBQEmLwwqmpDwOwABeMBQDGcazrwHaJrmRAQOwUC8be/E/BsALPsCNq4eJICGXAJlmVJqyYWRGK+gcyJKaGtHhupEIxjsG5kHwzFWTZznmtiPyhcMnlILJPnOiAaXBUgoXeuFFH3tFKl0fFUFxrBiZ0pInKWcY/gACTsbmjD+ANYJWWUsSQAA7mAyDtHwOjGLw9mOb2woeAAypYbCsLw+AwKw8a8LkbGNkh5QZhmw7BFKKDjoik4EAqs5KguqrLhqa7apu+rbq0iI9GA/AwFkWnQAEF6sAAxOxWR7goDCdDeWUWj8wnAqRYnFT1jZlSCYWAQcwHUaBcUQQlWBJbUKW8GluYZfD3zImsnp5dhiCFWjEKlURqz/JVuMotJRwmumsB4Lytj2MAdK8EcvAZpoli8AA5AAAquWobsw84qkuRQK125h0Hy9iwBmzBlKw9g0iIyb6XCcj0EyyiivmYCFj0J78AIn7snmdaFgRuYK9bsJoArFC+4dTZoKQZQwGHLtS3r8f+YF5lpXwztFvt+DsAEGMhIwCvJ6ZUCh5TlncF2hZHOYPZUOrSCgIyYABTCeCZCARxHEAA="}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  resized(props) {
    this.$log('resized', props);
  }
}
```

:::tip Tip
See the [`useResize` service](/api/services/useResize.html) for more details.
:::

## `keyed`

Called when the user is typing.

**Arguments**

- `props` (`KeyServiceProps`): The [key service props](/api/services/useKey.html#props).

**Example**

```js twoslash
// @twoslash-cache: {"v":1,"hash":"5b7d47300b5e852df56ac50da413c5f73323a8ecd547aeeaeb32648f984b8383","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiABsg1EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+xRAEYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAAOADsQ0B4ymoLmCw8SyGiNWqJAWx2e2uiAAzMdTtRzoSriTqGSQIwsJocHYMHwoa93v5+DCAGbsEKIXjAcy8Qu8MDMGq50qkREhADcBaLrAgOd4ACNVTBmGBa2AjoLXO5IZnsxLqKFwpFonEqAkknBUhlsrl8oViqUKlUanUGk0Wil02AsyEyhi0FUwP4EpZWMbPr1vti1v7baN7b9HeC7oOQst3UhH170ZifpBviFxEtcpL0EwsZaGQmB8CWZa8BWVZOGad7YhaT5Ag6I5OhCCG4G6SKINM/4+liJF4iGBIeGBEY0JB5LQfGcG8A2Tatvk7ZgKhXxINikzYlhL5/rM74eOx37EQArGi5F+pMVGYDRlzEjcjHRhuhBQEmLwwqmMQwBgMBQDGcazrwHaJrmRAQOwUC8be/E/BsALPsCsm4eJICGcZDlEasmFkRivoHMiSmhrR4bqRCMY7BuZB8MxFlWY55rYj8PzCR5b7OiAyVSYFckhRRFoRSpdExVBcawYmdKSJy5nGP4AAk7G5ow/hdWCFllLEkAAO5gMg7R8Doxi8LZ9m9sKHgAMqWGwrC8PgMCsPGvC5GxjZIeUGYZsOwRSig46IpOBAKrOSoLqqy4amu2qbvq26tIiPRgPwMBZFp0ABBerAAMTsVke4KAwnQ3ulFqkcM7k4WJeVtY2hUDMVgEHMB1GgdFEGxVg8W1IlvDJbmqWQ3e/RBbD2GIJ5CMQgVAWo8F6Mov6RwmumsB4Lytj2MAdK8EcvAZpoli8AA5AAAquWobsw84qkuRQS125h0Hy9iwBmzBlKw9g0iIyb6XCcj0EyyiivmYCFj0J78AIn7snmdaFgRuYS8bsJoBLFCu9tTZoKQZQwH7NtC2r4e+SZZlGHw1tFpt+DsAESMhIwEvR1AvvE+Z3BdoWRzmD2VDy0goCMmAcCnngmQgEcRxAA"}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  keyed(props) {
    this.$log('keyed', props);
  }
}
```

:::tip Tip
See the [`useKey` service](/api/services/useKey.html) for more details.
:::

## `moved`

Called when the user is moving their cursor.

**Arguments**

- `props` (`PointerServiceProps`): The [pointer service props](/api/services/usePointer.html#props).

**Example**

```js twoslash
// @twoslash-cache: {"v":1,"hash":"5e7d262323c006348a5c51c81acf0d8a6f87c208fd122f6d17fea63f772fbdf6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiABsg1EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+xRAEYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAAOADsQ0B4ymoLmCw8SyGiNWqJAWx2e2uiAAzMdTtRzoSriTqGSQIwsJocHYMHwoa93v5+DCAGbsEKIXjAcy8Qu8MDMGq50qkREhADcBaLrAgOd4ACNVTBmGBa2AjoLXO5IZnsxLqKFwpFonEqAkknBUhlsrl8oViqUKlUanUGk0Wil02AsyEyhi0FUwP4EpZWMbPr1vti1v7baN7b9HeC7oOQst3UhH170ZifpBviFxEtcpL0EwsZaGQmB8CWZa8BWVZOGad7YhaT5Ag6I5OhCCG4G6SKINM/4+liJF4iGBIeGBEY0JB5LQfGcG8A2Tatvk7ZgKhXxINikzYlhL5/rM74eOx37EQArGi5F+pMVGYDRlzEjcjHRhuhBQEmLwwqmlhXFAMZxrOvAdomuZEBA7BQLxt78T8GwAs+wKybh4kgIZJB2URqyYWRGK+gcyJKaGtHhupEIxjsG5kHwzFmRZ9nmtiPw/MJblvs6ICJVJ/lyUFFEWmFKl0VFUFxrBiZ0pInKmcY/gACTsbmjD+B1YJmWUsSQAA7mAyDtHwOjGLw1m2b2woeAAypYbCsLw+AwKw8a8LkbGNkh5QZhmw7BFKKDjoik4EAqs5KguqrLhqa7apu+rbq0iI9GA/AwFkWnQAEF6sAAxOxWR7goDCdDeqUWqRwyuThYk5S1jb5QMhWAQcwHUaBkUQdFWCxbU8W8IlubJeDd79AF0PYYg7lwxCeV+cjgWoyi/pHCa6awHgvK2PYwB0rwRy8BmmiWLwADkAACq5ahuzDziqS5FGLXbmHQfL2LAGbMGUrD2DSIjJvpcJyPQTLKKK+ZgIWPQnvwAifuyeZ1oWBG5mLhuwmgYsUM7m1NmgpBlDAPtWwLKuh95MDGYlfCW0W634OwAQIyEjBi5HUDe4TpncF2hZHOYPZULLSCgIyYBwKeeCZCARxHEAA==="}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  moved(props) {
    this.$log('moved', props);
  }
}
```

:::tip Tip
See the [`usePointer` service](/api/services/usePointer.html) for more details.
:::

## `ticked`

Executed on every frame with `requestAnimationFrame`.

**Arguments**

- `props` (`RafServiceProps`): The [raf service props](/api/services/useRaf.html#props).

**Example**

```js twoslash
// @twoslash-cache: {"v":1,"hash":"13ce3e3b716c4364be322c2a293d2d331e3ca0a47a754af0935b36db6130a4f1","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiABsg1EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+xRAEYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAAOADsQ0B4ymoLmCw8SyGiNWqJAWx2e2uiAAzMdTtRzoSriTqGSQIwsJocHYMHwoa93v5+DCAGbsEKIXjAcy8Qu8MDMGq50qkREhADcBaLrAgOd4ACNVTBmGBa2AjoLXO5IZnsxLqKFwpFonEqAkknBUhlsrl8oViqUKlUanUGk0Wil02AsyEyhi0FUwP4EpZWMbPr1vti1v7baN7b9HeC7oOQst3UhH170ZifpBviFxEtcpL0EwsZaGQmB8CWZa8BWVZOGad7YhaT5Ag6I5OhCCG4G6SKINM/4+liJF4iGBIeGBEY0JB5LQfGcG8A2Tatvk7ZgKhXxINikzYlhL5/rM74eOx37EQArGi5F+pMVGYDRlzEjcjHRhuhBQEmLwwqmJ78DEMBQDGcazrwHaJrmRAQOwUC8be/E/BsALPsCPxvs61DsEZJlSasmFkRivoHMiSmhrR4bqRCMY7BuZB8MxFlWY55rYj8NpudhiCybh4kgMlAVIEF3ohRRwHUaB0UQbFzGwYmdKSJy5nGP4AAk7G5ow/i9WCFllLEkAAO5gMg7R8Doxi8LZ9m9sKHgAMqWGwrC8PgMCsPGvC5GxjZIeUGYZsOwRSig46IpOBAKrOSoLqqy4amu2qbvq26tIiPRgPwMBZFp0ABBerAAMTsVke4KAwnQ3ulFp5cM7k4WJ3mdY2xUgsFgEHJVynVWptVQfFtSJbwyW5qlMPfMiayuQjOV5cjEJFURqz/GVWMoopJrprAeC8rY9jAHSvBHLwGaaJYvAAOQAAKrlqG7MPOKpLkUUtduYdB8vYsAZswZSsPYNIiMm+lwnI9BMsoor5mAhY9IZAifuyeZ1oWBG5lLpuwmgUsUG7e1NmgpBlDA/t2yLGsR4ZxmmclfC20WO34OwASoyEjBSzHJl+6T5ncF2hZHOYPZUIrSCgIyYBwKeeCZCARxHEAA=="}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  ticked(props) {
    this.$log('ticked', props);
  }
}
```

:::tip Tip
See the [`useRaf` service](/api/services/useRaf.html) for more details.
:::
