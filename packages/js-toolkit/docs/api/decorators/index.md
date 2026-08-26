# Decorators

**Sugar, never a requirement.** No engine ships stage-3 decorators, so every decorator here is a thin wrapper over a function API that works without it.

| Decorator                                        | Wraps                                   |
| ------------------------------------------------ | --------------------------------------- |
| [`@component(config)`](./component.html)         | `static config` + `registerComponent()` |
| [`@on(target, type)`](./on.html)                 | the `on<Child><Event>` names            |
| [`@provide(key)`](./provide.html)                | `$provide()`                            |
| [`@inject(key)`](./inject.html)                  | `$inject()`                             |
| [`@children(nameOrClass, cb?)`](./children.html) | `$watchChildren()`                      |
| [`@read` / `@write`](./read-write.html)          | `$read()` / `$write()`                  |

The service mixins have a decorator form too — see [Mixins](/api/services/mixins.html).

## A page with no build step keeps everything

`registerComponent`, `$provide`, `$watchChildren`, `$read`, `$write` and the `on<Child><Event>` method names are all there is. A page loaded from an ESM CDN uses the same framework with none of this file's contents.

## Each value decorator works on a plain field or an `accessor`

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"38d5cef74c897702977c62bf0ecd866754d08ac32dfa549a9c45e56d03024126","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCAFssEMDDBpGgsADN2Ac0S8AQlxgBhMfIXdlAHgAqvOjTBQ4q9VrBw0pAK780EUgD5GRNg5jLDFATEaemUNVi44ABEYQVJmF1IbYLQjNz4AXjdeIgh2KAAdMHYRVzRAkvFJShAoCH4ERBAAZRgytHwYctFKspkdXmZzXlIYBXY7Ml52zv5wuEsAdw6wXnYy8d5YeXEoADpqtGYFBuRkEA4wAGtq/DQ0LDhEAHongCs4AFoXCFZLtY+iAAWXZ2BxQdjCVrMXawIhPZhYdhPWCxeKuOBPQQVCRoXa3ISsEAAXSJVDszFIDEQAEYqKwJAp2kgAJxUQ6kBStPBY7o46oXXCIAAMVH4+ApzGcZCQ1IAvhR0NhBQRiNK2aYmFhSBAcJSMHw1HBNNpFLswMwhL5eHZSOwwApquTKTKAMx0hlMxCAtkUzlU8AW3B0u2CkUgMUSqXkGku+WKnB4Qgkcjq+jcuaWaJCCCO9lUl0AVnd9s93uovq5jSzOeD4hlovFcSjSAAbHHqErE6qU9QNY0WBwuHxZhErEajCZ6BILGOYAAFbUPXjpWcLnVwNyFYqiSmz6q1ep4QwdAQZkzJjBdMQ4ydmCz7H3HJCnc5265UW73R4vd5fCA/P40ABYFQXBSFDhhGA4QRJFiVJEAnSpQEAA5i0ZfAkDLdk/TwQ0g1fOsaQbSMaGjalmXbTAE0aJM1V7NN+zYTgeFWMBXhiFIwAcIQACMyA8S4YAwUIglMABpIT9C43j+L0XgADVvBgAB5HijVIZMpO4vjSF4AAfXgHHMGBthgKBNyKEpdztdjnH3OoGhAAAleAfhIKYT3ECl4DKLViDyMzsiU1iXA8zoUVceJAvkGBWD2Xhj06GK4utQ4MEsAADIythDKAMsMyR2FYYZXNYBw0AhMBdkKFy4B+crKtSik0EsMR+E6eJAlsewnAqsQBiGWp4F4SAyhGRCBlkUjNh8xxnEqh9yyfFAzgud8CDuB5njeT5vl+f4gRBNAwQhS0INheFEWRGJIoSDEbI4vE0AJOCyTzJAC1Q84PQwxAWx9DlKxAB67NrQUACZiKbUikFjBUO2olVkwOPtwzEOxeAk4TeCScTJOknS3FzZrWyLb6S1+t1y0B/0sf5EMkEh8NG0lGGaSFSjOxo7sUYYkBGD83VMD4atdmYAB+ZQCcmAzspM3LiedRAAHYw3pCn62pnDGmYenCKZiNoelGkC05xHaJ7ZImCYodWNszjtP4xhBOx3H6CxrSZPcOTFLKlS1LITTpd02XjNM8ytys9Y2I4+zD0aWq3M6aYRpgbyMb8ogAqgIK/ZCiAwpm1EaBz5L4sS3gy6a9LeCysPcvyoyKuK8b6r6qqatKhr+sQ1qwHagZenRnr5v6wYc6GyxRpKibmCmyZYBtXqFoOI4TlWt8bk278dr/ACDpA46wLO6ELpg67i/RJ4QdxfFCRJN6ScQZCyfV9DWwB7XgZj0GCMFKnDas2NnDeMyoLa839DIDGWMRKSDxhgT2hNFZUmZEzN+noqbYSBnTMGsMoZALIhzeGVEwE81TP6Fg/B2rzFcCLGA2Zdg8Slo7EOBUco7GQTKIU/1ybvyIlrIGPE9b/3wc2RA4NASyngoIWAeAAACPJrySEYMAEagZlAAHJqwaN4LKbghQRzzF4NWW805LB4V4MAQovBeByJvowLGfAJbMK9gAbmsbY+xjiBhUPgHVXSTCRosP0mw+WOx3FgFlNUE+SBQCmAkHASqeAWogFlLKIAA=="}
import { Base, component, inject, createContext } from '@studiometa/js-toolkit';

const Key = createContext<number>('key');
// ---cut---
@component({ name: 'Demo' })
class Demo extends Base {
  @inject(Key) a?: number;
  @inject(Key) accessor b: number | undefined;
}
```

## Build setup

Vite 8 transforms TypeScript with Oxc, which passes decorators through untouched, so a transform has to compile them. TypeScript 5 needs `experimentalDecorators: false`. See [Installation](/guide/introduction/installation.html#with-a-build-step).

The package itself compiles them with `@rollup/plugin-swc` and `decoratorVersion: '2023-11'`, filtered to the files that contain a decorator.

## Read next

[Decorators](/guide/going-further/using-decorators.html) walks the whole set, including how they stack and why the phase decorators are leaf-method sugar.
