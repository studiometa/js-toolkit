# until

```ts
until<T>(service: Service<T>, predicate: (props: T) => boolean): Promise<T>
```

A one-shot wait on a service.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"9ddd1c27ad7f0315c35c324e33296f6cb83d4ed535a34c197716fda6bcb9c106","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvYeNYAeACoA+RnDJF2ImIl4BldZpiKlFXllIwom5jR2NzELHB0K+AXiW8ARhAisYzGDcOgAKpBAAtuxqxgA6YOwRWBCkaNJgspQgUBAiCIggAOrM7Gn8KbwigqQWGbwVQmjVMLxqpBpaZuFOvGj4Nq020fwYvMxdltY0AHTx8Qr4LXCCXnAipOxY4pK80bwW/lyW3jDlFvvwfoLbYNO8APJeAFYwYl2OcGPnIo7sx16vZiCNStAxaT4iQIXYEtPowCLTLJoZgAc3yyGQIA4YAA1ll8Gg0E5EAB6ElPOAAWjQvlYONKlKIABZpnAmlZIjBkdNYEQScwsOwSW0OvASTJ2KxpgSIqwQABdeVUNnMVJIACcVH8YBRfSQAFYqMjSCiuXgJXKtewwLhEAAGKgifqkZhiMgagC+FHQ2FtBGI7qNdAYBRYHC4fCEohu0jUunWflYjGNprQAH4dPHwqxWApVangnowUYs4mwh8lPFEslUrGYKWc1kcnk8ABVEGSJYJnOg9qGMxkXr5rl3AAipyBrDQnxpvUWvAA7tacgvEUbUejMdi8VQCUTnGSKdTafS0IyWWzBByIlzmDyYHyBUKRYY4OK492pTK5YrlcaQwAjAAbFqMA6nqiCatQw4hiAMINpaWLWraDogE6qqujQ5CIMBXo+jgeCECQ5BBvQeBRmIEhSMw/BYQhjCFuWUQxGAggRACpBKFkKpqogADsAAcoHgfgSAAQB64mmaBQ0XRn5ZNitoAEyOs6mHujh+p4dQvqEQGJHUMGeA/GAbLvMSeifuWTjcf+Yl2ipWJgbqomIIa0FSbBDg2VaNpIAAzKpGFuthAnaZgBEFERgaGWRoZsJwPDpLIcgIdZcAqC+WiZsWqVWd0cCmEQEDsFAJgTFYkK2Lw9gFZm+UfO4ng+H4ARBKE4TMSWDVOJWCRJCkaQWk2uT5EUJRlBUVQ1GBaQNNczS9qK5kzv0aRwEMcAjGMFVTDAsxgPM87LKs6ybDGewHAEahQCcZwtBYcBXDcdyPC8bzeZ8qotD8gr/ICMJLa+lRQhYgNwgiSIbkgGJIbi+KEsSh5UjSfinuerLshIN7cry/KCsKxZvha0poLKCpKiAPGAcBwkuQakmpuaGSSgpyEBUFLohUgSlKeFulRfpSJGfF4ZJfBn7JjBGaWdmuYwYW+h9loeVy+lfXVoNdYISNLYFO2LSdq0n5A50OCkEOnljhOghTjOEBzi0S5gCua7QWiMNbtaO4EIjB7kijJ4MsymNXtjt73o+BNZWKEty6T5O/lTdk4bzdMQVBKbSXBH5y2zfmIIFaFqdziBKWF3o6ZF/rEcLcUgPYGE42QfDRAh1oojoLWHGAutjYUixwhbcKW6muyfBExAd6Y1oiKwYc6rwk83hkbGmHAk8QH0xty6YgS3XAYACqChLYiibvU2J/lCU5IliRJHlMwUbefh3+e2kX6Fc1hSBMky/PV2igZGg9dG4umbqQVucB246i7rSNqfc8ADy5IsYe84s5pD2JPDQOoZ6iHnlYRey9Zpr1aJvbeaxd5jBdq0I+WAT5oDPhfFOAF9R8XTq5cSjNs4vzlm/XyH9ObqWwkBfyAC/RALrrBEyZlPr1TVgVWyqpAICVQtqembluFeUUQI3+QjS7qnEXpWupFYK1UcGQTAfA0oFWmBgHQrF2IxUvjhASIFb4aIfhgvAGB356OLsFH+mkPSUx+LAPAmtazAGSpKUwcdEy8A9AITqvAADkAABS815bwB2PGjYOTJUkAG45hHzgBgUQAhhCUR2LJMg9E+DAHiLwSokhZEFV4G4MYC4JoxKTPEnMDFTCMGibwxMHdElNV4AAQjGTmDu3ASlSAuE0UgUhPp2KWR6LIONmBIFAMGMCcAqJ4GnCAD0HogA"}
import { until, useScroll } from '@studiometa/js-toolkit-v4';

async function afterScroll() {
  const props = await until(useScroll(), ({ isScrolling }) => !isScrolling);
  return props.y;
}
```

**Parameters**

- `service` — a `Service<T>`, and nothing else.
- `predicate` — called with each update.

**Return value**

- a promise resolving with **a copy of the props** on the first update that matches.

## The contract

- It **releases the subscription before it resolves**, so an awaiting caller never holds a source open.
- It resolves with a copy, because the props object belongs to its service and is only valid for the duration of the call that received it.
- **It resolves on the current props when they already match**, through the service's `hasProps()` — so `await until(useScroll(), ({ isScrolling }) => !isScrolling)` on a still page returns immediately rather than waiting for a scroll that never comes.

## When to reach for it

When the code reads as a step in a sequence rather than a reaction:

```js
await until(useScroll(), ({ isScrolling }) => !isScrolling);
this.measure();
```

For a reaction, subscribe. For an ongoing condition, subscribe and act on each delivery.
