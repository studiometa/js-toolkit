# withLeadingCharacters

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"5cffbbf8b31b0e9f203bb2d90e814c714bcb863d38b3691f215b3a821a70eb7c","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7s0+ADIxmUdmADmAYXzNSzMWTiM4aUmvWJeJsxoq8ROvQdJxL189zenzAHTDsAWywIUjQZOUVlVQ1tXX0aF0oQKAgRBEQQAEEoKF55GF51dhIpBzjnODyIPPwCk10wiH4agqKSq28NADoktGZ1dORkECw4gKT3DV4AFVqOm3Uq3gDodn4MHoBdCmHRvXGqMqcEytmCo/jDJZVctGr8joatnZBSGDRBUjBKMEFWVm2ww4YAA1kl8Gg0FhXAB6GEAKzgAFo7hBWCC5F0TIJVBAAu9mF1YEQYYJxKw4DDJuoYbJ5EoVOZYsdDF0IQFWCBNtsQPVQkgAJxUVgwDTyJAAJgAjFQ+qR1O88HTIoyYo5LolhWpcIgAAyHdXOQUAXwo6GwOoIxDIvToDAyLA4XD4yoZ0S0hpOxk6Fnm5jsFwqXgWnj9Gj8gWCoXC9KiTM9hiSKTSeGytzmbVF9gTLiWDz5jWaD0zUmpPVl/UGuzGEx9Mzm1KWK1U62e1f2SUDJ3r5xzlTuvBueYbcrQbde70+3wov3+gJAwLBVAhUNhCORqPRmOxuPxfSJMBJZPYFKpPtpETd8fKJzZaA5XJ5BaQAHYZQvRepxYhpRX5YqMldOM1RvRMtTAHUJQNUDyD1U1zRwPBCBIchZTtJg2E4HgYxVd1mQ1IxqWDf1sxg1ww3UUNqQjIIQjCIDVQ9Mik1SdIshyFpCmKLMuyuAd81HXgmk4ksKPLahKyQIYRhrKhGzOCim1WVsuRePZmAOEBeNzBTtP7aoh34kcnlU4Y3g+L4fj+AEXkXcFIWhRA4URFEIDRDExx3CQ90JYlSXJSlqQvWNGPwio7wfbk5NHJApQlAAWYVP2/X8JP/e0QAYvC+ySYEdQAZmgllYN1Y0eREaBLUjOjeGAHCrxA4rKmNARSDxXgAHIAAEvLxAl11c9y5H8k84A6gBuPw/Cy68msYDrqQ6uwOoAfRWjruHG3g4V4HwQDW6iQGmy9gKYubVpWxblrWjatp2vaDp9Pakh8pBQDtUU4Akb4MkREBjWNIA=="}
import { withLeadingCharacters } from '@studiometa/js-toolkit/utils';

withLeadingCharacters('string', '__'); // "__string"
withLeadingCharacters('__string', '__'); // "__string"
```

### Params

- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to add to the start of the string.

### Return value

- `string`: The modified string.
