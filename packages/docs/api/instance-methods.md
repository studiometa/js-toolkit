# Instance methods

::: tip See also
For practical examples of instance methods, see the [Components guide](/guide/introduction/managing-components.html) and [Lifecycle guide](/guide/introduction/lifecycle-hooks.html).
:::

## `$log(...content)`

Can be used to log content to the console when the `instance.$options.log` options is set to true, either via the `config` getter or via the `data-options` attribute.

**Parameters**

- `...args` (`any[]`): The content to log

**Example**

```js {6,10} twoslash
// @twoslash-cache: {"v":1,"hash":"34b8b72cb0335c69489ffe98f1d4db7877c033401e3d9e22c4ab40523f1f2372","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiABsg1EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+xRAEYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAAOADsQ0B4ymoLmCw8SyGiNWqJAWx2e2uiAAzMdTtRzoSriTqGSQIwsJocHYMHwoa93v5+DCAGbsEKIXjAcy8Qu8MDMGq50qkREhADcBaLrAgOd4ACNVTBmGBa2AjoLXO5IZnsxLqKFwpFonEqAkknBUhlsrl8oViqUKlUanUGk0Wil02AsyEyhi0FUwP4EpZWMbPr1vti1v7baN7b9HeC7oOQst3UhH170ZifpBviFxEtcpL0EwsZaGQmB8CWZa8BWVZOGad7YhaT5Ag6I5OhCCG4G6SKINM/4+liJF4iGBIeGBEY0JB5LQfGcG8A2Tatvk7ZgKhXxINikzYlhL5/rM74eOx37EQArGi5F+pMVGYDRlzEjcjHRhuhBQEmLwwqmlgQGUcIwFAjDcLmRAQOwUC8be/E/BsALPsCNq4eJICGcZNC2URqyYWRGK+gcyJKaGtHhupEIxnGsGJnSkicnGJj+AAJOxuaMP42VgrOvDGTEkAAO5gMg7R8Doxi8FZNm9sKHgAMqWGwrC8PgMCsPGvC5GxjZIeUGYZsOwRSig46IpOBAKrOSoLqqy4amu2qbvq26tIiPRgPwMBZFp0ABBerAAMTsVke4KAwnQ3uaGFCc52EkW+zogOljZSas/zekFFHHCa6awHgvK2PYwB0rwRy8BmmiWLwADkAACq5ahuzDziqS5FLDXbmHQfL2LAGbMGUrD2DSIjJvpcJyPQTLKKK+ZgIWPQnvwAifuyeZ1oWBG5rDFOwmgsMUFzvVNmgpBlDAwuM+D2My15JlmXwDNFt1+DsAEr0hIwsMKz5sPcF2hZHOYPZUCjSCgIyYBwKeeCZCARxHEAA==="}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    this.$log('mounted');
  }
}
```

## `$warn(...content)`

Can be used to handle a warning to the console when the `instance.$options.log` options is set to true, either via the `config` getter or via the `data-options` attribute.

**Parameters**

- `...args` (`any[]`): The content to warn

**Example**

```js {6,10} twoslash
// @twoslash-cache: {"v":1,"hash":"5174cf63ab7c1548b16266e87922efde4893e328e324dfb77f71d502df67eec8","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiABsg1EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+xRAEYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAAOADsQ0B4ymoLmCw8SyGiNWqJAWx2e2uiAAzMdTtRzoSriTqGSQIwsJocHYMHwoa93v5+DCAGbsEKIXjAcy8Qu8MDMGq50qkREhADcBaLrAgOd4ACNVTBmGBa2AjoLXO5IZnsxLqKFwpFonEqAkknBUhlsrl8oViqUKlUanUGk0Wil02AsyEyhi0FUwP4EpZWMbPr1vti1v7baN7b9HeC7oOQst3UhH170ZifpBviFxEtcpL0EwsZaGQmB8CWZa8BWVZOGad7YhaT5Ag6I5OhCCG4G6SKINM/4+liJF4iGBIeGBEY0JB5LQfGcG8A2Tatvk7ZgKhXxINikzYlhL5/rM74eOx37EQArGi5F+pMVGYDRlzEjcjHRhuhBQEmLwwqmlgQGUcIwFAjDcLmRAQOwUC8be/E/BsALPsCNq4eJICGcZNC2URqyYWRGK+gcyJKaGtHhupEIxnGsGJnSkicnGJj+AAJAA7r0YC5ow/h5WCs68MZMSQOlYDIO0fA6MYvBWTZvbCh4ADKlhsKwvD4DArDxrwuS8K1MTeJlpAWKMchcOwZDDsEUooOOiKTgQCqzkqC6qsuGprtqm76turSIj0YD8DAWRadAAQXqwADEw1gFke4KAwnQ3uaGFCc52GILJ7nOiAGVZVJqz/N6QUUccJrprAeC8rY9jAHSvBHLwGaaJYvAAOQAAKrlqG7MPOKpLkU6NduYdB8vYsAZswZSsPYNIiMm+lwnI9BMsoor5mAhY9Ce/ACJ+7J5nWhYEbm6NM7CaDoxQItsY2uZoKQZQwLL3OI6T6teSZZl8FzRa9fg7ABP9I2MOjADqWVVgAhOj3DVrwaS8MgkvvFk2LtLwVsjbbdZHOYPZUHjSCgIyYBwKeeCZCARxHEAA="}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    this.$warn('Warning!'); // [Component-1] Warning!
  }
}
```

## `$on(event, callback[, options])`

Bind a callback function to an event emitted by the instance. Returns a function to unbind the callback from the event.

**Parameters**

- `event` (`string`): The name of the event.
- `callback` (`EventListenerOrEventListenerObject`): A callback function or an object implementing the [`EventListener` interface](https://developer.mozilla.org/en-US/docs/Web/API/EventListener).
- `options` (`boolean|AddEventListenerOptions`): Options for the `addEventListener` method, defaults to `undefined`.

**Return value**

- `() => void`: A function to unbind the callback from the event.

**Example**

```js {10-15} twoslash
// @twoslash-cache: {"v":1,"hash":"949d31b9995a8f010091bd80642c1c904d47200a93fd1a1556afe815132c9841","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiABsg1EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+xRAEYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAAOADsQ0B4ymoLmCw8SyGiNWqJAWx2e2uiAAzMdTtRzoSriTqGSQIwsJocHYMHwoa93v5+DCAGbsEKIXjAcy8Qu8MDMGq50qkREhADcBaLrAgOd4ACNVTBmGBa2AjoLXO5IZnsxLqKFwpFonEqAkknBUhlsrl8oViqUKlUanUGk0Wil02AsyEyhi0FUwP4EpZWMbPr1vti1v7baN7b9HeC7oOQst3UhH170ZifpBviFxEtcpL0EwsZaGQmB8CWZa8BWVZOGad7YhaT5Ag6I5OhCCG4G6SKINM/4+liJF4iGBIeGBEY0JB5LQfGcG8A2Tatvk7ZgKhXxINikzYlhL5/rM74eOx37EQArGi5F+pMVGYDRlzEjcjHRhuhBQEmLwwqmlgQGUcIwFAjDcLmRAQOwUC8be/E/BsALPsCNq4eJICGcZNC2URqyYWRGK+gcyJKaGtHhupEJ7qUvCkDAhkkAAoiQcIADLsKUIxkLm5nssYvBWTZdnmhhnrDC5/H/GJzogPFiUwCl7wZVlbwRisAxyUFFH3mFKl0VFTBadAfBeJInJxiY/gACQwow+rvOWaCVqMFBsZlCg5bwTXpRt2WkAA8qQO1oC1m2Hc26QwHsa1aCeMJwAA/LmnHDB2vAAD68AAglAUAnWd+0HVg91gDwuV8DoBVFb5zh9osiJQLwzDra1ZC8Bmxl7KevC5MjYByKlxRBKO0qRFgOyWE4C1wkWABypbeBAGa4/g3g08TXTk5T35o6QRYAGJY6DuMQC23j8GwwxQIEXMgBTGJU1Qd2niIwOgyIGa2Kz3gAAb1VcAN7W1uu8MNMsdBQkTxeUpA8VQ30Y8LON48ZzaIzrqPnbLVuypOBAKrOSoLqqy4amu2qbvq26tIiPRgPwMBZObAQXqwADEMJZBzWSS6wrDNrsMRZCrD3XqafGIMiaz/BV2EBm+tWzfbsqrP83rdX6/pWn1oGRRBEIxnGsGJnS40GJNxgzexuX+HPYKzrwxkxJAADuYDIO0kPQ9ZsNCv2ADKlhS7wbOsPGotsY2SHlBmGbDsEUooOOiL+9OirziqS7qquWobrqW5DQpDjsEBOScU7njQJedO7Fc4wgUAwToN5zTIkmH+OuL5SI1QhNNSSfl+JOQ7oBA42JcTBmUn3NSA8Pxg3sAbZKRNAZtQhvlQqu8SrfH9GsH4wlgTYmqmCWq9DGqMONuBVu/FSJEOClMI4Jp0ywDwLyWw9hgB0l4EcDGmhLC8AAOQAAFf7rh1J/Rcao0C6K7OYOgfJ7CwAzMwMorB7A0hEMmfStNGSKGUKKfMBMb7MBPPwAQn52R5jrIWAiuZdHuNhBYigESr5NmWmUGACT/FHCsf4ryJkzJ8D8UWEJtC4oJUNqIvmYTxiZRmnNXRZQsBQECaZXRa08pQ3Cf4wpVSAi4MbIwOpDSmlQF0dwLshSjijPMIktIvAABKpSSCew5l7faiThFGz5uZMZGjzA9ioP/JAoAvFwFPHgTIIAjhHCAA==="}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    const removeEventListener = this.$on('updated', () => {
      this.$log('updated');
    });

    // Remove the event listener
    removeEventListener();
  }
}
```

:::tip Tip
Use the `options.once` parameter to run the callback only once.

```js
this.$on('updated', () => {}, { once: true });
```

:::

## `$off(event, callback[, options])`

Unbind a callback function from an event emitted by the instance. If no callback function is provided, all previously binded callbacks will be removed.

**Parameters**

- `event` (`string`): The name of the event.
- `callback` (`EventListenerOrEventListenerObject`): The callback function or the object implementing the [`EventListener` interface](https://developer.mozilla.org/en-US/docs/Web/API/EventListener) which was bound to the event.
- `options` (`boolean|AddEventListenerOptions`): Options for the `removeEventListener` method, defaults to `undefined`.

**Example**

```js {10-15} twoslash
// @twoslash-cache: {"v":1,"hash":"a85762455a29fa2419a8ab21c151dde50e817c6d58408bf20ea3b19414f7411b","data":"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="}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    const callback = () => this.$log('updated');

    this.$on('updated', callback);

    // Removes the binded callback
    this.$off('updated', callback);
  }
}
```

## `$emit(event[, ...args])`

Emit an event from the current instance, with optional custom arguments. The event will be dispatched on the instance root element, allowing other components or scripts to listen to it.

**Parameters**

- `event` (`string | Event`): The name of the event or an `Event` instance.
- `...args` (`any[]`): The data to send with the event.

**Example**

```js {10-11} twoslash
// @twoslash-cache: {"v":1,"hash":"efac3a5fef63838518ab30e3ed959eb8d0139758bfb85d6817a9c65ccddc9729","data":"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"}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    this.$on('custom-event', (a, b) => this.$log(a + b)); // 3
    this.$emit('custom-event', 1, 2);
  }
}
```

## `$query(query)`

Get all descendant component instances matching the given query. This is sugar for `queryComponentAll(query, { from: this.$el })`.

**Parameters**

- `query` (`string`): a query string in the format `ComponentName(.cssSelector):state` (see [queryComponent](./helpers/queryComponent.html))

**Return value**

- `Base[]`: an array of all matching descendant instances

**Example**

```js {12-14} twoslash
// @twoslash-cache: {"v":1,"hash":"04e180686338152ec3ca81fa66052be6d6d5302f46d4e6023ac8223a80d77b46","data":"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"}
import { Base } from '@studiometa/js-toolkit';
import SliderItem from './SliderItem.js';

class Slider extends Base {
  static config = {
    name: 'Slider',
    components: {
      SliderItem,
    },
  };

  mounted() {
    for (const item of this.$query('SliderItem')) {
      this.$log(item.$id);
    }
  }
}
```

## `$closest(query)`

Get the closest ancestor component instance matching the given query. This is sugar for `closestComponent(query, { from: this.$el })`.

**Parameters**

- `query` (`string`): a query string in the format `ComponentName(.cssSelector):state` (see [closestComponent](./helpers/closestComponent.html))

**Return value**

- `Base | undefined`: the closest matching ancestor instance, or `undefined` if none found

**Example**

```js {9-11} twoslash
// @twoslash-cache: {"v":1,"hash":"ec4d1f572bff20bff0c3675be81f78a5c1cf444acc5feef8826dca64c82ec79f","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAyhywpACSNJZOPX2IAKzTKIjMYTRAARg21F68wYHme7FeHxgXyG7DAqwATJttqRdvskAA2E5nHB4QgkcgzW4eFgcLh8e5+BxSWTyEZKZmGbS8PReLkmcxWGx2ZlOFxuRYSHzCQIzULhSLROJUBJJOCpDLZXL5QrFUoVKo1OoNJotNqdbqzWEAdgAzENgeMpnK5gsPEtUeikFiQFsdntrogMX9idRzmSrpTqNSQIwsJocHYMHx4YjPv5+BAwAAzdghRC8YDmXgl3hgZg1AulUhokIAbnMRzFrncIAAwlncyFZVCwkgIlE0cqCIlkmlMjk8gUiiVypVqrVmPUYI1mq1Mzm82VcWgqmB/AlLKwOl0QD9YQAOQZA0ZOxAEl0wu6dvPLNGre2+nF4wPHU5h0kPHJa4qXoJh4y0MhMD4ctK14ata2+K0kAhQFhlvUFAVmJ8PFg3BPVWQE/VxAMDkmUNMEAy4KRuMCaSNQgoBTF4yCRSx/EsCAyjAGgoEYbgCyICAESQ3pYTBW0fXQkEkGtR83RATjuN4t8vUQOSv39fEgwo8MgMjWjYV9LNSngljSALLxJD5BMTF4AAfXhuNgXN0SgUTfjBAEHQwwl5KMuBzNU1YL2xLTAwhXSqOAqMaDo2MGOgPgrJsoxjH8AASQQIFUUprIkfLVH5YxjEYABHMoyAwKs0BrUYBOZQr1Fs4wHKcxQYFcmB3KocVWwAcVqXhxm8bLcvsZgwH4eBclIARqhsdEeN4NEeim7xLGYNAtlrYb8G8EJ2BIMBeAqqr/HMR4yhCXpeGzWxeAAAzGmaO2sLMRjQcrKtIDAKELO7NEsAtxnYAIMpgVheCObhHp7YI+xQRUh3iUd1XHLUp11WcDQXY0V1NVpVuCdaskSpQDzQI8AGIXtKLIzt+k9LTElCCVCm8ZMQDnsIUrLWBymbgqQDniJ/A4MXI/9KIuGLDOfMBTMChEyEsgrUu0VrHOczr3x6s9kPBfoH05u8Td5gKgoIgYwpI7SLyi2WDNAoy4wTKDk0ajWTEygX814Rh/CD6F1XamJIAAdzAZB2j4HRWqEkTepbPBHk21gof21hE2GiBeD9+DymzbN4flftkdiVG1Q1CdtWnPU50NRdl1XM1icm6aydqRiAkPVhqb9rINwUBgLQN1mgzBDTpLvLDoT5v3hfBSExdIlCwUdiMaJdhWlfMtXVCa4qPNhSXIRn0Fzfny2VajFYUJX7818QW0pZJJ3t+jeK3cgpNkoK1k9B2TKAMLZHknIWqZQRDVOqIRmwSg8NIfaK1FYk2mitKApdEYDiVFXMcmpJw6hnPqecRolwmjXCkdupMIKJl3PASmNMRJj3PN6SY09HSgk/BbPAGUk6DjUhCW24spgb1PJmWAeAhS2HsMAZk0NAbVF4AAcgAAIkKbsEAhdddTKIbGAcwjIRCplYp8OQQDFAgNUIWYshctrsH4PNTcIRwFFhOqWPCBZlEmPeJ8ZRFBbFHH0bYpSPFur8Rse4ksG49633AaDcGdMvrePMso7g+jSwrWzAHZWrw+BuMySWBJvsIAhEYMot4isVZmVvogfxNTXhQKYhk0sRxAmNicGQpAoA2RVKzHgTIIAjhHCAA=="}
import { Base } from '@studiometa/js-toolkit';

class SliderItem extends Base {
  static config = {
    name: 'SliderItem',
  };

  mounted() {
    const slider = this.$closest('Slider');
    if (slider) {
      this.$log('Inside slider:', slider.$id);
    }
  }
}
```

## `$mount()`

Mount the component and its children, will trigger the `mounted` lifecycle method.

**Return value**

- `Promise<this>`: returns the current instance when all children components are mounted

## `$update()`

Update the children list from the DOM, mount any unmounted component an re-bind [event hooks](./methods-hooks-events.md#onreforchildnameevent).

**Return value**

- `Promise<this>`: returns the current instance when all children components are updated

::: tip
Already registered or mounted component will be re-mounted automatically on new injected elements. For now, the `$update()` method should still be used to re-bind [event hooks](./methods-hooks-events.md#onreforchildnameevent).
:::

## `$destroy()`

Destroy the component and its children, will trigger the `destroyed` lifecycle method.

**Return value**

- `Promise<this>`: returns the current instance when all children components are destroyed

## `$terminate()`

Terminate the component, its instance is made available to garbage collection.

**Return value**

- `Promise<void>`: returns a promise resolving when all children components are terminated

:::warning
A terminated component can not be re-mounted, use with precaution.
:::
