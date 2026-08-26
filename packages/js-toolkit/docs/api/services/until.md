# until

```ts
until<T>(service: Service<T>, predicate: (props: T) => boolean): Promise<T>
```

A one-shot wait on a service.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"89d0c06de35e9e5597c41ee3bc72154de777623882cb5ba68e13551940ddc877","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvYeNYAeACoA+RnDJF2ImIl4BldZpiKlFXllIwom5jR2NzELHB0K+AXiW8ARhAisYzGDcOgAKpBAAtuxqxgA6YOwRWBCkaNJgspQgUBAiCIggAOrM7Gn8KbwigqQWGbwVQmjVMLxqpBpaZuFOvGj4Nq020fwYvMxdltY0AHTx8Qr4LXCCXnAipOxY4pK80bwW/lyW3jDlFvvwfoLbYNO8APJeAFYwYl2OcGPnIo7sx16vZiCNStAxaT4iQIXYEtPowCLTLJoZgAc3yyGQIA4YAA1ll8Gg0E5EAB6ElPOAAWjQvlYONKlKIABZpnAmlZIjBkdNYEQScwsOwSW0OvASTJ2KxpgSIqwQABdeVUNnMVJIACcVH8YBRfSQAFYqMjSCiuXgJXKtewwLhEAAGKgifqkZhiMgagC+FHQ2FtBGI7qNdAYBRYHC4fCEohu0jUunWflYjGNprQAH4dPHwqxWApVangnowUYs4mwh8lPFEslUrGYKWc1kcnk8ABVEGSJYJnOg9qGMxkXr5rl3AAipyBrDQnxpvUWvAA7tacgvEUbUejMdi8VQCUTnGSKdTafS0IyWWzBByIlzmDyYHyBUKRYY4OK492pTK5YrlcaQwAjAAbFqMA6nqiCatQw4hiAMINpaWLWraDogE6qqujQ5CIMBXo+jgeCECQ5BBvQeBRmIEhSMw/BYQhjCFuWUQxGAggRACpBKFkKpqogADshpYmBur4EgAEAeuJpmgUNF0Z+WTYraABMjrOph7o4fqeHUL6hEBiR1DBngPxgGy7zEnon7lk43H/hqUHaiJBqSameAODZVo2kgADMqkYW62EABzaZgBEFERgaGWRoZsJwPDpLIcgIdZcAqC+WiZsWSVWd0cCmEQEDsFAJgTFYkK2Lw9i5ZmOUfO4ng+H4ARBKE4TMSWtVOJWCRJCkaQWk2uT5EUJRlBUVQ1GBaQNNczS9qK5kzv0aRwEMcAjGMpVTDAsxgPM87LKs6ybDGewHAEahQCcZwtBYcBXDcdyPC8bzuZ8qotD8gr/ICMLza+lRQhYf1wgiSIbkgGJIbi+KEsSh5UjSfinuerLshIN7cry/KCsKxZvha0poLKCpKiAPGAQBvlCeBomIIJKbSXBGSSgpyE+X5LoBUgSlKSFunhfpSJGTF4bxfBn7JjBGaWdmuYwYW+h9lo2Vyyl3XVn1dYIYNLYFO2LSdq0n7/Z0OCkEOUloGOE6CFOM4QHOLRLmAK5rtBaKQ1u1o7gQcMHuSiMngyzJo1eGO3vej64+lYoS3LRMk7+5N2ThAEOcJEFQYzsHx4mbNeYg1PoVzWE88F3o6WF/rEcL0UgPYGGY2QfDRAh1oojojWHGAuvDYUixwhbcKW6muyfBExAd6Y1oiKw4c6rwk83hkbGmHAk8QH0xty6YgRXXAYACqChLYii7sU2J3mCY5EHiS5TNt5+HcF7axdqdziBMky/PVxFBk0Hro3F0zdSCtzgO3HUXdaTNT7ngAeXJFjD3nDnceS8p46hnqIeeVhF7LymmvVom9t5rF3mMV2rQj5YBPmgM+F9U4AX1EyUCtMxISWglbPAT85Yv08m/Tm6lsJAW8r/P0/866wRMmZN6NU1a5VsqqQCfE+IsKcvTB+sE3qvyQMwtCH8y6QVEXpWupFYJVUcGQTAfBkq5WmBgHQrF2KRUvjhQK1Nb503YTnPAGBtFfwEZ/RhHoyY/FgFw3qtZgAJUlKYPOPYPQCDarwAA5AAAUvNeW8gdjzI1KMkgA3HMI+cAMCiAEMISiOxZJkHonwYA8ReCVEkNI3KvA3BjAXKNaJSY4lJm4KYRgUTuGJg7rwD09VeAAEJhk5g7twQpUgLhNFIFIN6diFkeiyJjZgSBQDBjAnAKieBpwgA9B6IAA==="}
import { until, useScroll } from '@studiometa/js-toolkit';

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
