# until

```ts
until<T>(service: Service<T>, predicate: (props: T) => boolean): Promise<T>
```

A one-shot wait on a service.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"9ddd1c27ad7f0315c35c324e33296f6cb83d4ed535a34c197716fda6bcb9c106","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvYeNYAeACoA+RnDJF2ImIl4BldZpiKlFXllIwom5jR2NzELHB0K+AXiW8ARhAisYzGDcOgAKpBAAtuxqxgA6YOwRWBCkaNJgspQgUBAiCIggAOrM7Gn8KbwigqQWGbwVQmjVMLxqpBpaZuFOvGj4Nq020fwYvMxdltY0AHTx8Qr4LXCCXnAipOxY4pK80bwW/lyW3jDlFvvwfoLbYNO8APJeAFYwYl2OcGPnIo7sx16vZiCNStAxaT4iQIXYEtPowCLTLJwNDMVJIACcVH8YAA5n0kABWKgo0g4mAMAoydisLIcMC4RAABioIn6pGYYjIGIAvhR0NgGQRiFziXQKSAWBwuHwhKIbtI1Lp1n5WIwSWS0AB+HRK8KsVgKVEa4J6MFGXUqsIfJTxRLJVIKmAW/VZHJ5PAAVRBkiWyv1oPahjMZF6RvJdwAIqcgaw0J80BBeoteAB3dhgHIpxFUZGoikARgAbFiYLj8YhMdQw+KYc6aVj0wzmSBWaiOTRyIgi7z+Tg8IQSORRfQ8LKxBIpMx+B264wTVaojEwIIIgDSEokSSKQB2AAcJbL+CQ+fzxOreCnM799ZAdIZACYWWz21yuwSe9QBf3hUPqGK8D8YDIu8Tg6teVpOJuebHoyj63qWeJHogRJVqS5J4A4kENvSSAAMxPm2nKdruH6YH2BQDiKf4jgUkqcDw6SyHIdYQXAKhtB02imoGWjMeB3RwKYRAQOwUAmBMViQrYvD2AJYF6qwrHuJ4Ph+AEQShOEi7mvx1q2kkKRpFSN5uvkRQlGUFRVDUpZpA01zNAGnEgfG/RpHAQxwCMYwSVMMCzGA8zJssqzrJs8p7AcARqFAJxnC0FhwFcNx3I8LxvJhnyoi0PxYH8sUApCMJOYYEJQhYxVwgiUFol2RYHohhJnmhNYZNStKNnhBHskRSD3vepFfhRP5ZDQNESmw9F8LW15qtW2p6NehotSa+g8TpCmsTaCQGQ6M0Ka6uRmV6LQ+q014lZ0OCkKGLWRtGgixvGiZwqm6aZtmIC5rV+b9Q15aVuq6GUoq14dThiD4S2z69Yg94kXyn7kUKg6jf+tFYG2ETkmQfDRHW6Y4joqmHGAh3ugUhSLHCN2vUDaR7BExCE6Y6YiKwghWLivBM9jGQrqYcBMxAfTnQppiBLFcBgMwWCgmgaB0jin3fQWuH7vBh7HqeqEang+PXoT4MMlDrY9R2SAACyW4NyOUb+Y3ivYWM46QeNwATuLE74pPk2ZVPkostPJvTuyfEzGi4qzogc1zOI85EtkC60wui2s4tjBmrQy3LagK0rKtbseBLbv9SEns1esFAbClG9hJvdS+naFrhtuCvbaPjYBwGZfJloCTVBa7s22KNchlfAyAmXG1bjew+ibffqjw5O5hZCYHwLECdMGA6Muq5Uarx67sWmtjzr9N4BgM+IJbc8W2+3IALostAgp2oZvDAIx1KmPtKq8G5AILSvAADkAABZEnMJDYxRAAeieHAAAtAmPwABrUoSCiCW1AQAbjmDLOAGBRACGEOOHYl4yCzj4MAeIvBKiSB7gJXgbgxgpgsj/VU/99RzlMIwb+NcVSE0AcpXgABCQR+pCbcHwVIC4TRSBSEyjvWR3IsiwOYEgUAYpSxwAnHgOMIBuTciAA"}
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
