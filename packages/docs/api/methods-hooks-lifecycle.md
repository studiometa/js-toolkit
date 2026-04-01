# Lifecycle hooks

::: tip See also
For an introduction to lifecycle hooks with examples, see the [Lifecycle guide](/guide/introduction/lifecycle-hooks.html).
:::

## `mounted`

Called after the instance has been mounted.

**Arguments**

> This method has no argument.

**Example**

```js {9-12} twoslash
// @twoslash-cache: {"v":1,"hash":"52622767dc2f0af3e444f0e5dcbce93f47b83b3eb22716a2762bd39a24056b64","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiABsg1EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+xRAEYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAAOADsQ0B4ymoLmCw8SyGiNWqJAWx2e2uiAAzMdTtRzoSriTqGSQIwsJocHYMHwoa93v5+DCAGbsEKIXjAcy8Qu8MDMGq50qkREhADcBaLrAgOd4ACNVTBmGBa2AjoLXO5IZnsxLqKFwpFonEqAkknBUhlsrl8oViqUKlUanUGk0Wil02AsyEyhi0FUwP4EpZWMbPr1vti1v7baN7b9HeC7oOQst3UhH170ZifpBviFxEtcpL0EwsZaGQmB8CWZa8BWVZOGad7YhaT5Ag6I5OhCCG4G6SKINM/4+liJF4iGBIeGBEY0JB5LQfGcG8A2Tatvk7ZgKhXxINikzYlhL5/rM74eOx37EQArGi5F+pMVGYDRlzEjcjHRhuhBQEmLwwqmlgQGUcIwFAjDcLmRAQOwUC8be/E/BsALPsCNq4eJICGcZNC2URqyYWRGK+gcyJKaGtHhupEIxnGsGJnSkicnGJj+AAJOxuaMP42VgrOvDGTEkAAO5gMg7R8Doxi8FZNm9sKHgAMqWGwrC8PgMCsPGvC5GxjZIeUGYZsOwRSig46IpOBAKrOSoLqqy4amu2qbvq26tIiPRgPwMBZFp0ABBerAAMTsVke4KAwnQ3uayL+n+wwuThYnOiA6WNlJqz3nJQUUccJrprAeC8rY9jAHSvBHLwGaaJYvAAOQAAKrlqG7MPOKpLkUcNduYdB8vYsAZswZSsPYNIiMm+lwnI9BMsoor5mAhY9Ce/ACJ+7J5nWhYEbmcOU7CaBwxQ3O9U2aCkGUMAi0zEM47LXkmWZfCM0WvBpLwAAyjYiHDis+XDvBFe1TPjN46bQoLvDsCI+umaL4w22l7GMHrRlK3D3BdoWRzmD2VCo0goCMmAcCnngmQgEcRxAA=="}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    // Logs 'mounted' when the component is mounted
    this.$log('mounted');
  }
}
```

## `updated`

Called after the instance has been updated.

**Arguments**

> This method has no argument.

**Example**

```js {9-12} twoslash
// @twoslash-cache: {"v":1,"hash":"89c6977701802f27dd3fa1502204457330291eca7d5dc2c0f99f8a3f72688652","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiABsg1EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+xRAEYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAAOADsQ0B4ymoLmCw8SyGiNWqJAWx2e2uiAAzMdTtRzoSriTqGSQIwsJocHYMHwoa93v5+DCAGbsEKIXjAcy8Qu8MDMGq50qkREhADcBaLrAgOd4ACNVTBmGBa2AjoLXO5IZnsxLqKFwpFonEqAkknBUhlsrl8oViqUKlUanUGk0Wil02AsyEyhi0FUwP4EpZWMbPr1vti1v7baN7b9HeC7oOQst3UhH170ZifpBviFxEtcpL0EwsZaGQmB8CWZa8BWVZOGad7YhaT5Ag6I5OhCCG4G6SKINM/4+liJF4iGBIeGBEY0JB5LQfGcG8A2Tatvk7ZgKhXxINikzYlhL5/rM74eOx37EQArGi5F+pMVGYDRlzEjcjHRhuhBQEmLwwqmZRYFAzA0FAjDcLmRAQOwUC8be/E/BsALPsCNq4eJICGcZplSasmFkRivoHMiSmhrR4bqRCMZxrBiZ0pInJxiY/gACTsbmjD+FlYKzrwZSxJAADuYDIO0fA6MYvBWTZvbCh4ADKlhsKwvD4DArDxrwuRsY2SHlBmGbDsEUooOOiKTgQCqzkqC6qsuGprtqm76turSIj0YD8DAWRadAAQXqwADE7FZHuCgMJ0N7msi/p/sMLk4WJzogGlja+fxTneoFFHHCa6awHgvK2PYwB0rwRy8BmmiWLwADkAACq5ahuzDziqS5FLDXbmHQfL2LAGbMGUrD2DSIjJvpcJyPQTLKKK+ZgIWPQnvwAifuyeZ1oWBG5rDFOwmgsMUFzPVNmgpBlDAwuM+D2My15JkwGZfAM0WvBpLwAAyjYiLDCumbDvCFW1jPjN46bQgLvDsCI+tKyL4w26l7GMHrRmK1AsPcF2hZHOYPZUCjSCgIyYBwKeeCZCARxHEAA"}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  updated() {
    // Logs 'updated' when the component is updated
    this.$log('updated');
  }
}
```

## `destroyed`

Called when the component is being destroyed.

**Arguments**

> This method has no argument.

**Example**

```js {9-12} twoslash
// @twoslash-cache: {"v":1,"hash":"0e4706e63a61107f8b4e55690d52cb41b3a66341cfd6dc2e064d21aee77b026a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiABsg1EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+xRAEYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAAOADsQ0B4ymoLmCw8SyGiNWqJAWx2e2uiAAzMdTtRzoSriTqGSQIwsJocHYMHwoa93v5+DCAGbsEKIXjAcy8Qu8MDMGq50qkREhADcBaLrAgOd4ACNVTBmGBa2AjoLXO5IZnsxLqKFwpFonEqAkknBUhlsrl8oViqUKlUanUGk0Wil02AsyEyhi0FUwP4EpZWMbPr1vti1v7baN7b9HeC7oOQst3UhH170ZifpBviFxEtcpL0EwsZaGQmB8CWZa8BWVZOGad7YhaT5Ag6I5OhCCG4G6SKINM/4+liJF4iGBIeGBEY0JB5LQfGcG8A2Tatvk7ZgKhXxINikzYlhL5/rM74eOx37EQArGi5F+pMVGYDRlzEjcjHRhuhBQEmLwwqmsAVhAGAwFAjDcLmRAQOwUC8be/E/BsALPsC/xic6zjwGgmgmbZRGrJhZEYr6BzIkpoa0eG6kQjGcawYmdKSJycYmP4AAk7G5ow/g5WCs68GUsSQAA7mAyDtHwOjGLwVk2b2woeAAypYbCsLw+AwKw8a8LkbGNkh5QZhmw7BFKKDjoik4EAqs5KguqrLhqa7apu+rbq0iI9GA/AwFkWnQAEF6sAAxOxWR7goDCdDe5rIoGwnAqR7kQhljZSas95ycFFHHCa6awHgvK2PYwB0rwRy8BmmiWLwADkAACq5ahuzDziqS5FLDXbmHQfL2LAGbMGUrD2DSIjJvpcJyPQTLKKK+ZgIWPQnvwAifuyeZ1oWBG5rDFOwmgsMUFzfVNt5ZQwMLjPg9j0uGd5xmmeZnPS4WaS8AAMo2Iiw/LPmmbDvDFR1jPjN46bQgLvDsCIeuK1AIvjDb6XsYwutefrUCw9wXaFkc5g9lQKNIKAjJgHAp54JkIBHEcQA==="}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  destroyed() {
    // Logs 'destroyed' when the component is destroyed
    this.$log('destroyed');
  }
}
```

## `terminated`

Called when the component is being terminated.

**Arguments**

> This method has no argument.

**Example**

```js {9-12} twoslash
// @twoslash-cache: {"v":1,"hash":"eda4cdbf8c5ffe482c1e132845a3c2a25213ba76e65cd460a813134127282a1c","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiABsg1EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+xRAEYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAAOADsQ0B4ymoLmCw8SyGiNWqJAWx2e2uiAAzMdTtRzoSriTqGSQIwsJocHYMHwoa93v5+DCAGbsEKIXjAcy8Qu8MDMGq50qkREhADcBaLrAgOd4ACNVTBmGBa2AjoLXO5IZnsxLqKFwpFonEqAkknBUhlsrl8oViqUKlUanUGk0Wil02AsyEyhi0FUwP4EpZWMbPr1vti1v7baN7b9HeC7oOQst3UhH170ZifpBviFxEtcpL0EwsZaGQmB8CWZa8BWVZOGad7YhaT5Ag6I5OhCCG4G6SKINM/4+liJF4iGBIeGBEY0JB5LQfGcG8A2Tatvk7ZgKhXxINikzYlhL5/rM74eOx37EQArGi5F+pMVGYDRlzEjcjHRhuhBQEmLwwqm+yWIizA0FAjDcLmRAQOwUC8be/E/BsALPsC95vs6kakEZJamVJqyYWRGK+gcyJKaGtHhupEIxnGsGJnSkicnGJj+AAJOxuaMP42VgrOvBlLEkAAO5gMg7R8Doxi8FZNm9sKHgAMqWGwrC8PgMCsPGvC5GxjZIeUGYZsOwRSig46IpOBAKrOSoLqqy4amu2qbvq26tIiPRgPwMBZFp0ABBerAAMTsVke4KAwnQ3uayKTJ6wwuThYkeeljZ+fxTnekFFHHCa6awHgvK2PYwB0rwRy8BmmiWLwADkAACq5ahuzDziqS5FLDXbmHQfL2LAGbMGUrD2DSIjJvpcJyPQTLKKK+ZgIWPQnvwAifuyeZ1oWBG5rDFOwmgsMUFzvVNmgpBlDAwuM+D2My4ZxmmeZnMy4WaS8AAMo2IiwwrPkwFAsO8EV7WM+M3jptCAu8OwIh6yZBsi+MttpexjC62Q3kO4b3BdoWRzmD2VAo0goCMmAcCnngmQgEcRxAA="}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  terminated() {
    // Logs 'terminated' when the component is terminated
    this.$log('terminated');
  }
}
```
