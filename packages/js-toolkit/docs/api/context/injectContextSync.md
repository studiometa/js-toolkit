# injectContextSync

```ts
injectContextSync<T>(el: Element, key: ContextKey<T>): T | undefined
```

The nearest provided value, synchronously, or `undefined`.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"536e365f9bbcb203269555f2644ff79573d7f4cd78619db18910525760b65bdd","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAiIEMAbAVxiJ2YPgFsARmXYAfdnzCwAZgEswMKJRBsupBogBsVHjDABzNPiQBWKmh2mYekN364jq3IgAMVRvh1cjDTkBgC+FOjYngTEZJo09HgAFLzKXHAAlOyqAFYwQQDCLAloAMoYYIwAPCISZAB8STA8QgCixqImaBTsANYwGEJFYCUA0gM1YpKk9RlCtdMycgowKmpQADpgyqJYELrZYHmFxXRlFYyaUBCMCIggAErwEDwk7BYwwjA68BxYpMRlLAoJxeAJ2HALvgAZA+HAeBgevt2KRHHxSGB2AADeRKDxQLEAOniXFMd2QyBAPFUvU0+DQaCwcEQAHoWTk4ABaNAQF69ZRoTlEAAshLYfCgyggnTshNgRBZXCwyhZzBGZxZuXyaGGJXKlUJ9NEPBAAF1TVRtLokABGYVGEzmSyIG0Adls9kceC1J3V9H1l3caiQPhAfgCQTiLuF4UiODwhBI5FsZyYLDY7GaQgAEgAVACyABl2jBOiNNFa9ABmABMDrMFiQdeonqczU01OD3l8/lIgWCSFrseoUQTsWT1FT9zVGfGg3YurOc8mdRmFbs1sQVcMVMdja3HtIDicc47HhDPYjA63+mHmHj90TcRTiWn6Y4LgE8ymUlkuNW+LrjoejCu6u4Ns6NgtkeXr3J+bhUueiDNuGfaRiEMYRCOD4xEm8RTs4OjLHi6xAZuVhgcYEFIAAnIex54P+azqGeXYob2/ZRnaoQWmG0DRDOH5gp8AC8hzHDqpz+hcTQ8D0c4ZAA3FsWzKIo7BJPB7AiTpxEAesWTAFs7DsGywgQOw/yArApDsIAKATsIovA8Ow4iBL0SK2dc5kWKophbKEmgylwSCgGcJhwFKYB4GgCChKEQA="}
import { createContext, injectContextSync } from '@studiometa/js-toolkit';

const Key = createContext<number>('answer');
const el = document.body;
// ---cut---
const value = injectContextSync(el, Key);

if (value === undefined) {
  // no provider — fall back, or do nothing
}
```

## When to reach for it

When the answer is **optional and the caller has a fallback**. `undefined` means "no provider right now", which is a different statement from `$inject()`'s "not yet".

The canonical pair is a look-up-or-create:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"0c92f0e0b5343e8c7b24bed4e0d912c31365ccf5976d3f7ffff10e94cb490746","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAkfwEMwwYANnETsAstywAeXhgrsZAPkog23Ug0QA2KgJhgA5mnxIAHFTRr9MDSC69+Q5QICW/JAAYqd0t0Y1yWgC+FOjYuIgExGTKNPR4ABTcLtxwAJTsrgBWMH4AwiyxaADKGGCMkuJSbKSu+nIArmAA1pAA7mAKCvGCIgCiugC2emhyTTAYIvlghQDS4xUSktW1Dc1tHQqpIpVLaDUGqy0Q7QrsAD7sjbAAZq4wUAA6YM4DWBDqGWDZeQV0xaWMZRQCCMBARABK8AgAhI7CMMHY/DU8A4WFIxGcsCg7CISXqCLgAPw6Mg9TgAlk7He7FI1nqpDA7AABlcYLd+FAmQA6GLcfRg5DIEAuZrKfBoNBYYQAemlmTgAFo0BBoU1nGgFUQACxctj1KDOCBDCxc2BEaUSZzS5jTP7SrI5NBTQolMpc8UDAQgAC63qoqnUSAAjABOHR6QzGRBBgDs5ks1jwDp+tvorsBOjuwa8PB8fmiiAATMFQjg8IQSORzH8mCw2OweuwABIAFVEABl+jAhtNlAGNABmOPCiNGJCF+OkKw2QROLPRnNqXz+cfuEvUMLlqJV6g1iI2+sAEW4FlyPD4gmE7GdfzmGAWVT2K0ua2OGz7FkDiC1QfDBjH0YTtQCY2Mep7ng4CCZm4C62Lmy4FoWWrrpgZYRBW0TVnEESJMkaTsGiGKwOCKpOr89APtIYCUooXRjBM17kWgd6UTIci0XIjC0ieMAiPE6QALynDsbHyNRmzbIsomKE8LxvB8hFEJiMAkRAZGpgwVDAqCeAAArokpsDyOw2n1D2GqtMpOJ4giXEwDx2IsIwCI4KQ7D0Vy7AAHL2bSbmKcppBwFSlY1EZ6pck8TyqaiBmBcFyIEXyMAKi41zWC8CK8NijD2Gp7AAEYIgacBvHA9w8vG/JIIKwquE0YoSlKiCyvKSoqgIaoatqupoPqhrGtwpowOalrWkx0oBcRpE3vQ7poJ6Pp+ion4aAArGYI7/lGQabZ+054FNKkzUxc4wb+cFLvmAQ/ihm7oduMR7rYdYcGB3BnvYl6TExLE7MsBwvkcJxKP6q1IDGw66NtwZAftiYRO9n0Xo40HhBd3gIQEmhriEG5oZElZPdhIC4m5lSSVgUzVPUfjvE8/CtOw/HsEJYhSdR7HiczADUA4hWQAgQNwUBpB+agaEG7gXdDkZIAOk4HRElRneji55iuiAmMhy3MLAtasBwdgo8FAlPOwnzfOpLoAt0AhyEjEGXukAD8LsEXF01qbNaDxI7X1CHILNs4z7NYPxqQANzKINSCgH8ehwIaYB4GgCCBIEQA==="}
import { createContext, injectContextSync, provideRootContext } from '@studiometa/js-toolkit';

const DataChannels = createContext<Map<string, unknown>>('channels');
const el = document.body;
// ---cut---
const channels =
  injectContextSync(el, DataChannels) ?? provideRootContext(DataChannels, () => new Map());
```

## From a component

`$injectSync(key)` is the same call with the element filled in.

::: warning It answers for right now
A provider that mounts later is not seen, because there is no request left pending. If mount order is not something you control, use [`injectContext()`](./injectContext.html) or [`subscribeContext()`](./subscribeContext.html).
:::
