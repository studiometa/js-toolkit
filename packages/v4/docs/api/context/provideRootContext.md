# provideRootContext

```ts
provideRootContext<T>(key: ContextKey<T>, create: () => T): T
```

Provides a value on `document.documentElement`, making the page-wide case the **outermost scope of the same mechanism**.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"afeb817719aa7e3f9bc37167826440c48c8be5fb1417e0cbc247abbb548cfb98","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAkfwEMwwYANnETsAstywAeXhgrsZAPkog23Ug0QA2ABxUBMMAHM0+JLuprDMDSC69+Q5QICW/JAEYqd0t0Y1yWgC+FOjYuIgExGTKNPR4ABTcLtxwAJTsrgBWMH4AwiyxaADKGGCMkuJSbKSuhnIArmAA1pAA7mAKCvGCIgCi+gC2BmhyTTAYIvlghQDS4xUSktW1Dc1tHQqpIpVLaDVGqy0Q7QrsAD7sjbAAZq4wUAA6YM4DWBDqGWDZeQV0xaWMZRQCCMBARABK8AgAhI7BMMHY/DU8A4WFIxGcsCg7CISXqCLgAPw6Mg9TgAlk7He7FI1nqpDA7AABlcYLd+FAmQA6ZSqdRmTwgfRGEweADsVDQlmseCyOTQU0KJTKTjuSAATF4eD4/NFEOrgqEcHhCCRyJK/kwWGx2D12AAJAAqogAMv0YENprypfzEABOP16AzGUz6yXSmyCVVuMO2bW+fwagAMhuoYRNUXN1EtEWYrA4ABFuFLcjw+IJhOxFX85hgFlU9itLmtjhtvWoNO4kwBmIMi0PuTUWUhWGxFktlhwIPRq2PeBN69UAFlTmGNEVN0QtcQiiWSaXYaIxsHBEAgCt+9Hr0jAlMUXTGEyrl7QtevMjk97kjFpxZgInidIAF5Th2D95FvTZtkWcDFCeF43g+I8iExGBT3Pas4ioYFQTwAAFdEUNgeR2Bw+pPTQABaVpUJxPEER/GA/2xFhGARHBSHYR8uXYAA5JjaU45DUNIOAqTNGpiOcNAuSeJ50NRQiRLE5FD24KxKJca5rBeBFeGxRh7HPdgACMESgZw4DeOB7h5Kg+U7dUkz7EMPHMH1RzwYSTzPC9pktGcYyHeddQCJd3FXdMN0zGIc1sa1C2LbhS3sCtJhfN8dmWA5myOE4lHsn1O27QMhWDUVEEHcMRxlCJx2SycK2jcJgvjUKkE0FMQjTddIjNWKdxAXFOMqaCsCmap6j8d4nn4Vp2EA9gQLEGDb0/SCFoAam7cSyAECBuCgNJ219dxNF7Mr+yQC6PNqkBKmajUtTUBcAm0FcAF0vGgcIQAAej+9gimYHAWKE9SYGo1C5FpOBoRIbF4XYOBuCGdhWm4SkkVhjhblEmSnjzG07HLIQlqedhPm+PylQBboBDkeqUtJg8AH5WcPJSfIwl94iZxqhDkRblrmlasEA1IAG5lCGKUkFAP4DDgZwWDwNAEECQIgA"}
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
