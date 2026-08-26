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
// @twoslash-cache: {"v":1,"hash":"f0cef24b2703e634509651d5a17c34d83953c36808dcc81ccd377e0e2b47bef1","data":"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"}
import { createService } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"a56378d5233558780a431c6094f8a544cca64f17aface6f87dc1cc5e63fb960a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjUjGY0AymSLt+MADwAhEf3wAFUhCxwKvIhHZQAfI2C8sajVrhpmpNFvxdV6uLwC+iXuNKTpAERgAzdjB2NHYIMHlFFTM4fW53T29ZBTQlR3NtXQMAHWCAWywIGwEhERhEqVwqKAh+BEQQOQBXdlYoXmZeOAlK3n81PN4Q51hA4NDwgDpKamYAc3rkZBAOMABrGfw0NA1EAHo9gCs4AFo0CAhWNZCTogAWScsmqDC8mCtJ2CI95ix2Pe6XkqcD2gmEYh60kmWzyrBAAF14VRLNYGIgAAxUVgwMBzND4JAARgAzFQrKQ5u88GCyhVpDNVrgMVQlNZmPwaOQMS4KOhsEyCMQyDMaPQ8EFOf52TBeCk0jEZiibES7licXiCYhCZjZhSqQ05dEnAygkydazSOzOSqeXycHhCCRyGS6GiQIxTOoyJg+HSYH4xiEwhFDelYpNPbteIw+ABefSyqJhxXktHEnXY3H4pAAVjJ1kpbsjCCxpqJLPslo5wsQACZbdR+Q6hc7qK6mJHvRg+KGYpMhPwilA4O5SjUwKwMLwmutIAB3MDIeEp1FIO4ANjVWc1AHZ83q3QOhyWVmWtRW2dWuYSABwNzD2hqO4UusUNbFoARNUhCMBoUfCOOk7TrOEALkuK7KogOZ5is6rZoge66oW1Lfr+DClmATKEheVbWnWO73k2T4tiK7YNB6Zhdr6kL+gEQRBuEkSpEaGj6NCDgxAA/O4jAxrw8a8AARhc2LMGAfAAD4gaMppQDMNR1HgADq+DvGppC8AABsWMZaQI4RWEEzjibwEBCYCJDtEQbBNDAky8AGzBNKwaDOOc2loKQdladMyKpkg64AJxbhqSA3vuKFPpxxqYUyta4VaNb1ryjaPoKTpkW+cGfvwaE4v+vBjuEwEzms86Lsu/mrogN6wZmYWIZF+ogHlP4FSaWFIAlrWVkl153qlD4Cs+raim6lFejY3a8AASoBJUYAAgj+zAYDIZUVexDX4u4YBNHkQkviAin1CAADi7zuWpvA7fgZn+Lw+IytYloYA5AAq+DsM4P0dLw+2HWQZlYbw31zBpT32GAUMyuDamWLwMDYm8f68LJWHtEEHQw69a1+SASpokFpJwdugXNW6d2dfFiVXt165Eelo1ZRNnbTTRQK+PR4zBsx8pOOxRO8TAeQhLxxbuL2ThxgmOh6LLvAAKpgHATQWYI7BHQptRnaIqZmRZPS4loQhoN+wS4rDT3CKQNQLpMuS5FposhPpUqq9bxZmU0n4eTATpTmrGukFrZAOapIj/cHcCa0dmlmxbcC5H9R1oHOMA4kMn7iVjbldLRvCACgE2lNN0s3MP4ekGaw2Ics4v6wJp/gzhywbJ3+9ifnOa3F10EAAxA+JBHMBlvM4QnsmsYNkPZkFooSdz1fBmqweSUWEwFcVIKTFr9d1TMjaRr5s2ybycnwruFZNUbSxoivy/J1VQYSOak9TiCqshLVXzTO90/hbULgkStWgAKGkEIubJCTDEQwwBci8BMDEXiisjBFRgIOO2I4vztTRi4bgFAEFgxilGfigk2roUmHdXgCZMS8AOIPYeVsPKwA4E6YS7wM5Z0nixeARDhbRivqgxWwAeS5HwQAbhmOfZgSBQCuhxHAYMeA3IgBcC4IAA"}
import { createService } from '@studiometa/js-toolkit';

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
