---
outline: deep
---

# withBreakpointManager

Use this decorator to create a component that will have the capacity to switch components between different breakpoints.

## Usage

```js {5-8} twoslash
// @twoslash-cache: {"v":1,"hash":"002adc63152512737ba35a6b627138bfe344172fc5131b0beb7a465299b0c9fc","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8kxsnDy8AGZlYHtVYLwA7kX4oqQwZgxGzsMBoACyzDAoTIkgAynJ6CMlA4YMZGF4AMK+OCIXiYHAQJ6oii8ABGAKBILBuN4AEFSKRmBhJMhSqRQSFSViIGB2WU9rZJF5jO1jNw8V4ACIwfi2Zi5UjCiQASTBZCeuxgpLhZgs1ls9h+43+gOBEFBEKhMPIVBcbkWlPNlsh0PmpB8wkCM1C4Ui0TiVASSVxaUyOTyBSKJXKlWqtWY9RgjWarVgcqZirgKWNfyd1KtbrI/gSllYHS6IB6fUQAEYAKxDEZjCaIABMtZ9cwWHlzpqpFrBrpty1Bqw2IC2Oz21zr9ZOZxweEIJFt1FuHisNjsvHBIzK4IgZPYwyc1YYiAA7Jem6NxkhaxPZvMLyA92AD0eT7ghmOH5ttiZGcDkvBdqHOZcrjXGh6DwLdDV3fcZTgGJciwM9ZgvWtawANlvFsH07ahehfPB3zKZDUK0UcwFWNsAOnfYkFA05wKXDwV2uGYN0nHFEI/DDeiwy96KiZt70QaZiO7V9yJo1YpKnICmPbWswIJC5OOgniWA4Lg+D7fNB0LG1lVUMz1E0bRjHRLEcTxDSiRJckjMtWkGSZFk2TQDlRm5CRMV5flBSVEUxQlVEZQzBUhS8NV9k1fhtVRCzDGsvV4J3QyzQLYd3Sce13E8Vyh2td1PT8b1iLCJAIiiUFAwIRJkjDbJcnyQpilKCoqhqOoGiaFoUnTeUsxzX5+2dUqi1IEs0DLCtukwh8AA5GzEu9Ww7LtSN7CaSpM/Lf1oqYGOU2cAGZJnUiCOKgm5YI8XSHj4QRhBS2R5GRZQDCs3RUTSkxzEy+wljtVwiq8CqAiCX1av9Br4ma0MMjayNOpjHr4365NBtaRaq2W9s1hvDaCMknae08CR5NOydAN2FT6xwm72MuVcHtfEH+M/Y9TyWoSkDbC6J2GTaHyfEiqfIw8+Z/eqTsQdalMZ2cG1ZzT7u4x6QG58jKLQwSazbHDRfE1tsMp2SkPgKj0OO1Y8Ppxi1ZYxdNY57XX0YLArLITA+HI/w5TAJ52BCPFgHMXgY94aEajxdlOQAbnMI4jYvNsVpW/CJKd58qZDsOQlpxAc+d86DmOViNMgz31x1n2/bsDA+HjmBE58zkM6QEWLtz1spIL1929LwYK9Vg5rsrOVYDgg0d2AZzsoHF0yrIXgjmeTRLF4AByAABbq4z65hUYjDqij31P9W3ewZa/YZt+qff/BSB+5ev4GF/vm2ULQ5+u895v31rbNCX8wDmDoHfXgsBNRlFYPYN6fgeaIgUCiFeU1DpkAxBIUkyBo68GQHvWgtARBkN4HAPepIP7fi6IQ4hu9WC8FoMw0hrBqE8wNloehYB2h8Cjp8ShwQ0DsH4AIXkxdeB6EEbHOOzAE773ItQwhRwb7pyoKfJAoAvp8g+HgTIIAjhHCAA="}
import { Base, withBreakpointManager } from '@studiometa/js-toolkit';
import MenuMobile from './MenuMobile';
import MenuDesktop from './MenuDesktop';

export default class Menu extends withBreakpointManager(Base, [
  ['xxs xs s', MenuMobile],
  ['m l xl xxl', MenuDesktop],
]) {
  static config = {
    name: 'Menu',
  };
}
```

### Parameters

- `Base` (`BaseConstructor`): The `Base` class or a class extending it.
- `options` (`Array<[string, BaseConstructor]>`): Definition for the components to be used for each breakpoints

### Return value

- `BaseConstructor`: A child class of the given class which will mount the given components based on the current active breakpoint

## Examples

### Switch between component classes

In the following example, the `MenuMobile` class will be mounted along the `Menu` class on small devices and destroyed on large devices. The `MenuDesktop` class will be mounted on large devices and destroyed on small ones.

The root element `this.$el` of each class will be the same.

```js {5-8} twoslash
// @twoslash-cache: {"v":1,"hash":"002adc63152512737ba35a6b627138bfe344172fc5131b0beb7a465299b0c9fc","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8kxsnDy8AGZlYHtVYLwA7kX4oqQwZgxGzsMBoACyzDAoTIkgAynJ6CMlA4YMZGF4AMK+OCIXiYHAQJ6oii8ABGAKBILBuN4AEFSKRmBhJMhSqRQSFSViIGB2WU9rZJF5jO1jNw8V4ACIwfi2Zi5UjCiQASTBZCeuxgpLhZgs1ls9h+43+gOBEFBEKhMPIVBcbkWlPNlsh0PmpB8wkCM1C4Ui0TiVASSVxaUyOTyBSKJXKlWqtWY9RgjWarVgcqZirgKWNfyd1KtbrI/gSllYHS6IB6fUQAEYAKxDEZjCaIABMtZ9cwWHlzpqpFrBrpty1Bqw2IC2Oz21zr9ZOZxweEIJFt1FuHisNjsvHBIzK4IgZPYwyc1YYiAA7Jem6NxkhaxPZvMLyA92AD0eT7ghmOH5ttiZGcDkvBdqHOZcrjXGh6DwLdDV3fcZTgGJciwM9ZgvWtawANlvFsH07ahehfPB3zKZDUK0UcwFWNsAOnfYkFA05wKXDwV2uGYN0nHFEI/DDeiwy96KiZt70QaZiO7V9yJo1YpKnICmPbWswIJC5OOgniWA4Lg+D7fNB0LG1lVUMz1E0bRjHRLEcTxDSiRJckjMtWkGSZFk2TQDlRm5CRMV5flBSVEUxQlVEZQzBUhS8NV9k1fhtVRCzDGsvV4J3QyzQLYd3Sce13E8Vyh2td1PT8b1iLCJAIiiUFAwIRJkjDbJcnyQpilKCoqhqOoGiaFoUnTeUsxzX5+2dUqi1IEs0DLCtukwh8AA5GzEu9Ww7LtSN7CaSpM/Lf1oqYGOU2cAGZJnUiCOKgm5YI8XSHj4QRhBS2R5GRZQDCs3RUTSkxzEy+wljtVwiq8CqAiCX1av9Br4ma0MMjayNOpjHr4365NBtaRaq2W9s1hvDaCMknae08CR5NOydAN2FT6xwm72MuVcHtfEH+M/Y9TyWoSkDbC6J2GTaHyfEiqfIw8+Z/eqTsQdalMZ2cG1ZzT7u4x6QG58jKLQwSazbHDRfE1tsMp2SkPgKj0OO1Y8Ppxi1ZYxdNY57XX0YLArLITA+HI/w5TAJ52BCPFgHMXgY94aEajxdlOQAbnMI4jYvNsVpW/CJKd58qZDsOQlpxAc+d86DmOViNMgz31x1n2/bsDA+HjmBE58zkM6QEWLtz1spIL1929LwYK9Vg5rsrOVYDgg0d2AZzsoHF0yrIXgjmeTRLF4AByAABbq4z65hUYjDqij31P9W3ewZa/YZt+qff/BSB+5ev4GF/vm2ULQ5+u895v31rbNCX8wDmDoHfXgsBNRlFYPYN6fgeaIgUCiFeU1DpkAxBIUkyBo68GQHvWgtARBkN4HAPepIP7fi6IQ4hu9WC8FoMw0hrBqE8wNloehYB2h8Cjp8ShwQ0DsH4AIXkxdeB6EEbHOOzAE773ItQwhRwb7pyoKfJAoAvp8g+HgTIIAjhHCAA="}
import { Base, withBreakpointManager } from '@studiometa/js-toolkit';
import MenuMobile from './MenuMobile';
import MenuDesktop from './MenuDesktop';

export default class Menu extends withBreakpointManager(Base, [
  ['xxs xs s', MenuMobile],
  ['m l xl xxl', MenuDesktop],
]) {
  static config = {
    name: 'Menu',
  };
}
```

:::tip
See the [`resize` service documentation on breakpoints](/api/services/useResize.html#breakpoint) for a more comprehensive view of the potential values of the `activeBreakpoint` property.
:::
