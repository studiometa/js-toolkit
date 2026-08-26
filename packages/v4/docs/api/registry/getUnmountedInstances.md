# getUnmountedInstances

```ts
getUnmountedInstances<T extends Base = Base>(name: string, root?: ParentNode): T[]
getUnmountedInstances<T extends Base = Base>(el: Element): T[]
```

The instances of a component name that **were built and are not mounted**, in DOM order — or the same on one element, in mount order.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"cf6b9a03cde5e06dd68ccee18d61149b7c7908594563fcb8375c1100ad0a4500","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAOYw0AVTABbCMJpQAkmDhpmo+AB4AKrzo0wUOLwBCXGLwC8NuwdtwYABVIQscAHx+jGDMSjCIvDqk7GDSFLzeEGgA/OEezKQwYGgActAw3OFGyAC6vIwA1ACMvMRkrBDMUNwAOmDsSlgQpGgycooqajCa2rr6CFRQECIIiCBG+PbROnoi8DX8vMy8IhAdkpk9waG8aPjMPQDuZPYARoLsrD16UJsZvJA9A1lDcdGtACIAeQAsjVSLBSAA6VqtebsKydLCCVjnCRSeERJRsVibCwRHAidj8dgiSG8DQ9DEXM5PXgAKjpGRIpDg7BurBgDN4XzQrUi5xg0gwvA5zBIVhuMHw0Sg4QABtEALREdgwC5y3EvOWhKCcRAa4Q8k4LdikXhLUarXjUzKtU72HYWdjiSQRNA+KyEVi6mKa3gAaxgMCw5p6/C6xod3jgrN9N2YIn9cTgEEjrQtK3sywwVmikdMHNCWQA5FYsSGLs78Lw5QASeHA1TfF4OVsCNjuOVkgCCrUdkUEYgjp3OEUHqyGQ14kvDby2/GYD2i0hrPKGjG4GpRFk91xOEAg0LArQA6jTzVY6R86bwFhlwltYCIUaRUa7qRB3NsUTH3jBma8UQkFAcTPJsrRPi+b5SJWpxQK+FxSDcwpbDcGTMP6nTRGgZLZDAVZkLeXC4uaIyZpsTysKwR6tAAyjsWDLn69q8LAugiAsUCKjAhYHNOHB4nAnRPG8rTAAAAgJ/q8K0shoFoyxjK0AC+rTFpClAgMs3RIAAnFQHIxKcSAAEyVFQuikHJeByf0TbqAplrwJpAm4IgAAMVAcekCY0OQiC6cpFDoNgbkELU5AWWYTBsJwPC9Aoyj2UMjmZnArguG4njeL4ARBCEYRulEMRxAkySpOkBy5LABTOO4GXuF4Hp+CUZRVDUzL1I0LRtHs3QJXZgzDIpqzjCAkzTHg8yLGRYzrJs2y7J0YB8Uc9gjpce53A8Tx4pV7yJNyyUgaRAIgmCEI0WAcIIj4yLQRemLYn6QkwISxKkuSlJWNSo5bAyTJkKy7KcjePJ8mgr40EKIowGKayStKFjykqKpqhqYHakMeoGklaiRqapEjfYNrHlkCyLU6LpSDoHq3hA3pMWBgbBqGAjDhTIjRrGK7xomyapva6azVa2a5lILE8TARZoKW3LMBWVY1vWcCNkNjhtgurCdj2faSAOQ5mhtY4iBOsAvDOXT2POi4CSu2rHRuW7PLubzuoeMJgGeo4YleiQ3nehWPm9UHU9ahBfs+XBWCtAHpEBPx+swEEhz5Yewfg8HMIh04odO6GYRA2G4fh9pmmcVh6ETTkUZsVFXfRPhM3iLFsQmnHcbxWT8TK+KHftYmSdE0myXIqVKWAqlgOpmnaQwiAAGwABwGZk0jGYgZkWek1mzLZePNuPo0udEbkmV5ZyvmIZBIO5QUhTgeCEMymk0PQTBYDlZCYHw3akK+GAGowCAU1XKfhISGXXvgcIYBBBKElJFcaUwZggAAOJyCsBGdwaArAsUgaceaLF47MAwGSG6j0tiwPgYRfYt52DSDvMaKuLFpQMPgJSCwdBSL5mIaQ2ell566X0iAfB+AkAL23lZOQeBREnxWqZC+Plr7+QAMyVGUsULyeQ8DtE6P1YAA0D4ORFmsZSAhvBKF4MWcSOhBC6l2HIZgAB6AAVnARU7tWD+mdMqAALMWAA3J7fea5hpOTgIwYsAA1dgsAIDFm4BAtepwAmaVCLoJAoAzCZFZJIPAbiQDKWUkAA="}
import { getUnmountedInstances } from '@studiometa/js-toolkit-v4';

getUnmountedInstances('Video').length;
```

## What this population is

It is small and specific. It is what a **reversible** mount strategy leaves behind: `in-view` and `media:` unmount their instance when the condition stops holding and keep it for the crossing back, so the instance stays in the element's map with `$isMounted === false`.

A constructor that succeeded before a failing `mounted()` lands here too.

## What is _not_ here

- **A declaration whose class never arrived.** A lazy entry that has not loaded has no instance at all.
- **A declaration withdrawn by a breakpoint.** That instance is unmounted _and deleted_ from the map, so the name later declared again builds a new one.
- **A component still waiting on a mount strategy.** It has never been constructed.

Neither has an instance, so neither can be in a list of them.

## The two overloads

```ts
(name: string, root?: ParentNode): T[]
(el: Element): T[]
```

- **The name form** searches the descendants of `root`, which defaults to the document. `root` is a `ParentNode` and the call is `querySelectorAll`, so it never matches `root` itself.
- **The element form** reads the element's instance map directly and never consults the DOM, so it answers for a **detached** element as readily as for a connected one. The name form cannot: `document.querySelectorAll()` does not see a detached element. Pass the detached root as `root` when a name lookup has to reach inside it.

## How the narrowing works

`selectorFor(name)` over-matches on purpose — it lists the responsive spellings of `data-component` too — and **the instance-map read is what removes an inactive declaration**, because a breakpoint-withdrawn component is destroyed _and_ deleted from the map.

A matching element with no instance is skipped, and that is the whole narrowing. There is no mount filter, because it never did that work.
