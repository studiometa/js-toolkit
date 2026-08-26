# injectContextSync

```ts
injectContextSync<T>(el: Element, key: ContextKey<T>): T | undefined
```

The nearest provided value, synchronously, or `undefined`.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"1883f7d929e308a74ab1a7d4a5d7145faea3f6f9ab9761c148a7f23c41a4afef","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAiIEMAbAVxiJ2YPgFsARmXYAfdnzCwAZgEswMKJRBsupBogBsVHjDABzNPiQBWKmh2mYekN364jq3IgAMVRvh1cjDTkBgC+FOjYngTEZJo09HgAFLzKXHAAlOyqAFYwQQDCLAloAMoYYIwAPCISZAB8STA8QgCixqImaBTsANYwGEJFYCUA0gM1YpKk9RlCtdMycgowKmpQADpgyqJYELrZYHmFxXRlFYyaUBCMCIggAErwEDwk7BYwwjA68BxYpMRlLAoJxeAJ2HALvgAZA+HAeBgevt2KRHHxSGB2AADeRKDxQLEAOk02l0SAAjAAWIwmcyWRDkgDstnsjjwuXyaGGJXKlU0PA8SB8ID8ASCcQZlPCkRweEIJHItjOTBYbHYzSEAAkACoAWQAMu0YJ0RiS7GTEABmABMNLMFiQtuorKczX5gu8vn8pECwSQNul1CictiiuoyvuzFYHHGg3Y3LOscmdRmZp0ekthhAxnt9MtLNIDicsfdaiFXrFfqt+kDmFl93lcSViUjqo4LgE8ymUlkuNW+LTFspzOztIdiBszsLbPuHbc2Y9TtFPvFISlESD9ZiCviEecOmWePWg70VhHObpSAAnAWi3g+2t1KXPEvvb6JVTQgBdXzQaJRtU53YABeQ5ji5U56F5Rgmh4HpYwyABuLYtmURR2CSIDgOww9+3WLJgC2dh2AAehI4QIHYf5AVgUh2EAFAJ2EUXgeHYcRAl6JE6OuCiLFUUwtlCTROjsJBQDOEw4GUFg8DQBBQlCIA=="}
import { createContext, injectContextSync } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"7a09b1e934c8f24c028d97c0833656c3dc157d430c624d5e9f11985b13787b64","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAkfwEMwwYANnETsAstywAeXhgrsZAPkog23Ug0QA2KgJhgA5mnxIAHFTRr9MDSC69+Q5QICW/JAAYqd0t0Y1yWgC+FOjYuIgExGTKNPR4ABTcLtxwAJTsrgBWMH4AwiyxaADKGGCMkuJSbKSu+nIArmAA1pAA7mAKCvGCIgCiugC2emhyTTAYIvlghQDS4xUSktW1Dc1tHQqpIpVLaDUGqy0Q7QrsAD7sjbAAZq4wUAA6YM4DWBDqGWDZeQV0xaWMZRQCCMBARABK8AgAhI7CMMHY/DU8A4WFIxGcsCg7CISXqCLgAPw6Mg9TgAlk7He7FI1nqpDA7AABlcYLd+FAmQA6ZSqdRIACMAE4dHpDMZEAKAOzmSzWPBZHJoKaFEplJx3QVeHg+PzRRAAJmCoRweEIJHI5j+TBYbHYPXYAAkACqiAAy/RgQ2mvIs/MQAGYZSBdAYjEgDbLSFYbIINW5Jdq1L5/BH3MbqGEzVFLdRrRFmKwOAARbgWXI8PiCYTsFV/OYYBZVPYrS5rY4bX1qDQAFgForDEoFkeocpspfLlYcCB0msTth1Kf1Bp7Gcwpoi5uiVriEUSyTS7DRGNg4IgEGVv3oTekYEpii6YwmtavaAbN5kcgfckYtLLMBEeJ0gAXlOHZP3kO9Nm2RYIMUJ4XjeD5jyITEYDPC86ziKhgVBPAAAV0VQ2B5HYXD6m9NAAFpWjQnE8QRX8YH/bEWEYBEcFIdgny5dgADlmNpLiULQ0g4CpC0ahI5w0C5J4ngw1EiNE8TkSPbgrColxrmsF4EV4bFGHsC92AAIwRKBnDgN44HuHkqD5DQAFYzBDMVw0lVy/RjPARNPc9L2ma1ZwTfsF2TPUAj7Ncs03HMYnzWxbRLMtuArexq0mV93x2ZYDjbI4TiUBy/Q0KVg1DcVBRHbz5QiCc0qnat43CMLvCXAJNHTEJMw3SILQS3cQFxLjKhgrApmqeo/HeJ5+FadggPYUCxFgu8vygxaAGoAwksgBAgbgoDSLt/QFdwwsqjyAyjHyIkqFqtXC3VU0QExVwAXS8aBwiSotOCaoRlqedhPm+QLVQBboBDkBr0qrIR0gAfiRo9lP8zDX3iOHAbgOQlpW+bVqwIDUgAbmUIYLCQUA/j0OBnBYPA0AQQJAiAA=="}
import { createContext, injectContextSync, provideRootContext } from '@studiometa/js-toolkit-v4';

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
