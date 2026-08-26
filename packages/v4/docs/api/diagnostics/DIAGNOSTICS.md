# DIAGNOSTICS

A deeply frozen object of every code the framework reports. `ToolkitDiagnosticCode` is the exact union of its strings, plus any `'<namespace>.<name>'` a consumer reports.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"18d5b190b7682ccfb772cdcc56d0594bc7423793d247e2a4153dbdf5fff74b6f","data":"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"}
import { DIAGNOSTICS } from '@studiometa/js-toolkit-v4';

DIAGNOSTICS.component.loadFailed; // 'component.load-failed'
DIAGNOSTICS.responsive.unknownBreakpoint; // 'responsive.unknown-breakpoint'
```

[[toc]]

## `attribute`

| Key                | Code                          | Reported when                                                               |
| ------------------ | ----------------------------- | --------------------------------------------------------------------------- |
| `unknownQualifier` | `attribute.unknown-qualifier` | a watched namespace with a finite vocabulary gets an unknown qualifier head |

## `callback`

Every one of these is **reported and continued**: the failing callback is skipped, the others run.

| Key                              | Code                                         |
| -------------------------------- | -------------------------------------------- |
| `signalFailed`                   | `callback.signal-failed`                     |
| `contextSubscriptionFailed`      | `callback.context-subscription-failed`       |
| `contextTeardownFailed`          | `callback.context-teardown-failed`           |
| `attributeWatcherFailed`         | `callback.attribute-watcher-failed`          |
| `serviceFailed`                  | `callback.service-failed`                    |
| `schedulerTickFailed`            | `callback.scheduler-tick-failed`             |
| `scheduledTaskFailed`            | `callback.scheduled-task-failed`             |
| `domUpdateRunnerFailed`          | `callback.dom-update-runner-failed`          |
| `extendableEventExtensionFailed` | `callback.extendable-event-extension-failed` |

A scheduled task also **rejects its own promise** with the same value.

## `component`

| Key                        | Code                                   | Reported when                                                     |
| -------------------------- | -------------------------------------- | ----------------------------------------------------------------- |
| `loadFailed`               | `component.load-failed`                | a lazy import fails — once per name, never retried                |
| `mountFailed`              | `component.mount-failed`               | a mount fails                                                     |
| `lifecycleFailed`          | `component.lifecycle-failed`           | `mounted()` or `unmounted()` throws                               |
| `invalidMountStrategy`     | `component.invalid-mount-strategy`     | a `data-mount` value is unusable — the component stays unmounted  |
| `invalidFamilyDeclaration` | `component.invalid-family-declaration` | a `config.components` value is neither a `Base` class nor a thunk |
| `configConflict`           | `component.config-conflict`            | `@component` and `static config` declare one key differently      |

## `event`

| Key                  | Code                         | Reported when                                  |
| -------------------- | ---------------------------- | ---------------------------------------------- |
| `invalidEmitPayload` | `event.invalid-emit-payload` | `$emit()` gets a payload that is not an object |

The event still dispatches.

## `manifest`

| Key              | Code                       | Reported when                             |
| ---------------- | -------------------------- | ----------------------------------------- |
| `duplicateToken` | `manifest.duplicate-token` | a manifest declares a token already owned |

## `option`

| Key              | Code                     | Reported when                                              |
| ---------------- | ------------------------ | ---------------------------------------------------------- |
| `literalDefault` | `option.literal-default` | an `Array` or `Object` default is a literal, not a factory |

The value is then used as declared and **shared** between instances.

## `protocol`

| Key                  | Code                            | Reported when                                                       |
| -------------------- | ------------------------------- | ------------------------------------------------------------------- |
| `lateRegistration`   | `protocol.late-registration`    | a negotiated-event listener calls `wrap`/`waitUntil` after dispatch |
| `unappliedDomUpdate` | `protocol.unapplied-dom-update` | a claimed runner resolves without calling `apply`                   |

In both cases the change still happens.

## `ref`

| Key        | Code           | Reported when                                                                        |
| ---------- | -------------- | ------------------------------------------------------------------------------------ |
| `mismatch` | `ref.mismatch` | `config.refs` and `data-ref` disagree on the `[]` suffix — once per instance and ref |

## `registry`

| Key                | Code                          | Reported when                                         |
| ------------------ | ----------------------------- | ----------------------------------------------------- |
| `conflict`         | `registry.conflict`           | a name is registered twice — the second is ignored    |
| `lazyNameMismatch` | `registry.lazy-name-mismatch` | a loaded class's `config.name` differs from its token |

## `responsive`

| Key                 | Code                            | Reported when                                                               |
| ------------------- | ------------------------------- | --------------------------------------------------------------------------- |
| `unknownBreakpoint` | `responsive.unknown-breakpoint` | a `:<suffix>` names no configured breakpoint — including the v3 list syntax |

## `scheduler`

| Key                    | Code                               | Reported when                      |
| ---------------------- | ---------------------------------- | ---------------------------------- |
| `backgroundPostFailed` | `scheduler.background-post-failed` | a background turn cannot be posted |

## `service`

| Key             | Code                     | Reported when                                                                                        |
| --------------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `missingTarget` | `service.missing-target` | a caller-supplied mixin `target` resolver returns `undefined` or `null` — **no subscription starts** |

## `storage`

| Key                 | Code                         | Reported when                                    |
| ------------------- | ---------------------------- | ------------------------------------------------ |
| `accessFailed`      | `storage.access-failed`      | a provider's area is refused or full             |
| `serializeFailed`   | `storage.serialize-failed`   | serialization throws — **nothing is written**    |
| `deserializeFailed` | `storage.deserialize-failed` | deserialization throws — the default is returned |

## `swap`

| Key           | Code                | Reported when                                                         |
| ------------- | ------------------- | --------------------------------------------------------------------- |
| `selfIgnored` | `swap.self-ignored` | `self` is passed with `append`/`prepend`, or content holds no element |

## Consumer codes

`ToolkitDiagnosticCode` also accepts any `` `${string}.${string}` ``, so a consumer reports on the same channel with its own namespace:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"6cd65535de6fd698ddfd7bac583d2a7f0500b54bfe253c1d4ea58b1171f7315f","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7NSYRiOgxEvACoQIrANbs0AEU4BzSHHEiAwsoq8AtvDjMjK3mdLswRm8F5LbWSRgwNBs0OWc0XgBfAH5VQydTcytgujRuVQtBMwhbAFESYIAeDS1dA2Mk9hF9GDD2VgA+AB0wdn8IUkjZeUoQKAgRBEQQACUYAK7eZhk5Ns9eSV40fBheKEqIM2rffGYwMBhWADpW1oBBX1yAw+DeUgnOtDhl/FIIQSN8XlbgAAEOGBtD8wAAhLgwY4AEh6UlaUVaNmk+Gq334DVYLw8vD0Lwg0ikYGY9la+ygvCOMHswWO6hRWJeKzW/E6tgEnSusBkem+kBxYDM+xEazQEHujymXF4gBQCaatWzQQSsGAAWmVJFYvFWrBwpBsHJmIlYXBeyNROJekEiMwABuC4DAbcc+oKukgAJxUZWeFZIAAsVDCpAieFhfUBuEQAAYqCI9qRmGIyB6ohR0NhIwRiMnA2kmGxODxZvJFMpVKUdHoEiYtslrHYHE4XG4PF5eD4/DcgiFluE6tE4rxq1VLJIaPQMrwsjl8oU0CVNJWKola9VavUmq12pNunM+gMhnhxjvpsX5kZFlImetNtsRLt9ocTmcwJdO4E7g8d4y3h8viD/kBYFWntSEYTmEEETAJEUTjAQMSxKRcUWAleCJEkiTAclKWpNBaTUekLVeZlWXZUhOTWaQeTQsUPEFUQRTFL8nmmF5ZWYeVFWVNUYA1LUjl1fVyMNY04FNWDvnYS0IGtXg7QhJ0XSDBhEAAVgARi9IIjF9RAA2oPsVJAMMvQ8SMACZY3jRMaHIaNU3THA8EIEhyFzegmCwd5dUwPhh1XUdUnoY531uNBBxbBYAB9eGEWB0UOKAlLkFT1PMyyQG9HT8A9QNDLwULu3DMykAyuM5Bs5NEAAdnUqIAF1Y2UPBtxYnxYWiAR3jZAByP4zEEDZcjqZgAHoACs4BVUUyj0FUiD9HqAG4X1hRgepEOQPgdE5IBVOAOFgOAepsHrLgsLbsiObkVho1xDrWAZ4BolZW2OE72yuDowtUHqLveK7WB66JuCWvp7DCJBQDSII4AkMA8GeEAoiiIA"}
import { warn } from '@studiometa/js-toolkit-v4';

warn('carousel.no-slides', 'A Carousel with no slide does nothing.', { component: 'Carousel' });
```

## Import it on its own

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e00060f2faaa859f4f98b59ec41dcfa790157c713d9b099a2de73b0e783468ab","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAEQCSAQQDiAOQDyAZQAqEgMJLEvAEoxmUIawwAeYAB0wva71L7DYY72Zo0pdgCMArjW16DRqYWVjahdgGOGLxeYADWkADuYACKXmzsAGbsZNrmIC5unj4wAHQx8RBJALQAjmkcWWR5ANyWoQC+AHytIdbhDk78bKwezPyxfvaBZm2hNv2BvHDsAOZgbABizOysMFC5IEOsI2OxJctrbFUZ27tQLbNztlORAkI09EpeHnD87lhodhCLY7PYHI4ncYlQRgD5oKpwb6/f6AoTXW57B69OYLV4wuEqfSkQxJEF3cHDUZQ/F0eE0ZjEypgdGg+4gHpPPovJwFdzeGgAdRc/HwZDJYN4eQhVLOvKKNCqCWFotILLuWM5zwiTjgZCI7H4MHF+0lh0pp3OeoNMDVmPZjxx3Kiv1FUC8u1IKgNsWNFOOMvOIr27rIVUB41tbI5nNxOqDbruKi4PoxJql5qhLuDdzDycjGpjTt4hgAtgBVLBQFwwHQxMBi1N+yFnUtVLyV6tVUh10M3VkFp6xqK0mBgKseXYAURIsMn9FHy2BjdN0otI7HzAnNpgM/h68XzL76vt2K60esJUvvAAjNfeCWIHZeJeSuetQNnUqsJNtUEHWEi11VgMgkNZHwlPI4C/S1gKqVZIDsKMHTPSwuksdgSywR9REkWRFFUDQlEoEBDH4BBEBAJQ0E3XY3lgOABAZdw9l4DwojQCAIFYWJ2FEKBODAkQDTgEpiJEBkGEQABOKhdjAFY0HwJBbyoajSBWGBJJAXD5GUNRNGIjh6yQAAGKgRQZMYaHIaT2gAXXM6BcAojCsNIURgHEaRdIIzReHaXgMlICAS14AByAABEQvH4kLNOYAB6AArOAw047jeKqIgABYEp0/D9KUMLmmIkt4qQUB9yBMA8BSkB2naIA=="}
import { DIAGNOSTICS } from '@studiometa/js-toolkit-v4/DIAGNOSTICS';
```
