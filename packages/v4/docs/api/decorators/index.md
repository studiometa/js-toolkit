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
// @twoslash-cache: {"v":1,"hash":"5908b0fb5d4b6fa59c6a9ff0e0264325c9e0893b56fac8719ddc4e4f88f93484","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCAFssEMDDBpGgsADN2Ac0S8AQlxgBhMfIXdlAHgAqvOjTBQ4q9VrBw0pAK780EUgD5GRNg5jLDFATEaemUNVi44ABEYQVJmF1IbYLQjNz4AXjdeIgh2KAAdMHYRVzRAkvFJShAoCH4ERBAAZRgytHwYctFKspkdXmZzXlIYBXY7Ml52zv5wuEsAdw6wXnYy8d5YeXEoADpqu2ZSBkQARipWCQV2pABOKjQjhVa8QQqJBgv2cSQABip+PgjsxnGQkKcAL4UdDYXCNQgkcgPUxMLCkCA4Y4YPhqOCabSKXZgZhCXy8Oykb4KA6PY7ggDMFyuN0QABYHk8Xo1iaTqhwfoh/iBAcDQeQzvSoTCcHgEWDkfRXnNLNEhBAaUcTvSAKxMsDXfBIdnUTknECq9VfAXnYVAuJipAANil1FhsuI8uoKMaLA4XD4swiVjxRhM9AkFmDMAACuisJZ0lHYxi4G5CsVRMcoxq6WyABx6g1GjmkZ5m3G4K1wm0i+00cWnW4uzAy+EepFexU+ticHirMAAKxiKTADiEACMyB4ANYwDChIKmADSc/0o4nU70vAAat4YAB5cd40iItdjyekXgAH14DnMMG2MCgaaKJSz3yHzmqtXqeAASvAECsCQUwdLw4hHPAZRosQeRPtke79i4oGdLAsTxPB8gwKwey8IYYFYTh5KPBglgAAZ3ls3xPmRt6SOwrDDIBrAOGg7BiLshQAXAQGsexKyHMclhiPwnTxIEtj2E4bFiAMQy1PA4EQGUIyCWUzCyPWmxQY4zj8fsVBqUg2oFiAlz6iyjolmWeAfsOfLUUgABMAJ2iC9ZIJK0Kuq2BDttUySvGIdi8Cu868Eky6ruuF5uDmJyOrqZnMoaiCMiapZciAYUOQKLm2qKHlnL8zZum2iIBd6ICMDBmKYHwFq7MwAD8ygxZMN6UQ+1FQPFSAAOxCuZRZnNZWXMLlcL5bW7lgmc2qlb5codoF3Z+n2dnOGeG7uIws7hZF9BhdtsVbruLEHkeZCnu1l6dfej7Pumb7rIO9lUD+DQgNxQEgdM4EwJBIUwUQcFQAhF1IRAKHaehNDg4RuH4Z0iPEcwpG8BRD09bRd5sYxqm8TJYCcWAP0scTaNCbwIlib0wVSXpsmDODCmWJAKlQZqAyaZMsAUtJ+l9YgeZJcNlljWam2fGZjlpa5hVzV50pwn5FUKmaMghWFC6SFFGAnVOwu3Pl4upeltI2Y0OVVp5Ct1nNpwld5Laq8tlVdtVIKifMrgNTAaq7OObXnh1dFUTswtO1ZyUWalNqW1l46TXbBUO+KTmshCAC6ALQKrAACbzdB8jDAOBJJkgA5BaVe8BC3CFIG8y8BaYZmJGFa8MAhS8LwBfS4wYV8C1Ic7QA3L3/eD8PAz8D7PGXsH4Gh3d4fdTsk9gBC1Sko8SCgKYEhwPxeBoAgEIQkAA=="}
import { Base, component, inject, createContext } from '@studiometa/js-toolkit-v4';

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
