# createContext

```ts
createContext<T = unknown>(description?: string): ContextKey<T>
```

Creates a typed injection key.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"6bc8df682560756ec1fbbd58c74f31047697857bd77945bf8cdf924158eff577","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAYUk16AHgAqvALy9hAa0gB3MAD5GsODPZZxkgPyJecNKXZgA5t0dKwKtAGkYDA0TAB0wdgBbLAhSNGlZeRgfP0oQKAgRBEQQBUSaXmZeTBwoaWU6eL0ggDo052Y4pABOKlYYDzR8JABGAGYqNEb3GAYcmTlFCvo0jjBcRAAGKhF8RuYxMhaAXwp0bAWCYi3ByqY2Th5eNxpSfg2YXgBldncwNg1tXTADCGMwiLRWLxF5vNhpDJZPAAQV4iTE7BIvCIbEEj0M7C6TgwonwpEkEEEcCcggARpZXDYJGA4HUqA0mogAEytEDtTrdRAANkGw1GeFB71YszcC2WIFW6025GZzV2+xweEIJHIpxmORuZHuIkeTw4sFI0Kw7HqQ0ZAA4BmyOu4ui1eaQRmMQHr2AajSa2qKkEyVmtSBtbr1FvLqAclcdVdQzjlGFh8Tg4hg+K73caag0aI5BR9gOFeAXrmBYLRHGBBJFSWQANzhbYmU2NMbNADsbRtdsQAFYHU68JncF75kgrZKA9KfaGSodlSdo+qQCwOFw+Jq7g9nq8hZ8dPojKZwlEYnFN2DhVRIdkQLD4eIkSjWGjeBisXAcat8ZAiSTyVYqZJaUbRkekWAAWdsOSQHlqD5Z0c3PNlvUQUd/UDLZEDlPYw0VHJZyjVJY3jCBE0wVdizoMsKyrKMGTGHp+gg21OR7GDHX5DVyNoEVh2Qv0pSDRAenNKdw1wyM0gIxdIlGQgoBTfUyA9Gp3AgAA5SpGC8ZEIDdIC6L6K12SYqDe3YkAVPUmYhwWcCJVQidmREnCjhVCSYwlACQQU0gUkqbxpgCIJVFTRTjQbekzTorkWKMzsGNYvschCnyAu4hY2zs/j0P6JyZ3EtVnSXS4+AmJJfLUZKPTMCw/1sMAHCcFw3E8fzfEqQJgkqsLDyBE9SqmNqrPSTIrzySZHiKacyhEALeGqDA6RAWjenNHpGLiq0zUSiV8mSVLrKQDKxzQmUWVyiNXIKvA121XVvI9PTemaGKO05VktrMrrPUQnijvsgTQL6bYAF0VmgQ4j2BXhgAScbyrQChigOU8hV4bYBHxSJeAAcgAAWcQQoAkaShgAegAKzgABaNAIAgVg9ExKmiFA7HazAQ82vXHVnnu41ofzRqkmzLdcyLEtKMrMg0ZMdmCwsjStKIHSoHZ7ZwnCOhj3iGaaS8t0yHhr5+r2wa0GCvn2DMbG4G87HuGrNISeYJBQEqDo4GpPA0AQbZtiAA==="}
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
