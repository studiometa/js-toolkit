# DIAGNOSTICS

A deeply frozen object of every code the framework reports. `ToolkitDiagnosticCode` is the exact union of its strings, plus any `'<namespace>.<name>'` a consumer reports.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"f6bdafcc7f68b124f42336176ee1d936ab41547ae21eda5004abe2086d90dc66","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAEQCSAQQDiAOQDyAZQAqEgMJLEvAEoxmUIawwAeYAB0wva71L7DYY72Zo0pdgCMArjW16DRqYWVjahdgGOGLxeYADWkADuYACKXmzsAGbsZNrmIC5unj4wAHQx8RBJALQAjmkcWWR5ANyWoQC+AHytIdbhDk78bKwezPyxfvaBZm2hNv2BvHDsAOZgbABizOysMFC5IEOsI2OxJctrbFUZ27tQLbNztlORAkI09EpeHnD87lhodhCLY7PYHI4ncYlQRgD5oKpwb6/f6AoTXW57B69OYLV4wuEqfSkQxJEF3cHDUZQ/F0eE0ZjEypgdGg+4gHpPPovJwFdzeGgAdRc/HwZDJYN4eQhVLOvKKNCqCWFotILLuWM5zwiTjgZCI7H4MHF+0lh0pp3OeoNMDVmPZjxx3Kiv1FUC8u1IKgNsWNFOOMvOIr27rIVUB41tbI5nNxOqDbruKi4PoxJql5qhLuDdzDycjGpjTt4hgAtgBVLBQFwwHQxMBi1N+yFnUtVLyV6tVUh10M3VkFp6xqK0mBgKseXYAURIsMn9FHy2BjdN0otI7HzAnNpgM/h68XzL76vt2K60esJUvvAAjNfeCWIHZeJeSuetQNnUqsJNtUEHWEi11VgMgkNZHwlPI4C/S1gKqVZIDsKMHTPSwuksdgSywR9REkWRFFUDQlEoEBDH4BBEBAJQ0E3XY3lgOABAZdw9l4DwojQCAIFYWJ2FEKBODAkQDTgEpiOolZyOQZAQA4OJiPwVwsDgRAAHoVIAKzgMNOO43iqiIAAWc40C8fiIBLGBqJKWAiBU5gsHYFT+OYQTwzgFTcPkZQ1E0EoFJLVgQAAXSCqgRAZBhEAATioXYwBWNB8CQW8qGo0gVksvBPPwnyiNi9h6yQAAGKgRQZMYaHIaL2godBsFwCjCBIchUtpJh0i4PgYREcRpC8gjNB/D8ZmxIdnFcPliiG6Zgk1MbykSFJ6kybJSAOOV+VKBamVqZbGlIAdeBQ0ai1XcZpsiEa5sA+DNmXdN/QtC51lYfMT2u383lhWkvh+P52ABIEwF9FcMzOGl6ARJF/sBtEjztN8AM+iG0EJBkSWB+6zUe6l3lpMMiQxt7EfmIsNuKIU0CDUgQYe5sSnJhUlSplVif/UnPt1Uh9UNWnsfprmeZteGkOxJGPyWeMQ09b0+bOs4swTUNw1iNmxY5iXFZDKAkzgFNWSbAMtZzai9bVj6JdLCsqxoWswHrGmsfl6zzLbDsFW7e3e1TQ7xcWddxynXc5xoYQgblsGSgDmjt13Kp9yB82bGO0IXxvO8HyfF83zGqD7Iu4wrsLTmYGA0CEIgkA86wGCMjgsDEMO460LADCsNIHC+pywjiNI8jKOorc6PgRjSGYqBWPYnSeL4gTICEsjRNSlzJOk2TYnkxTlLUzTtK4mf9KMkRTKBCyrJsuyHKcueIAX9zsu8wi/LQALgtCqu0sigBWL/YtHBKkqIBStQBkGVIogAfgNPKMkCoNQAEylXwOVfglVio1TqjgPATUyBiTahRRgWBSAQBwB3DAXVzJYXrLCAuf4TqfVYBAAwcsKFCFHGgEoDCDBJy5J9B8MQ0DMMwqw2EJQ+Gwm4e+RYDQYD8AwPwXYgjKFsI4ZkGRcjdgSLGgVIg6QoAAFkID8KoqQasKwMDghYVQ9h2jdFVDEfCEQJiaBmMOlosAOiOBQC2CWHYGAxAyNYOVVEYALFCKsSUGxnj0Q+OMFUWA8iglA1cadIQWQVjqFSRwFBoSlEiJhGkqo+SsloCxF0Yi4UO5IAAGwAHY/7xUSkgGKID0qZQooIMJbDiKyXgYg5BqCgFwPQdQeqWDiA4NavQJghDiFkEwHwThXinaWOUYst65TP5IBqXUmS/9GlAJKi0sBeBFnGm6bApACDDhIJMSgnBiA4FDNqiMzBjVxktWoHgkALAOCdS+j1SBuUaFFx4RLRmMBgWzWLhLbaSRUjpH2utCa8otpxEWrtBFq0m7dAdGNeWkL2agsWM9O6BtQY4wVrdV6ItfYa0WCjX6yIAbBIjhS6EeNIaIj+iiRONL3rQvpRy1GhMmSsvpijAm6Mdp8pJkS144LKbUzFQGcFiplTe37PywcgErS8ydpHQW1oJF+1eMbMgXpxjKqelLD0YZvTGrpaam1exdb63JOSgWzqoC5jNjKwlkjXhW3djWHsjsyV0wDK2dsNsbSewdg6uVTho5bmnGwkOC5w76rZcmjRO42Hx3nGHOGPstVHRxdiNOt57zgWfJeHOgEvwEvVom50pcQIN0rtXWu9cK6iw6OWlubdsK9Two/TQvcIBkTwFRGOw8GJDDHtkCebFeAcX3rxYsN875LxARJJAUkYFySoApNASlVIaS0mu3S8JDLGRPuZSyzBrI7kvo5ZyrlhIeS7mOpQz9X4hTCpsoB14qn1IAcla8y9WngMBT3fKhVEAAGY+m3IGUVYZmBXkEHebgqZ+CZkkPmc8OAlDlgkCbSapwsKwAACFwixCwgVNABw7AkaEGR1FFRqgeHo4x2EpTOgbIislOBAAOMD+zryHLSsciirHSPsBIOchDyHrn9PudeJ5GCGrYearh8BBCiGEbIdENFTI6P6AYxAJjLH4AKZIGUMz3HePWf4yAITlSgGIeaXFcDQCdkybaSAajFnmBWaY8phqqmyqofuXAxD7R36CFgHgIdHdeDABHf1XKR1eAZCISWXgAByAAAsfMyZ9mAXr3teorPRLCwd8h03J7DTmpmaLwNSxXmvCNa4w71IsisNe/VAko8n2OKc44tUL4XYQda60V8bYcHPUaqDxyzfG0BFeIpVpAoAE5CDwJpEA7R2hAA==="}
import { DIAGNOSTICS } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"5b9909455a258764deebb8bdb6f35c00a6ee7bef4f2895b5c823016368563ce4","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7NSYRiOgxEvACoQIrANbs0AEU4BzSHHEiAwsoq8AtvDjMjK3mdLswRm8F5LbWSRgwNBs0OWc0XgBfAH5VQydTcytgujRuVQtBMwhbAFESYIAeDS1dA2Mk9hF9GDD2VgA+AB0wdn8IUkjZeUoQKAgRBEQQACUYAK7eZhk5Ns9eSV40fBheKEqIM2rffGYwMBhWADpW1oBBX1yAw+DeUgnOtDhl/FIIQSN8XlbgAAEOGBtD8wAAhLgwY4AEh6UlaUVaNmk+Gq334DVYLw8vD0Lwg0ikYGY9la+ygvCOMHswWO6hRWJeKzW/E6tgEnSusBkem+kBxYDM+xEazQEHujymXF4gBQCaatWzQQSsGAAWmVJFYvFWrBwpBsHJmIlYXBeyNROJekEiMwABuC4DAbcc+mEjMNkMgQIDtH18Gg0Fg4IgAPTBgBWcBVorKehVRAALMczIINrk6sxjrAiMHmFh2MGNoktuY4MHYcc/bZWCAALo1qiCrpIACcVGVnhWSHjVDCpAieFhfUBuEQAAYqCI9qRmGIyC2ohR0NgRwRiHOe2kmGxODxZvJFMpVKUdHoEiZi9UrLAbPY4I5nKo3B4vLwfH4bkEQstwnVonFeGeVSWJIND0BkvBZDk+SFGgJSaCeFRFtsNTpg0LRtB0UyDlQAxDHg4yTNae7zEYixSEy6ybMhuz7IcJxnGAlzvoEdwPIRjJvB8Xwgv83ogvakIwnMIIImASIopOAgYliUi4osBK8ESJJEmA5KUtSaC0mo9IWq8zKsuypCcms0g8opYoeIKogimKbFPNMLyysw8qKsqaowBqWpHLq+pGYaxp3jIEnfOwloQERdoQk6LpOO6nrer6/qBiG4aRtGCFxomyapvYYSZh5OZ5gWVElmWcwVmgVa1vWICNgwiDxgAHG2QRGJ2DU9j+9UgNhXoeCOABME5TjONDkGOC5LjgeCECQ5AbvQTBYO8uqYHwgEXsBqT0MczG3Gg/5PgsAA+vDCLA6KHFAfR1UgACMd2tl6rXtU9vb9iMe2fkO/VIENICTnIo1zogADsd1RDVSiwHg7SEa+xHRAI7xsgA5H82USLlzCpVG8HlKjADcDGwowqMiHIHwOickAqnAHCwHAqM2KjlwWJT2RHNyKzma4DNrAM8DmSsz7HMzCNfcEqio+z7yc6wqPRNwhN9NjSCgGkQRwBIYB4M8IBRFEQA==="}
import { warn } from '@studiometa/js-toolkit';

warn('carousel.no-slides', 'A Carousel with no slide does nothing.', { component: 'Carousel' });
```

## Import it on its own

```js twoslash
// @twoslash-cache: {"v":1,"hash":"f5a4716e9c9971d9f8015a4e726273b2b1ad845865ec597d9677cfa4fa2cd09c","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAEQCSAQQDiAOQDyAZQAqEgMJLEvAEoxmUIawwAeYAB0wva71L7DYY72Zo0pdgCMArjW16DRqYWVjahdgGOGLxeYADWkADuYACKXmzsAGbsZNrmIC5unj4wAHQx8RBJALQAjmkcWWR5ANyWoQC+AHytIdbhDk78bKwezPyxfvaBZm2hNv2BvHDsAOZgbABizOysMFC5IEOsI2OxJctrbFUZ27tQLbNztlORAkI09EpeHnD87lhodhCLY7PYHI4ncYlQRgD5oKpwb6/f6AoTXW57B69OYLV4wuEqfSkQxJEF3cHDUZQ/F0eE0ZjEypgdGg+4gHpPPovJwFdzeGgAdRc/HwZDJYN4eQhVLOvKKNCqCWFotILLuWM5zwiTjgZCI7H4MHF+0lh0pp3OeoNMDVmPZjxx3Kiv1FUC8u1IKgNsWNFOOMvOIr27rIVUB41tbI5nNxOqDbruKi4PoxJql5qhLuDdzDycjGpjTt4hgAtgBVLBQFwwHQxMBi1N+yFnUtVLyV6tVUh10M3VkFp6xqK0mBgKseXYAURIsMn9FHy2BjdN0otI7HzAnNpgM/h68XzL76vt2K60esJUvvAAjNfeCWIHZeJeSuetQNnUqsJNtUEHWEi11VgMgkNZHwlPI4C/S1gKqVZIDsKMHTPSwuksdgSywR9REkWRFFUDQlEoEBDH4BBEBAJQ0E3XY3lgOABAZdw9l4DwojQCAIFYWJ2FEKBODAkQDTgEpiOolZyOQZAQA4OJiPwVwsDgRAAHoVIAKzgMNOO43iqiIAAWc40C8fiIBLGBqJKWAiBU5gsHYFT+OYQTwzgFTcPkZQ1E0EoFJLVgQAAXSCqgRAZBhEAATioXYwBWNB8CQW8qGo0gVksvBPPwnyiNi9h6yQAAGKgRQZMYaHIaL2lCw5oFwCiMKw0hRGAcRpC8gjNF4dpeAyUhzN4AByAABERTKBCzqI0rSOK4ni0A8jqcsIobmmIqbmCQUB9yBMA8E0kB2naIA="}
import { DIAGNOSTICS } from '@studiometa/js-toolkit/DIAGNOSTICS';
```
