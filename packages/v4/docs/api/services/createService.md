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
// @twoslash-cache: {"v":1,"hash":"beaf5a87ad65c0d668bcc9026133a2a970c85f65b606949684abbdac2e8e7eb4","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjUjGY0AymSLt+MADwAhEf3wAFUhCxwKvIhHZQAfI2C8sajVrhpmpNFvxdV6uLwC+iXuNKTpAERgAzdjB2NHYIMHlFFTM4fW53T29ZBTQlR3NtXQMAHWCAWywIGwEhERhEqVwqKAh+BEQQOQBXdlYoXmZeOAlK3n81PN4Q51hA4NDwgDpKamYAc3rkZBAOMABrGfw0NA1EAHo9gCs4AFo0CAhWNZCTogAWScsmqDC8mCtJ2CI95ix2Pe6XkqcD2gmEYh60kmWzyrBAAF14VRLNYGIgAAxUVgwMBzND4JAARgAzFQrKQ5u88GCyhVpDNVrgMVQlNZmPwaOQMS4KOhsEyCMQyDMaPQ8EFOf52TBeCk0jEZiibES7licXiCYhCZjZhSqQ05dEnAygkydazSOzOSqeXycHhCCRyGS6GiQIxTOoyJg+HSYH4xiEwhFDelYpNPbteIw+ABefSyqJhxXktHEnXY3H4pAAVjJ1kpbsjCCxpqJLPslo5wsQACZbdR+Q6hc7qK6mJHvRg+KGYpMhPwilA4O5SjUwKwMLwmutIAB3MDIeEp1FIO4ANjVWc1AHZ83q3QOhyWVmWtRW2dWuYSABwNzD2hqO4UusUNbFoARNUhCMBoUfCOOk7TrOEALkuK7KogOZ5is6rZoge66oW1Lfr+DClmATKEheVbWnWO73k2T4tiK7YNB6Zhdr6kL+gEQRBuEkSpEaGj6NCDgxAA/O4jAxrw8a8AARhc2LMGAfAAD4gaMppQDMNR1HgADq+DvGppC8AABsWMZaQI4RWEEzjibwEBCYCJDtEQbBNDAky8AGzBNKwaDOOc2loKQdladMyKpkg64AJxbhqSA3vuKFPpxxqYUyta4VaNb1ryjaPoKTpkW+cGfvwaE4v+vBjuEwEzms86Lsu/mrogN6wZmYWIZF+ogHlP4FSaWFIAlrWVkl153qlD4Cs+raim6lFejY3a8AASoBJUYAAgj+zAYDIZUVexDX4u4YBNHkQkviAin1CAADi7zuWpvA7fgZn+Lw+IytYloYA5AAq+DsM4P0dLw+2HWQZlYbw31zBpT32GAUMyuDamWLwMDYm8f68LJWHtEEHQw69a1+SASpokFpJwdugXNW6d2dfFiVXt165Eelo1ZRNnbTTRQK+PR4zBsx8pOOxRO8TAeQhLxxbuL2ThxgmOh6LLvAAKpgHATQWYI7BHQptRnaIqZmRZPS4loQhoN+wS4rDT3CKQNQLpMuS5FposhPpUqq9bxZmU0n4eTATpTmrGukFrZAOapIj/cHcCa0dmlmxbcC5H9R1oHOMA4kMn7iVjbldLRvCACgE2lNN0s3MP4ekGaw2Ics4v6wJp/gzhywbJ3+9ifnOa3F10EAAxA+JBHMBlvM4QnsmsYNkPZkFooSdz1fBmqweSUWEwFcVIKTFr9d1TMjaRr5s2ybycnwruFZNUbSxoivy/J1VQYSOak9TiCqshLVXzTO90/hbULgkStWgAKGkEIubJCTDEQwwBci8BMDEXiisjBFRgIOO2I4vztTRi4bgFAEFgxilGfigk2roUmHdXgCZMS8AOIPYeVsPKwA4E6YS7wM5Z0nixeARDhbRivqgxWwAeS5HwQAbhmOfZgSBQCuhxHAYMeA3IgBcC4IAA"}
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
