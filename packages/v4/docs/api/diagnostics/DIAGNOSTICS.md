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
// @twoslash-cache: {"v":1,"hash":"6cd65535de6fd698ddfd7bac583d2a7f0500b54bfe253c1d4ea58b1171f7315f","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7NSYRiOgxEvACoQIrANbs0AEU4BzSHHEiAwsoq8AtvDjMjK3mdLswRm8F5LbWSRgwNBs0OWc0XgBfAH5VQydTcytgujRuVQtBMwhbAFESYIAeDS1dA2Mk9hF9GDD2VgA+AB0wdn8IUkjZeUoQKAgRBEQQACUYAK7eZhk5Ns9eSV40fBheKEqIM2rffGYwMBhWADpW1oBBX1yAw+DeUgnOtDhl/FIIQSN8XlbgAAEOGBtD8wAAhLgwY4AEh6UlaUVaNmk+Gq334DVYLw8vD0Lwg0ikYGY9la+ygvCOMHswWO6hRWJeKzW/E6tgEnSusBkem+kBxYDM+xEazQEHujymXF4gBQCaatWzQQSsGAAWmVJFYvFWrBwpBsHJmIlYXBeyNROJekEiMwABuC4DAbcc+mEjMNkMgQIDtH18Gg0Fg4IgAPTBgBWcBVorKehVRAALMczIINrk6sxjrAiMHmFh2MGNoktuY4MHYcc/bZWCAALo1qiCrpIACcVGVnhWSHjVDCpAieFhfUBuEQAAYqCI9qRmGIyC2ohR0NgRwRiHOe2kmGxODxZvJFMpVKUdHoEiZi9UrLAbPY4I5nKo3B4vLwfH4bkEQstwnVonFeGeVSWJIND0BkvBZDk+SFGgJSaCeFRFtsNTpg0LRtB0UyDlQAxDHg4yTNae7zEYixSEy6ybMhuz7IcJxnGAlzvoEdwPIRjJvB8Xwgv83ogvakIwnMIIImASIopOAgYliUi4osBK8ESJJEmA5KUtSaC0mo9IWq8zKsuypCcms0g8opYoeIKogimKbFPNMLyysw8qKsqaowBqWpHLq+pGYaxp3jIEnfOwloQERdoQk6LpOO6nrer6/qBiG4aRtGCFxomyapvYYSZh5OZ5gWVElmWcwVmgVa1vWICNgwiAAKwAIxtkERidog3bUD+9UgNhXoeCOABME5TjONDkGOC5LjgeCECQ5AbvQTBYO8uqYHwgEXsBqT0MczG3Gg/5PgsAA+vDCLA6KHFAfR1UgTVDSNXptR1rbdX2dR4Adn5DoNSDPZOcjjXOiAAOxNVENVKLAeDtIRr7EdEAjvGyADkfzZRIuXMKlUbweUmVowA3AxsKMGjIhyB8DonJAKpwBwsBwGjNho5cFjU9kRzcis5muEzawDPA5krM+xys4jP3BKoaOc+83OsGj0TcMTfQ40goBpEEcASGAeDPCAURREAA==="}
import { warn } from '@studiometa/js-toolkit-v4';

warn('carousel.no-slides', 'A Carousel with no slide does nothing.', { component: 'Carousel' });
```

## Import it on its own

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e00060f2faaa859f4f98b59ec41dcfa790157c713d9b099a2de73b0e783468ab","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpeAEQCSAQQDiAOQDyAZQAqEgMJLEvAEoxmUIawwAeYAB0wva71L7DYY72Zo0pdgCMArjW16DRqYWVjahdgGOGLxeYADWkADuYACKXmzsAGbsZNrmIC5unj4wAHQx8RBJALQAjmkcWWR5ANyWoQC+AHytIdbhDk78bKwezPyxfvaBZm2hNv2BvHDsAOZgbABizOysMFC5IEOsI2OxJctrbFUZ27tQLbNztlORAkI09EpeHnD87lhodhCLY7PYHI4ncYlQRgD5oKpwb6/f6AoTXW57B69OYLV4wuEqfSkQxJEF3cHDUZQ/F0eE0ZjEypgdGg+4gHpPPovJwFdzeGgAdRc/HwZDJYN4eQhVLOvKKNCqCWFotILLuWM5zwiTjgZCI7H4MHF+0lh0pp3OeoNMDVmPZjxx3Kiv1FUC8u1IKgNsWNFOOMvOIr27rIVUB41tbI5nNxOqDbruKi4PoxJql5qhLuDdzDycjGpjTt4hgAtgBVLBQFwwHQxMBi1N+yFnUtVLyV6tVUh10M3VkFp6xqK0mBgKseXYAURIsMn9FHy2BjdN0otI7HzAnNpgM/h68XzL76vt2K60esJUvvAAjNfeCWIHZeJeSuetQNnUqsJNtUEHWEi11VgMgkNZHwlPI4C/S1gKqVZIDsKMHTPSwuksdgSywR9REkWRFFUDQlEoEBDH4BBEBAJQ0E3XY3lgOABAZdw9l4DwojQCAIFYWJ2FEKBODAkQDTgEpiOolZyOQZAQA4OJiPwVwsDgRAAHoVIAKzgMNOO43iqiIAAWc40C8fiIBLGBqJKWAiBU5gsHYFT+OYQTwzgFTcPkZQ1E0EoFJLVgQAAXSCqgRAZBhEAATioXYwBWNB8CQW8qGo0gVksvBPPwnyiNi9h6yQAAGKgRQZMYaHIaL2lCw5oFwCiMKw0hRGAcRpC8gjNF4dpeAyUhzN4AByAABERTKBCzqI0rSOK4nj4UMjyOpywihuaYipuYJBQH3IEwDwTSQHadogA==="}
import { DIAGNOSTICS } from '@studiometa/js-toolkit-v4/DIAGNOSTICS';
```
