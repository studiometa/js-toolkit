# createService

```ts
createService<T, R = void>(definition: ServiceDefinition<T>): Service<T, R>
```

The primitive every built-in service is built on.

## The definition

```ts
interface ServiceDefinition<T> {
  props: () => T;
  hasProps?: () => boolean;
  start: (emit: (props: T) => void) => Unsubscribe;
}
```

| Field      | Does                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| `props`    | reads the current props                                                             |
| `hasProps` | says whether there **is** a current value, which is what `{ immediate: true }` asks |
| `start`    | starts the source on the first subscriber, and returns its teardown                 |

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"fb2eb37f13a014dab85e896fb587f4064689cffb4c78230e2a0549371d98ffca","data":"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"}
import { createService } from '@studiometa/js-toolkit-v4';

interface OnlineProps {
  readonly isOnline: boolean;
}

const useOnline = createService<OnlineProps>({
  props: () => ({ isOnline: navigator.onLine }),
  start(emit) {
    const publish = () => emit({ isOnline: navigator.onLine });
    window.addEventListener('online', publish);
    window.addEventListener('offline', publish);
    return () => {
      window.removeEventListener('online', publish);
      window.removeEventListener('offline', publish);
    };
  },
});
```

## What you get for free

- **Lazy and reference-counted.** `start` runs on the first subscriber and its teardown on the last. With no subscriber there is no listener, no observer and no frame.
- **Symmetric subscriptions.** `subscribe(callback)` returns the unsubscribe function. A subscription is a **record**, not a key in a set, so two holders of one function are two subscribers.
- **A safe fan-out.** The fan-out walks a snapshot and each record carries an `isActive` flag, so a subscriber that unsubscribes during a delivery is not called.
- **Error isolation.** A subscriber that throws is skipped and reported as `callback.service-failed`.

Publishing is **re-entrant**, so any code that changes state after a publication must check first that the service is still alive.

## `hasProps`

Omit it and the service is assumed to have a current value. Declare it when it does not:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"beaf5a87ad65c0d668bcc9026133a2a970c85f65b606949684abbdac2e8e7eb4","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjUjGY0AymSLt+MADwAhEf3wAFUhCxwKvIhHZQAfI2C8sajVrhpmpNFvxdV6uLwC+iXuNKTpAERgAzdjB2NHYIMHlFFTM4fW53T29ZBTQlR3NtXQMAHWCAWywIGwEhERhEqVwqKAh+BEQQOQBXdlYoXmZeOAlK3n81PN4Q51hA4NDwgDpKEEtrBkQABipWGDAAczR8JABGAGYqK1J1mAWQQWExHukZjjBcJaola2Z+GnIllwp0bAeCYjIMxo9DwQXe/leMF4KTSMRmcxsuwALCs1pttogdstqNYTmcYdEnLcgg9sc9SK93sivj8cHhCCRyIc6GdGKZ1GRMHwKr4AkEQmEIgT0rFJuyNO5GHwALz6aFREXwo4LPbY1YbLZIACsh1xpzw4oQKxJuye9gpb0BiAATDTqL96QCmdQWUxxZyMHxhTFJkJ+EUoHB3KUamBWBheE0wABrSAAdzAyAAukr5kgkQA2VEajEAdl1x31DT9AaNIDuDx2Zpelo+OwAHHbMHSGgzAcyQQ1VmgBE1SEIwGhg8JQ+HIzH44mU1QEQstTry2jNYh8zjC2d+H2BwxjfdTedzZSrdbc02Ha2nUDXQ02WYPdzrjA/GMBeFIqlCRp9JN7HARQB+SUpV4WVeAAIwgCBVmYMA+AAH3HUYSSgGYajqPAAHV8FObDSF4AADQ0pXwgRwisIJnBg3gIDA7ovBgdoiDYJoYEmXhn2YJpWDQZw0AgAi0FIFj8OmGdlSQDMAE5s3RJB6wLPF6QcOFdwea1qwtKkbTPFt/kZK9O0XHtN37NYh14ENwjHKNYwgBNk1TRFEHrBd1VklcFKLc4tzM4k9xtDSjzrRtvntXS22dYFWXdGxPV4AAlEcrIwABBftmAwGQbMnb83K2dwwCaPIwPbEA0PqEAAHFTl47DeDy/BqP8XgtihawKQwNiABV8HYZw+o6XhCuKshqPuXhevWXCWvsMAZqhSbsMsXgYFWPIzN4JD7naIIOjm9qMtE2ZxMQSSDkXHMJM8s4Gr8tTAtrJBrQzHS/gigzorvWKHy8Spn35CYhQVGJv1nSUYDyEJJUNdxvScGU5R0PQEd4ABVMA4CaWjBHYErUNqCrRGVajaJ6DYtCENA+2CDZ5pa4RSBqBNJlyXJ8IhkISIhDG6cNaimh7PiVsZCNMex0hcbINisJEQaxbgHGSrwynqbgXIBpKtA4xgNYhh7GCdp4rpH14QAUAgIppuni5h/GI0jWFWN5nAHWA8P8KM3kFNXB3sHs4wys2un4yAtiCdZSPW5wwNeaMJrIVjHIWHYkVcpcMQXI5FIaWc7qQc7ySCp7XsdfSO2il51vePgOfM28nFh4H4ZAxGskT3YtXO27EBRNcs5AGvc8QfPD0ezFFhcJMnmgP4LjKHlkkbr8jFyXgTBiSUUaMCyYH9Rmg17UzB1cbgKBXiblPr3hgNAkzt0mBreDlZZeAAehfoaIFD2mhdgDhGXA042tdbRw/PAM+YMr4103ijYAXxcguG4AAbhmJXZgSBQAsjWHAQUeAeIgBcC4IAA="}
import { createService } from '@studiometa/js-toolkit-v4';

interface BatchProps {
  readonly records: readonly unknown[];
}
let current: readonly unknown[] = [];
// ---cut---
createService<BatchProps>({
  props: () => ({ records: current }),
  hasProps: () => current.length > 0, // nothing to deliver between batches
  start: (emit) => () => {},
});
```

This is what makes `{ immediate: true }` honest: the frame tick has no current value between two frames, the pointer has none before it is seen, a drag has none outside a gesture, and a mutation service has none between batches.

## What a callback may return

`R` is a type parameter, so a service can require its callbacks to return something. `useRaf()` uses it to enforce `RafRender`:

```ts
type RafService = Service<RafProps, void | RafRender>;
```

## Scoping it to a target

Wrap it in [`perTarget()`](./perTarget.html) to get one instance per target and per options, keyed in a `WeakMap` — the caching every built-in service has.

## Making a mixin over it

See [`createServiceMixin()`](./createServiceMixin.html).

::: tip A consumer's service is owned by the consumer
The shared runtime coordinates the **built-in** service caches across duplicate copies of the package. A `createService()` or `perTarget()` call of a consumer stays owned by that consumer.
:::
