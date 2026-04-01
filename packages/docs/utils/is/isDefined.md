# isDefined

Test if a value is defined.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"f76dec7a967bbdc63dba962f3e6ef290cb09b5e3c36d2e5c094148572e4122d5","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpe7OABEYAM3ZgYURL0ZE2AVxhK1YANaQA7mD4BeAHy8ARhAisYzMAB0w7ALZYIpUeKmz5USiBQEPwIiCAAKvBe0rzMvKqsGmJwvLC+CrwevJBoAHQBaMwA5qHIyCAcugH4aGhYcIgA9I0AVnAAtGjWrDrseSJqUOwQLjCFubBEjWpo7KxwjeKLkjJyCrk1LqwgALo7VCLMnkgAnFS2YEVo+KdUhaRFY3jeq34BlbiIAAxU/PhHzH4NHIiBOAF8KOhsJ8CMQyAU6AwwiwOFw+C90lAVOpNLxtHoIIZuEorDY7I5nG4PF4VpiAkEQnhIiIxDE4gkkuJUq8Mlkcvk7sVSuVKjpqrV6k1Wh0ujZev00INhqNxpNprN5stlj41lANmgtrt9iBDsdEABWM4VGCXa63ahHR5IkAY3XvNZIABMv3+pEBwKQXwhUJweEIJHId0RTDYnB4yR1fmxiVx+IMRhJ3XJTlc7k8CZ5/ioDNCESirNi8RxyW5mMypGyEDyBSFSDKFTkYqoNTqDWabU63XluQGQxGY2YExgUxmcwWS1dfn1hr2B3uSIAHObzjarjdQYKHk8wouFO75EgAMw+gFA+HfYPUaFhuGR6jR5GxtEFzHJjRaXR02JSws3sHMqXzU8i0CYJS2ZaJKw5GAazSXV60bZtBRKNsRU7cVeylAdZR6PoR0VMcVUnNVZ01BdaV1ZdtlXE11yQABGL4rQuPd7XuJ1nnot5zg9RAABYbz9O8QSDSEn1DMJw3hKN6BjVF4ygv9U0AwkMxAskwMpPMaUTM9i1gply3YNkqxTFDC3Q/kW2wlBcKqbsJT7aVBzlUjR2VCcpxnDV5xCky9U2JjjVNJE2MvcTrVtfcrT448XUE0yOwvC0JP9e8g2NQRYGeCDRGAH80LBXhpFIEZeAAcgAAT88dCi84j5XVOc6oAbicHN0qxOrpGsOruG63hml4NBSA0fqwsYNjPUvMaJsaKaZpgObC0YMA1FYVgVsm6bZucAbGEOtbpDYOBcCoSikFAREbTgYYwDwNoQDBMEgA=="}
import { isDefined } from '@studiometa/js-toolkit/utils';

isDefined('foo'); // true
isDefined(123); // true
isDefined(null); // true
isDefined(); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is not `undefined`, `false` otherwise.
