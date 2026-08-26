# getUnmountedInstances

```ts
getUnmountedInstances<T extends Base = Base>(name: string, root?: ParentNode): T[]
getUnmountedInstances<T extends Base = Base>(el: Element): T[]
```

The instances of a component name that **were built and are not mounted**, in DOM order — or the same on one element, in mount order.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"cf6b9a03cde5e06dd68ccee18d61149b7c7908594563fcb8375c1100ad0a4500","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAOYw0AVTABbCMJpQAkmDhpmo+AB4AKrzo0wUOLwBCXGLwC8NuwdtwYABVIQscAHx+jGDMSjCIvDqk7GDSFLzeEGgA/OEezKQwYGgActAw3OFGyAC6vIwA1ACMvMRkrBDMUNwAOmDsSlgQpGgycooqajCa2rr6CFRQECIIiCBG+PbROnoi8DX8vMy8IhAdkpk9waG8aPjMPQDuZPYARoLsrD16UJsZvJA9A1lDcdGtACIAeQAsjVSLBSAA6VqtebsKydLCCVjnCRSeERJRsVibCwRHAidj8dgiSG8DQ9DEXM5PXgAKjpGRIpDg7BurBgDN4XzQrUi5xg0gwvA5zBIVhuMHw0Sg4QABtEALREdgwC5y3EvOWhKCcRAa4Q8k4LdikXhLUarXjUzKtU72HYWdjiSQRNA+KyEVi6mKa3gAaxgMCw5p6/C6xod3jgrN9N2YIn9cTgEEjrQtK3sywwVmikdMHNCWQA5FYsSGLs78Lw5QASeHA1TfF4OVsCNjuOVkgCCrUdkUEYgjp3OEUHqyGQ14kvDby2/GYD2i0hrPKGjG4GpRFk91xOEAg0LArQA6jTzVY6R86bwFhlwltYCIUaRUa7qRB3NsUTH3jBma8UQkFAcTPJsrRPi+b5SJWpxQK+FxSDcwpbDcGTMP6nTRGgZLZDAVZkLeXC4uaIyZpsTysKwR6tAAyjsWDLn69q8LAugiAsUCKjAhYHNOHB4nAnRPG8rTAAAAgJ/q8K0shoFoyxjK0AC+rTFpClDUMw0gzMgyAgFJmn4GgaC+IgAD05kAFZwIq7oQKw/rOsqAAskI6IIuq7HIzCQrARDmcwjHmRk0jwmgpAYOZcn9E26gKZa8CQsZSisCAxTFFQyzdEgACcVAcjEpxIAATJUVC6KQcl4DFyhxUMCWZuMBnRLgiAAAxUBx6QJjQ5CILlykUOg2BtQQtTkBVZhMGwnA8L0Ch1YMwyKascCuC4bieN4vgBEEIRhG6UQxHECTJKk6QHLksAFM47gbe4Xgen4JRlFUNTMvUjQtG0ezdAtsXLY1YyaZM0x4PMixkWM6ybNsuydGAfFHPYI6XHudwPE8eKXe8iTcvVIGkQCIJghCNFgHCCI+Mi0EXpi2J+kJMCEsSpLkpSVjUqOWwMkyZCsuynI3jyfIRQKQoijAYprJK0oWPKSoqmqGpgdqQx6gaS1ZJGpqkat9g2seWQLPDToulIOgereDk+iuYGBsGoYCMOpsiNGsYrvGibJqm9rptDVrZrmUgsTxMBFmgpbckF1pVjW9ZwI2y2OG2C6sJ2PZ9pIA5DmaaNjiIE6wC8M5dPY86LgJK7aoTG5bs8u5vPZFNnqOGJXokN53odj4s1BFvWoQX7PlwVhIwB6RAT8frMBB/c9YPsH4PBzCIdOKHTuhmEQNhuH4faZpnFYej64lFGbFRFP0T4TFgSxbEJpx3G8Tr7Iyvi+O42JknRNJslyGBmtFSakNIVW0rpfShkqDGVMnACy1lbL2Ucs5IgbkPJeVCLoPy/5ArBVCuFSK0U+ja3ioHJKKU0oZSypVBgiAABsAAOAqmRpDFUQGVcBVU5A1RIWuFaiVmoCTaiVLqZxXxiDIEgdqQ0Ro4DwIQZkmkaD0CYFgHaZBMB8G7KQV8GAHowAMU9XafhISFTYfgcIYBBBKElJNEAYMZggAAOJyCsBGdwaArAsXMacWGLEp7MAwGSKm9MtjWNsYRfYt52DSDvMaU+LFpRxPgJSCwdBSL5kCcEzS2U6G5XygZVh7D6FcOqrMXx+BNLCNKmInqkj+oAGZKjKUyiAHYsA8DtE6P9YAANSENXIVYZSAhvBKF4MWcSGCJBYOYIguyB4UFoFcsWAA3DCGIfDCZAPgIwYsAA1dgsAIDFm4GY4p+BVmaVmUgUAZhMiskkHgGyIBlLKSAA==="}
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
