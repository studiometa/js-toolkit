# Static methods

For practical examples of components and registration, see the [Components guide](/guide/introduction/managing-components.html).

## `$register(nameOrSelector?: string)`

Use the `$register` method to instantiate a class on each element matching the given component's name or CSS selector. This methods uses the [child component resolution](#components) to find components.

**Parameters**

- `nameOrSelector` (`string`): the name of the component or a CSS selector

**Return value**

- `Base[]`: an array of instances of the component that triggered the method

```js twoslash
// @twoslash-cache: {"v":1,"hash":"21edd6ee6f6346ff37fde5baab459c9067c8fe1673fc1f9b49ceb92a05960127","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiACs01EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+yQADYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAB2VEA0bjKaguYLDxLIaI1bWrY7PbXRDIyZ46jnQlXEnUMkgRhYTQ4OwYPhQ17vfz8GEAM3YIUQvGA5l4ed4YGYNSzpVIiJCAG5zEdBa53JC0xmJdRQuFItE4lQEkk4KkMtlcvlCsVShUqjU6g0mi0UimwOmQmUMWgqmB/AlLKxjZ9et8ABx7oaAu2IbEO8F3RshZZupAAZjRXqxhwDmAJHiJ11J9CYUa0ZEwPhC2LXhS3LJwzW+ABGNYHxtIF7RbR0IWA3BXSRRB/k9DFvQOf1TkDd9LmJG4fw8GkRATGF3ggr4UTWC0j1tYFBiQi8PCo2F4RWAZHxw581lfIMPxDUiIUYCdCCgPgvBkOR6CZZQDGjXQWRU4x/AAElIGAQnYUoyEkTkVIoXg3xgCBUyeF5qLhYxGHGfSs3MyzrOhLjTNQgB5UgAGUYGGPZbAAfhLNAy1Gbgs0MSx9KkTj3mMZB2lrYUPAAJV0/T9l4ZhFF4SwIDKOFctYVheERHowH4eBeFc8ZvBTdykyCVtpXbRFOwIBVeyVAdVWHDUx21Sd9WnVoehXfgskk6AAg3VgAGIdL0gzSCyVDbFUQLcnWsDRm3U06N9KDGPgk9WNmdiQG0rK1pvDDWOwzEfRgoSiM/UMaDIkAKLcxM4Vo3d7zWa1hmY3i2KdBtmsB9DVigj10Reg5BII8zgxI79xNm6S6TkxlFCU1QuXZNSjA027Vv2IzlKMUyXKshK7Ic/AnLM85XOZtBPKLGAfP8naQrCiKQii3gYriyRuaSlKqCFetMupshcvywrivsNhysq4Jqtq+r8EamyuObYIpRQDq5S7Hq+2VQc1RHTVxx1PUDRnSb2Gm3H5rQTdlru/YNr5raApgIK9vC8DOh3c070RpiEJBKGISp7Kv1lBGkafV60fxC5PrEu5fEo42aJj74736MHjxY89oe5h6EZ+PiUaQXPCPz0TsaYXGZIkAmFKJ8m2Q5OntEpla09IWmSZMjmcC50uWcc3t54spml55gs+YF0Pw9C0DI8i6LNFi1Rpc32XUsVgOVbyqACqKkqtYqsAqpqkQDaN2Hila82ZQ7PKHstt+pDnVKOLUE5dRTkNCkD2XtahSR9n7Sea0g41BDkLCOotDqQSmKDBOF064p1QVieGSAoLN1+sjXCFDBImhTLAPAvJbD2GAHSXgRxeCplPrwAA5AAAQgc7YI/YVRgLQHwqsYBzB/W5vJBQzIvDZlzIfZgU0BBXjJjmMA+Zt4gT4dzPhFBVFHGkUccw5g0i8AAOrsDKo/DWZlDb/VsvYP6MJeAAANkBQHUcwLITUAZoB0KYGGwSwntC8XIYYNQ4RwHMNzLSpCyCMG4NIqxKRbH2PKurEqDVXFcTFLSTxPi/HBECZvUJIAABieRInRNDnEtACSwBJNTmtRgfC6kQD4ekyxYBrF2IcawPIMRnHf2CcUz+uivH+EsBgSpP9GmxPeK09pKTSBdPmYsoJbi+kVicFApAoBCZwFXHgTIIAjhHCAA"}
import { Base } from '@studiometa/js-toolkit';

class Component extends Base {
  static config = {
    name: 'Component',
  };
}

// Will mount the Component class on `[data-component="Component"]` elements
Component.$register();

// Will mount the Component class on `[data-component="Foo"]` elements
Component.$register('Foo');

// Will look the component class on `.my-component` elements
Component.$register('.my-component');
```
