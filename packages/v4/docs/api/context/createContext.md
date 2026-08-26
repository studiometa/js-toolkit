# createContext

```ts
createContext<T = unknown>(description?: string): ContextKey<T>
```

Creates a typed injection key.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"6bc8df682560756ec1fbbd58c74f31047697857bd77945bf8cdf924158eff577","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAYUk16AHgAqvALy9hAa0gB3MAD5GsODPZZxkgPyJecNKXZgA5t0dKwKtAGkYDA0TAB0wdgBbLAhSNGlZeRgfP0oQKAgRBEQQBUSaXmZeTBwoaWU6eL0ggDo0tGZ3bORkEA4wPTT8NDQsOEQAegGAKzgAWjQICFY9djQxogAWGudBKAlImAaa2CIB5ix2AZEK+mP85NO0Gu7I1hAAXQeqZ2Y4pABOKlYYDzR8JAARgAzFQGqR3Fs8DI5Iorml2rhEAAGKgifBvZhiMifAC+FHQ2CRBGIOLBlSYbE4PF4bhopH4WJgvAAyux3GA2BptLoOkZTOEojE4qz2Zz7lQMlk8ABBXiJMTsEi8IhsQTMwxzfBODCifCkSQQQRwJyCABGllcNgkYDgdRe4IYiAATF82r93P8kAA2MFvSFOkBsjlsBFuJGokDozHY8guj74wk4PCEEjkcn0PB0siMkTMlkcWCkGWHNKvd6IAAcoPdfwBiDd4IDeAL7CLJfYYbASOdaIxpCx9KByMT1CJKdJ6eoFJyjCwBpwcQwfFb7cOKwaNEcwfFqmA4V4h9pYFgtEcYEEkTNZAA3OFcSYy47PgB2b4er2IACsfohUJyrw0F2SI1tGA6xkgzqjiUxKpmS06ZrOVJcHw2YMkyoohqw3I6Po/JhBE0SxPEO6hpKmTZCAcoKuIyqqqw6q8Jq/w6nqBqQMapoWlY1qSHaT5vE6gLIos751j6v7NjkpESm04ZIKB/aDjiDbQeOORwVOqSzvOECLpgqEnnQ56XteU7lkJIJiZ69Y/tQ/r/iAbinsBCl9jGQ6IIClZqcmGmTvUM4gIwmz/NAK6FmQHY1O4EAAHKVIwXgqhAbYCRWII1j84mIL69l/oGsUJZm3zyYgolRkpEEur5sEBRmgYnLaJGRaQKSVN4VyBMEq5RYcj4OoJQLenZ2U2UCNZNo5vVtfCpXdkgb6VR5KkgrVE5poFiHBchNIwkk7VqDNHZmBYPG2GADhOC4bieJ1viVN1qjHf1gpESK+1wg9JXpBReB5LCzJFDBZRNX4vDVBg9r2U0SAtHJHRdD0fSDCM4yTNMszzEsG5rBsWzMDsMB7AcRxg5U5yA4d1y3PcTyDRllaAtZn5WflUlRhc1OuYgS1gcpcauut/mbQ1WYPeheasq1HbpUJHyjR+9aNg5gYvZ281InzVWeYswK4s8UbQMSQrEbwwAJFTVwUMURKYeKvC4gIBqRLwADkAACqzrBAoXMGjExTDMcwLIsbt3mAgoS7m+Yy4c5sHtdSTbmKXIW85xm8BeV5kI7JgR4eRWJclRCpVAEe4uE4R0MK8RNc40ttmQ1M8p9lzfWgz1x+wZhu3ArVu9wN5pH7SCgJUvxwDaeBoAguK4kAA==="}
import { createContext, type Signal } from '@studiometa/js-toolkit-v4';

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
