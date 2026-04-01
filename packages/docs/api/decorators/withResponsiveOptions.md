---
outline: deep
---

# withResponsiveOptions

Use this decorator to enable responsive options definition in your HTML.

:::warning

- Responsive options are readonly
- This decorator is not compatible with the [`withFreezedOptions` decorator](/api/decorators/withFreezedOptions.html)
- This decorator does not make options reactive (as in Vue.js or React), the different values are only resolved when the option is accessed
- Breakpoints' names are retrieved from the [`useResize` service](/api/services/useResize.html#breakpoint)

:::

## Usage

```js {1,3,7-10} twoslash
// @twoslash-cache: {"v":1,"hash":"5aeadca9b3692bf315d20b7f9074273cbea3812b862c2e152a8e1a42a955ef63","data":"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"}
import { Base, withResponsiveOptions } from '@studiometa/js-toolkit';

export default class Component extends withResponsiveOptions(Base) {
  static config = {
    name: 'Component',
    options: {
      label: {
        type: String,
        responsive: true,
      },
    },
  };
}
```

```html {3-4}
<div
  data-component="Component"
  data-option-label:xxs="Small Mobile"
  data-option-label:xs:s="Large Mobile And Tablet"
  data-option-label="Other devices">
  ...
</div>
```

### Parameters

- `BaseClass` (`Base`): The class to add extra configuration to.

### Return value

- `Base`: A child class of the given class with the merge configuration

## API

### Configuration

#### `config.options.<name>.responsive`

This decorator adds support for a new boolean `responsive` property when declaring options in a class configuration. It **must** be set to `true` to enable the responsive evaluation of the option value.

### HTML

This decorator adds support for one or more suffix to define breakpoints in which the option should be read from when declaring options via `data-option-<name>` attributes. The format is:

```html
<div data-option-label[:<breakpoint>...]></div>
```

## Examples

### Define option only for a given breakpoint

Given three breakpoints `s`, `m` and `l`, the following component and its markup:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"8bc2ba70fafe0316ce8705cfbe62de19671dca19ac832aa6077af1168736befb","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8kxsnDy8AGZlYHtVYLwA7kX4AErwGxgODsEgAeSwaA+cEkAGU5PQRkoHDBjIwvABhXxwRC8TA4CBPFEUXjAXikQEQYGgmAQqFUkRHAD8uOA5l4HPJlOp4Mh0JZvDAMBIpGQ7V4AB9eK9YE92EKoABucxHbi4rwAERg/FszFypEkXgAkmB9k9djASbCzBZrLZ7D9xgC4ECQbz6cCnC43HgAKKIxQicbeHVgOUhMqkPUfXiE3jMT50dileUhHzCQIzULhSLROJUBJJHFpTI5PIFIolcqVaq1Zj1YVNFopWA6qP6uApR3/blu2l8hn+BKWVgdLogHp9RAARgArEMRmMJogAEzTrNzBYebvO100unQ5by1YbEBbHZ7a4z2cnM44PCEEU3eh4QTCXgY6pAkYMbqzBiHCuC6jOMAwbvMAEgJ+dpCqaR5CkgQFntsUaXgca63tQ5wPlc5AzLcHgsBwXB8Duvb7gOwKGhI1GqIY2jGGimLYri+IwHGXgkmSFIugyFEeoyApsp8nI8Xu7r8riQoimKkrSooMBygqypgKq6oSFqbZ6rYtEwCaZoWiSXi6fRJg2lYNh2N8vy7nxEkMl6rjuCA/oKMiwYCFS4aRtGVKxkSCYIsmUKjOmfiZtQ2ZIBEUTyvmBCJMkJbZLk+SFMUpQVFUNR1A0TatK2uodl2NnkfZwJDmgI5jn+vQAdO06nsMIHLmu4FbiAZG8Ty/YCfBqxIeeqH7EgADMxynFh94eI+1z4S+hH3CRYXKDRsjyEiq10Zo2i8HoXimeZdpWUsVDes5XgrRFwRhNFuZxfEiXFhkKXlulVZZbWuWNs0rQ1RO/5INOo1Ic1S5TO1kGnbFCGrpsKG7CNiAAGzTphbE4U+82QYwWA7WQmB8NB36mv4obhqy7KcmAzA1LipSkKmKmcrGlE4qSVMsxyQgAEYwKwlMiVzXNsbisJoIzoyfsCEtlHstjM8LXNiXZMC4jz5YwAmivC0cOu8HrKpOJO9WTIMUSLqBKOQ6+XnsCE/VjfDF5IxNd4XLNeHUARIC4/jdgYHwNN07wDOpsbgMzsj0wWy1EORZukHB7gQzHvHQ2I1ekzo9hM24c+ON41oBOB6zAmCyzvP8xXSui7w4uSyE0sM3L+r6yzKs9ermva5zBsqUcEd1UDAAcADswHg4gE8JxBeBaH1qew/OyEu1nOfTZcWPewtvtFzgAd8FXAsc0LeLnGLEups3svy6Q+ud323f5FrYAD0PU4rmsMdg1bK+zHPDwx9HbW1XsNK8yMN4e3ztjJg+8S58Drg3a+DJb76g/gBFcbVY5TxjgAjqGMl6rBnhnNCSAR5QMxnNHekEiC9HrlfUYl9G431IK3WwjkfQeAAIKsFYBAL4IhLAJnYFgMoQgPTxkUM8WwwjEipn8nieQodGFhCkVAXgsB9iWHlL5T4CYNH8P4HoxRcAyg8zDqMEQ3Z5QqMbgEDBiEVwz1/suZGNsPDINGCAkhCMyEzmzpNDGedt40F3n7Yuh8uTdSfrwDWL8EyONXJMUak8raNQ8SAR+NIQEj2duAg4FCgm5y3tQsJOMcqECgETL8VIfz+B4uwAAXjAKAETkhSMDriIgEB2BQE4c5Z0zTvCqFIEQdg/BLQIm1GUGgGivj4BGHiRZ1lFACN4MmaJwyoDXSiige6sRHpFlSC9MsaVKyZRrDleseVfopEqdAbIhAIAxGyKM8ZkyAjDlYAAYkaS0/pnRaqfxHivVxSAZ74Mgv81pIDgb5MzuhShISyk+1xjsHKZA+D73ZgmDASSVz9FSTgv+mScVwuJaQpGjVkWlK9uUvAycXQWk8sCF+5g6GkFZXAF+uJm4vwGXgaQKyAAGoYeXDBFbwSw0BxHeCLuM2AIhmChwssMTRMAeZlBCCEBR4qX7LL1BskQIIdFCC5bkZZMBzAAClmB0NhPwRmkJuUGpqOeCwcBLC8AVX01pcSMDfE1XEzQgiyABHMOYYV3gZVQDlQiSyaAgxfAgKHHA/B2Byn4J5GCP4cSRrAAAKl4Nw3gIr+WSpWtZcY0rahVJNXLfA8YRBioZC/fw/CQiMG4CKkkra2XDH8GQTQpBu1SoMWW/Vg6vi9DAGOw19hjGfD5tKVQGjLVfEZjQPEqa8W8AAHLQBgP4TIditaWH8OYYtpaQj8J5mwSdbbK3yh6G8EMdsIwUnXamzdRRvCWuQCKounyAilBcLMkV7RGCFiSikSAsBMj+FsCEFsTkUgSPgGgLIRAsH+FoPlFIwH4BfKqr8ojfgwMQFmXwAx5hAPkdA2gWApBSCQeg09E58GYCIeQ6htw6G9SYew7h/DdyGOVRHD8hjYHh3cH8LwaNvBb0QHvawR9A6YBSqXXE7wZQ13VsILMjZx0Qppg8iKrjiAp2aelbKwdBaAD6hbC0AHVZ2pmcw53EinlOqddeqlT6RtRoAAORCLrY8+MFJBQwF+GQblwUfysAwOYOAGA3j4E0JAPTvAOAxH/SsnmobRklrUEaIMizA08RgJYHmwwSSQC5b0ArMBA3isS6aZL5guDpa2FlqjIg8veDYGpiAwYuWHtgCek1Etz0BHrjAFrvBAOQG3X5BjvAjQpDBGxmDz0uM8bmHxzsGHSjCZXHhgj4nvk/OYFkVbMAshUiyAxrIVQ+BPFsOYGV0X5SfdIHIj4l6wDmH9LTLA6q9MKI8r5h9/aJWacQAWkVKPMjmGsx2iAXaQuLL4T+2wrAoAhe4CpNIvANDyiTbiXH/DvgE6gCSS1lHZno6fceztjAcf81pwAUjgCFkkIWU2kEJ8T0nKRyeSyp7wGn+ORcM53So8DaBWcaaHSx2wjAhRfF4L6DXo6QsueedoEkPLKkKPvRo7YWAcAKmJyT8wZOKemhEMO2wta/ChGG9Ino/AYh4lQv+1NMmWNI7AGTjkeuR24iN3kE3ocvr4At8wK3zRbetMdxLlmRrkDCjYO0RAs5ryZ65kax1zrihsLACaYVyZpblN4Fro9iAiCWBnCDGcI9uAl+z/YMEPMgt7Aaa8GvSe4D1+UU32ALe2+jTWP0RAo0u8985EayzlOyA01YIRzQIGUh0BmR6aeY8Zz9BXxyHPefWDtCyJutPZAUarhXOf+M9gr/l9EfYKfasN+kC3zv1wYjffWgQ/D4aeZGFGNYbvcPLPVfewdfU0TfNge5ZgeUffOhVgBzSxEIVcUaRfAtcVeA2mbwPQQ3dgPhXgP4FTF9KkELFSDHGdP/RgEVDUBMeYLlAAEmAGTiOAAEJeBWDRgyBeCRUHcYDJdKd2ZBD2DeAXNyC1MqCeYaCwB+DpDhDGdg8mNh1zAUcRUC0wdrBIcQRQpzMK0bM3w/Aw8dDUc4BVdShYwjM9AIIG5z1YRaxCAvhu16DUE5AWM9olNagXDaY3CagPCvC7D7BLAMAzD/Dtd/Nj0zDGAqM0ASRZMVJvtoi2dMdsdZc6d5cxcS9ndpdcjhdCcNCHCVcwAoizDsjOdci+cBdeAhd6cCjxCij2YSj6dyjkiMiai3dR04io9NdDdjc4BTdE9k9U8bcRhWl7dxcJCXdcRkAhjSAY9RjxjzdQpLcZd78FQuhFdtCQc3gfDk5/CyCKDFDlC6DeisjGC50WC2D4suCeDVDHjSARCxCncpcpC3jZD5DKDqC2UVCBC3jeDyjDjdCgg9kYpVAU4QBkAeVIxJkoM9sTldVxhzEyZqg4Mj1MgcTYAUg6sVMUgcMLt8MOAeYUgMdMhuB/oTYxo1h3ESVlxIVehAEzw2c4UY4qV15ilN5PYC4mAHlqkPwsiOcahPd5gBQ8USR/A5SF4Pg2A1AMVcUwAMAxQ1ReAek+lG8ABqacWMEUfhFPWks6JyPAdoxXEVZnNAKVbsGLL4FYeTAAWXEShAh2GzmDKBqBdwEEChXSwGEFaRJHtODHMDlFIHsL039S4CtR9UZmEVIEDQlLgC93UXjAoJT0qA9AfWjI0VjLMQsShHKA9A5TYDKHgFVTNXoQAyAylyeEYFGh7RRMShOWETADHiQyO2iDKHw3bJey907HbNGh30pyeH8FGgk1YGgMYA8jZO9LzSi2GwoMDL8H9VrNmXIP8H+zkTHRbOOTSAOwCF43OgExoDO1JMuzuU3NYCnJ+RvJ3L1EfKwzZJ4Dk2RxsIiM8leHsD0FnG8LVw5xCx1B/NxB5yJxJBAtNE+Il3aNxCgrQFxHnEVxtLsPbSAoQsQEaIQpgoWOl0wt4GQqZyYx6LAF0ILVhEW2WxFRvO3NkT1D3PYwPPxO42PKO1PNOyw0vNE2bFopuwfPorQGfKyFfI+3dx+28D+0EqByhNun2QnHlEmScCIDWH8GnDUrWDWDpMjlGmnB/ktmXGJShTwE7S5IRX8WnBXFpQFNgUIkDKjExVIGxR2lVPxWBQAl0ryWZKQH/jZI6nJSISBm5L8WpUgT5OgVCR9jxSSRBn0rjhnFPGMo8CKy1hiBsEpzMrAURScWspgRoTgX9kJhRBMhcuMH8A4IVIZHUlUAPAcjNK4RAFqoqlkpzBhnilROSjOQrAymrGyjrAbEaDuRfWCDfRe0KvYHgDvMqs9CBQBmHkX0mHXG8sQC8qSpAAqrZkyp5IOHGlysivCXlFgFoD4C8CargARNUQL3khiEgC+DABitnCagMp8syWAUCoCXMqRkmAoXHB1FgDwAsntFJGJAM1sh6jOoNmeE0G9RCwAAFLk+rghTlUpurriji6BE0NVzQ3Sq1iY6lTQEQ3JrFSoYl+JoR0QJA+BhIOQegoRs1yZ7Z/DqbqZiDcQQs8bYJQsKA+5pr2ZmbK5mA+YT5+aRYL4GFG5uaz4O4yo1YA8KzJbdYFbOQTgqZDYjiOQYU2kcUqa+4McOccV/AUrmA0relTRGcx9yreaO1Bb+YxCOQjgjYqBrkkBQANpqQqQ8BMgQAjgjggA=="}
import { Base, withResponsiveOptions } from '@studiometa/js-toolkit';

export default class Component extends withResponsiveOptions(Base) {
  static config = {
    name: 'Component',
    options: {
      label: {
        type: String,
        responsive: true,
      },
    },
  };

  resized(props) {
    console.log(props.breakpoint, this.$options.label);
  }
}
```

```html
<div
  data-component="Component"
  data-option-label:s="You are on a small screen"
  data-option-label="I am the default label">
  ...
</div>
```

Resizing the browser's window from the `l` to `m` then `s` breakpoint will log the following to the console:

```
'l', 'I am the default label'
'm', 'I am the default label'
's', 'You are on a small screen'
```

### Define different values for different breakpoints

With the same breakpoins and component as before, but with a different markup, we can define different values for each breakpoints:

```html
<div
  data-component="Component"
  data-option-label:s="You are on a small screen"
  data-option-label:m="You are on a medium screen"
  data-option-label:l="You are on a large screen">
  ...
</div>
```

With these attributes, the console will log:

```
'l', 'You are on a large screen'
'm', 'You are on a medium screen'
's', 'You are on a small screen'
```

### Define the same value for different breakpoints

Breakpoints can be combined to use the same value multiple times:

```html {3}
<div
  data-component="Component"
  data-option-label:s:m="You are on a small or medium screen"
  data-option-label:l="You are on a large screen">
  ...
</div>
```

The result in the console would be:

```
'l', 'You are on a large screen'
'm', 'You are on a small or medium screen'
's', 'You are on a small or medium screen'
```
