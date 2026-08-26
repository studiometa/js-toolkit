# createContext

```ts
createContext<T = unknown>(description?: string): ContextKey<T>
```

Creates a typed injection key.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"8ea1048d5a6706495cd488eadac2c703c177936468987da74f3b6234641ddbf0","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAYUk16AHgAqvALy9hAa0gB3MAD5GsODPZZxkgPyJecNKXZgA5t0dKwKtAGkYDA0TAB0wdgBbLAhSNGlZeRgfP0oQKAgRBEQQBUSaXmZeTBwoaWU6eL0ggDo0tGZ3bORkEA4wPTT8NDQsOEQAegGAKzgAWjQICFY9djQxogAWGudBKAlImAaa2CIB5ix2AZEK+mP85NO0Gu7I1hAAXQeqZ2Y4pABOKlYYDzR8JAARgAzFQGqR3Fs8DI5Iorml2rhEAAGKgifBvZhiMifAC+FHQ2CRBGIOLBlSYbE4PF4bhopH4WJgvAAyux3GA2BptLoOkZTOEojE4qz2Zz7lQMlk8ABBXiJMTsEi8IhsQTMwxzfBODCifCkSQQQRwJyCABGllcNgkYDgdRe4IYiAATF82r93P8kAA2MFvSFOkBsjlsBFuJGokDozHY8guj74wk4PCEEjkcn0PB0siMkTMlkcWCkGWHNKvd6IAAckZ+fwBiDd4IDeAL7CLJfYYbASOdaIxpCx9KByMT1CJKdJ6eoFJyjCwBpwcQwfFb7cOKwaNEcwfFqmA4V4h9pYFgtEcYEEkTNZAA3OFcSYy47Potvh6vYgAKx+iFQnKvGguyRUEo37QccRdUcSmJVMyWnTNZypLg+GzBkmVFENWG5HR9H5MIImiWJ4h3UNJUybIQDlBVxGVVVWHVXhNX+HU9QNSBjVNC0rGtSQ7SfN4nUBZFATfOsfR/ZschIiU2nDJAQOjAdYzxAkx2THJYKnVJZ3nCBF0wFCTzoc9L2vKdy0EoTRM9etv2of0/xANxTyA+S+xjIdEEBSsoPHDTJ3qGcQEYTZ/mgFdCzIDsancCAADlKkYLwVQgNt+IrEEa3fetfXs39A1ihLM2+OTEFfUCPIg51fPUkk00ChCo144jItIFJKm8K5AmCVcosOR8HQEoFvV7d0xK8kCm0c3q2vhEruyQAB2dylM8kEapggKM0DFgOGQhJYUuXxKlUGaOzMCxuNsMAHCcFw3E8TrjvobrTta87BUIkUYSSdrivSci8DyQ7CmKIkyhOZ6qlqepGmaVp2k6Khul6fohlGCYphmOYFmWVZ1ggULmB2GA9gOI5Ib8c5Dr+65bnuJ5BoyxbK2sj8QQkxyfrhKHXMQZaKtWqqE1U6CJ3q7as2OtC81Zd7SyZwSPlG2sbM+TnAzOhXZIW/mVvAuNFmBXFnia2Asy++JgAO36rgoMGcAw8VeFxAQDUiXgAHIAAF8Y2LZmBGcZJmmWY0E9u8wEFaXc3zeX2F4fcpDupJtzFLlrec4zeAvK8yBdkxI8PQrEuSohUqgSPcXCcI6GFeJIecOW2zIWmeW5o6/Delvi36xhPbgVrPe4G80iJpBQEqX44BtPA0AQXFcSAA"}
import { createContext, type Signal } from '@studiometa/js-toolkit';

interface SliderApi {
  state: Signal<{ index: number }>;
  goNext(): void;
}

export const SliderContext = createContext<SliderApi>('slider');
```

**Parameters**

- `description` (`string`, optional) — for debugging only.

**Return value**

- `ContextKey<T>` — an opaque value carrying the phantom type `T`.

## Why a value and not a string

**The identity of the key is what resolves.** Two keys with the same description are two different keys, so nothing collides — and the type parameter is what makes `$inject(key)` give a typed value with no cast at the call site.

Declare the key beside the interface it carries, and export both:

```ts
// slider-context.ts
export interface SliderApi { … }
export const SliderContext = createContext<SliderApi>('slider');
```

Provider and consumer then import one module and agree by construction.

## The default is `unknown`

`createContext('name')` with no type parameter gives `ContextKey<unknown>`, so `$inject()` resolves with `unknown` and the consumer has to narrow. Give it the type.
