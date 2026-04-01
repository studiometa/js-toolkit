# Base class

Create components with ease by extending the `Base` class. For a step-by-step introduction, see the [Getting Started guide](/guide/).

```js twoslash
// @twoslash-cache: {"v":1,"hash":"8236f1f9a006c6b6a734b7ee2c84b31864bd3b8591483051ff85b8454a8d3b04","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiACs01EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+yQADYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAB2VEA0bjKaguYLDxLIaI1bWrY7PbXRDIyZ46jnQlXEnUMkgRhYTQ4OwYPhQ17vfz8GEAM3YIUQvGA5l4ed4YGYNSzpVIiJCAG5zEdBa53JC0xmJdRQuFItE4lQEkk4KkMtlcvlCsVShUqjU6g0mi0UimwOmQmUMWgqmB/AlLKxjZ9et8ABx7oaAu2IbEO8F3RshZZupAAZjRXqxhwDmAJHiJ11J9CYUa0ZEwPhC2LXhS3LJwzW+ABGNYHxtIF7RbR0IWA3BXSRRB/k9DFvQOf0TRTWA8F5Wx7GAOleCOXhU00SxeAAcgAAVHLUJ2YfsVSHIp6KrMBzBpEQExhd45HoJllFFHMwDzHoV34AQr3ZbNc3zVCs3ooTYTQeiKBUo5eJrKg2KQUBGTAOBVzwTIQCOI4gA="}
import { Base } from '@studiometa/js-toolkit';

class Component extends Base {
  static config = {
    name: 'Component',
  };
}
```

Discover how to configure and use the `Base` class in the following sections:

- [Configuration](/api/configuration.html)
- [Lifecycle hooks](/api/methods-hooks-lifecycle.html)
- [Services hooks](/api/methods-hooks-services.html)
- [Events hooks](/api/methods-hooks-events.html)
- [Instantiation](/api/instantiation.html)
- [Instance properties](/api/instance-properties.html)
- [Instance methods](/api/instance-methods.html)
- [Instance events](/api/instance-events.html)
- [Static methods](/api/static-methods.html)
