# provideRootContext

```ts
provideRootContext<T>(key: ContextKey<T>, create: () => T): T
```

Provides a value on `document.documentElement`, making the page-wide case the **outermost scope of the same mechanism**.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"afeb817719aa7e3f9bc37167826440c48c8be5fb1417e0cbc247abbb548cfb98","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAkfwEMwwYANnETsAstywAeXhgrsZAPkog23Ug0QA2ABxUBMMAHM0+JLuprDMDSC69+Q5QICW/JAEYqd0t0Y1yWgC+FOjYuIgExGTKNPR4ABTcLtxwAJTsrgBWMH4AwiyxaADKGGCMkuJSbKSuhnIArmAA1pAA7mAKCvGCIgCi+gC2BmhyTTAYIvlghQDS4xUSktW1Dc1tHQqpIpVLaDVGqy0Q7QrsAD7sjbAAZq4wUAA6YM4DWBDqGWDZeQV0xaWMZRQCCMBARABK8AgAhI7BMMHY/DU8A4WFIxGcsCg7CISXqCLgAPw6Mg9TgAlk7He7FI1nqpDA7AABlcYLd+FAmQA6GLcQxg5DIEAuZrKfBoNBYYQAemlmTgAFo0BBoU1nGgFUQACxctj1KDOCBDNDcLmwIjSiTOaXMaZ/aVZHJoKaFEplLnigYCEAAXR9VFU6jMnmFBmMpkQ7gA7FQTaQrDZHT87fQ3YC9HckAAmLw8Hx+aKILPBUI4PCEEjkWN/JgsNjsHrsAASABVRAAZfowIbTZSBjQATgHejDJmzscs1jwgicmaLubUvn82YADCXqGFy1Eq9QaxFbfWACLcE25Hh8QTCdguv5zDALKp7FaXNbHDZ9uMadwrgDMI6MY6RjmFjxlOETHqe54OAgGZuPOth5kuhZZlq66YGWEQVtE1ZxBEiTJGk7BohisDgiqzq/PQD7SGAlKKF0YwTNelFoHe1EyHI9FyIwtInjAIjxOkAC8pw7Bx8i0Zs2yLOJihPC8bwfMRRCYjAZEQBRKYMFQwKgngAAK6IqbA8jsLp9Q9hqrSqTieIIjxMB8diLCMAiOCkOwjFcuwAByjm0h5ymqaQcBUpWNQmeqXJPE86mokZwWhciRF8jACouNc1gvAivDYow9gaewABGCIGnAbxwPcPITvySCCsKrhNGKEpSogsrykqKoCGqGrarqaD6oaxqmualpYNatqFNKQWkeRN70B6aBer6/oqJ+HhZiu/7hh45hxgmeAzWpc0sbOcHAd4SEBFq7hoZumHbjEe62HWHAQdwZ72JekwsWxOzLAcL5HCcSgButkY/sOoYARG7jAftYEgO9n0Xo4sHhBdiEFgEmhriEG4YZElZPbhIC4h5lTSVgUzVPUfjvE8/CtOwgnsCJYgybRnGSSzADUP5hWQAgQNwUBpB+ahfpof7QztiAywjNiVGdGMLvmy6INoqGrcwsB4LK7BFMwODOYFqUKtZsByLScDQiQ2LwuwcDcEM7CtNwlJIjbHC3CFaDRWUr2cFBl5s087CfN8mmugC3QCHIyMh0I6QAPwp0RCWzRp81oPEidfUIcis+zTMc1ggmpAA3Mow1IKAfwGHAhpgHgaAIIEgRAA="}
import { createContext, injectContextSync, provideRootContext } from '@studiometa/js-toolkit-v4';

const DataChannels = createContext<Map<string, unknown>>('channels');
const el = document.body;
// ---cut---
// Scoped or page-wide, resolved the same way, nearest first.
const channels =
  injectContextSync(el, DataChannels) ?? provideRootContext(DataChannels, () => new Map());
```

**Parameters**

- `key` — a [`ContextKey`](./createContext.html).
- `create` — a factory, run **at most once per key**.

**Return value**

- `T` — the value, created or already there.

## Why it is the same mechanism

Because the value sits on `document.documentElement`, a request from anywhere reaches it by bubbling, and **a nearer provider still wins** through `stopPropagation`. There is no separate global registry and no second lookup path.

## Lazy, and once

`create` runs at most once per key, and **nothing is created at import time**. A page that never asks for a key never builds its value.

## It cannot be disposed

A root provider outlives the instance that asked for it first, because it is page state. That is the point: the first component to need a page-wide channel should not own its lifetime.

This is what replaces `withGroup`, which is not ported. For a scoped set of peers, use [`createGroup()`](./createGroup.html) with an ordinary [`provideContext()`](./provideContext.html).
