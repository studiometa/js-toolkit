# Installation

```bash
npm install @studiometa/js-toolkit
```

::: info The package name in this documentation
v4 ships as `@studiometa/js-toolkit` 4.0. While it is in development it lives in the monorepo as `@studiometa/js-toolkit-v4`, and the code samples on this site import that name so their types resolve against the package that exists today. Read every `@studiometa/js-toolkit-v4` as `@studiometa/js-toolkit` in your own project.
:::

## Importing

The root barrel carries everything a page normally needs:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"851d62f7e927be689418d216f09a0e43d9f86dd5004bd503dd5f31f3fa89bef0","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGC8pDB+7C5kAMIQ1p2+aIzDo0lgaINCcHCIDjDDYC6kzTm23MtEEOxQ5lY2dt29/blTNjMMVFAQ/AgxAEoXA6S8zAIjN+Nfil47DQIksZEiUCazEs7FYGAovECvl4cH4zC6lmYaAyiT8ch8YNmcAAdOZzNJ8DBeGBoVT+CN4E1NJZEZTeGCIjBIfSwI12H4ERwANZUpFA9auNowADkIgABgASQ5ygGQpHmOUASQAcgBlaQAQW1gwAorqVZisLwRRggfYsM0AEYcOCUkTA1SsRq8VqwUjLb5wJ2CYS8ADu+HYGTk9F8Si+5np03+YeB+BjaFI3x5fLx6MhjVskRBiIg5xpYPDEGarEhECRpFTqnOfQ+5l9ZF4co7fKSUBViQGzDr3vprA4UFx4bTrKpFapwPFlNIwK5xKcLjc0QAjABWby+AJBRDbgDsYTcxbwPVbV1+Y1mTg4SSQaRAGSyOUqJ93BQAuuk0BlCctj2MAKwIjelxDPety8AUTIjLw0oAAIuM0k4Mq4AD0ABWcAALRoBAECsEKwIEUQwTSgA3E4YKuEgoDyL4cAdGAeD4SABQFEAA"}
import { Base, registerComponent } from '@studiometa/js-toolkit-v4';
```

Utilities live on `/utils`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e8542dd4f7991c82b8c468c8c64fda77b44231f2052d484a46ef84984b53f33b","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEa2YBbLIyJtBMRLzCC5AIzIVec9mHWadeg81omtu0t2tnSAHTDsFEUmmmyFlEFAgRBEQQAGEfLF5mXmVWVV4jKN4Ac3YSKVJmMGSYADo/ODRmTyQATipWGGy0fCQAVioi0hyGEJl5LD8OMFxEAAYqEXxi5jEyMoBfCnRsXoJicca6VpAWDi4+IVFxSV4oDsYmloA1FTUNG3MRQVJSKrRTuPPTW31+UbQPB1feGFksOAwKDfcxYO4idhwCRgAD8ILs8JcbiwHi8+18VACQTwACUYGgblIajANMteOI5DAALTaLhAvYdemxeJZKC8OBgZiRADu7BqiQABmCYBCoZIBfkqIViq0AIwANgqVWSNSQABZGsUWnh0Z0KkZegMQEMRmNyIgFRMALqDaBzZGo3jAbwdfS63gTASkCByXgAcgAAoVBFAJJSigB6ABWcCpnwgrAA1nyqUQ1RHBOJWHA/QBuPzh5hIUDLKpisB4GMgCYTIA=="}
import { clamp, damp } from '@studiometa/js-toolkit-v4/utils';
```

Test helpers live on `/test`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"23384ec030fd02d878d3fa20e009031e76a900cad0898c4ef482225d7a4f1524","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALYRhaRvjTTWiXnDSl2YAObc1ABVIRp7ODAA8ACQAqAWQAyAUVYxpMMGgB8AHTDtpLAhSNBk5T0oQKAgRBEQQACUPWFIZZlIAa0EsXm00CF5mXgB3UmYsHFSAAyh2IiqKQork3ND83jR8GF5okUF3T0KwKBLmdlD+YL9O7pETILAPNDhcsDh2WFaOgoAjbtl5GBHmYfUYNDRXKAA6Pz8bLt5Sc8FSRZGYVwHQsw7H0vKlUaixIqRmaUy2QA5CsIMUpMYIGg1ONcitmH4NMwdq5ePgTlBcZNqgBHQRkDAAZU+MDEwUY3CqvBEbFY6NOqIyMBgWHRAjKOm+vAg/DOoLYmPYOO0OhWxWCGRl114SWYInwAmCvCq1347FIGhcbiWAGF8OxWFAmcUulJwXNApIljDhfC/DShb8bcw2o8aBpeIsjnBbmA/FUI8s/HM1qFEaEALyFYpjUIHTyMKEWWpEHo+5gAWgdCyWCZ8IBN4RopHLXgsAHoc14odwANzRyQB5BzQ6kAC6vCTOnOAElYycRPALJXe15MzPPGQoY1423wxHIliQkgAJxUVy6TpIACsVDQ6WHDHi6YY++0uEQAAYqOr0mrq7uAL4UdDYB8EYgyEiGh6CYNhOB4ARhDECQpHMC5XAZQxjFMcwLCICANl8fxHRCM4ENwKhejiEAAHVU14eQLV4GBQQwXgcGGGUwnkIYPjo9R1SOQQrhKLQaDxLheFYAkjlDe5HjAfo9gNQpnkDJE5J2cYylIeiCTk7pIFCHRyTgOBsSJFC/m6ORlg2GBlQAQQ7R1FkGG8Vn4YyiiqOxBHPcRJAAeR2cxSFBJkWVYVgdjVDJGhtdh1RM3gdmMYp/L8WAOFBWEpHGWF4U4rooB47oyhmMF8SkSRYtMERjHPOAMj+H0mkY2ARhmd0viWVtYvlTJYuLJ1BhmKQyRgPS0R6Mp7xGHZ6PBOAuLy1xUm0PwRMWYVSBSRoNKKFb9mYeihvJVZ2nBRZ6GFRZlUpApFnGLpUnxVhRTMd1IEEHQNTYJ01CKML5KqG0PBHQkYAZIKTieeAIFYEg4pgYlunBCA/LIUFBJWWiPD8Z4ghCI5Yo9JZNtOH70gRgIyGZcHnjQV4pD2NBim5O15WEk54GVAAxOoYCx8IoFhUVy1cX1ugxwZWAgCAchpt5GgGsaxjtR5Zty/KaxAZlANSIob2mfFQhZWbmFgFY8gKdULSgZ4wEabQACtaS8tY2N4AARby7D48Z2buMAHl+X5wS0d62kl1hNVSct7XmPqfhWbIXcyr3/U0nonXLZURzQPxA/+YxdG2KGI8KDoyjWcZYJdFosQEwAUAjObo/GAAABDgwFqvwU3GDmpjAT8/GuTdz23RAAEYADZ9w8HQj0QSfqAvc48Hgy5CJANuH2fEBXzKMQgLH8fPz7F9oH/AIcdCYAWM8RoV9xT9+RMXgoWbjRBFqExzmYes7bgAt8ihoqNABYiAABZ6z+jQFCVskR3DniQKAOgNBy6SDwL/EAn5PxAA="}
import { mount, settle } from '@studiometa/js-toolkit-v4/test';
```

### One subpath per export

Every public export also has a subpath of its own — 197 of them. The barrel is convenient; the subpath is precise:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"aa2332fe2c0e8ce4761969447fca35981151b9105fadb4bbf7ce2d526ec68458","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGC8zaoAyvyarKyM4ZFoAPyIvP2DrNJuY9xTvWRE7PxSMxBDhtpmFta29j0wW0NOUBD8CDEAqqq8nTC8cAPbrC+r6884pLyjUQAdLwACIwRrMZqsNAiNAQf74Z4Ad0SlyRgKcLjc0QAbKEQD5/IFPGEFlE8CczqwnBwkkgAIzpTKkbK5TxFEo4PCEEjkMLyWocLh8FptNAdLqCZjWRhENjNGBTMDNSwAIzIFF4lkSSpV6tImsszFourVZCWvGVZtI5isNjsAiE1guVxuIAAwk6sLxmLw5awFbxEj7eH52CQuiz/DAMVQse5EPSAExeAm+AJBRAAVlJEXJMSlzoSdMQSaZWRylXyBQAuuloGU7UdeMAHM8Ck1NJZeAByAACLmaUA6liizAA9AArOAAWjh2wA1uw0DOiMFx3EewBuW2HB2tylvIa8DuNLu9gdoIcjsdT2fz1hLldr8eH2bb3f2+ytwve0/n/tB2HCBR1cO85wgRdl1XddmnFVg4HHX9tycUDmCQUB5F8OAJTwacQAKAogA"}
import { Base } from '@studiometa/js-toolkit-v4/Base';
import { useScroll } from '@studiometa/js-toolkit-v4/useScroll';
import { clamp } from '@studiometa/js-toolkit-v4/utils/clamp';
```

Which one to reach for depends on how the code is delivered:

- **With a bundler**, prefer the barrel. Tree-shaking removes what you do not import, and the barrel keeps the import lines short.
- **From an ESM CDN, with no build step**, prefer the subpath. There is no bundler to shake the graph, so a barrel import downloads the barrel's whole module graph before the first line of your code runs.

The subpath layout is what keeps a dependency contained. `morphdom` is reachable through [`swap()`](/api/dom/swap.html) only, so a page that never swaps content never downloads it.

## No build step

v4 needs no compiler. Every decorator is sugar over a function that works without it, so a page loaded from an ESM CDN keeps the whole framework:

```html
<script type="module">
  import { Base } from 'https://esm.sh/@studiometa/js-toolkit@4/Base';
  import { registerComponent } from 'https://esm.sh/@studiometa/js-toolkit@4/registerComponent';

  class Counter extends Base {
    static config = { name: 'Counter', refs: ['output'] };

    count = 0;

    onClick() {
      this.count += 1;
      this.$refs.output.textContent = String(this.count);
    }
  }

  registerComponent(Counter);
</script>
```

## With a build step

### Vite

Nothing to configure for the framework itself. Vite 8 transforms TypeScript with Oxc, which passes decorators through untouched — so if you use the [decorators](/guide/going-further/using-decorators.html), add a transform that compiles them:

```js
// vite.config.js
import { defineConfig } from 'vite';
import swc from '@rollup/plugin-swc';

export default defineConfig({
  plugins: [
    {
      ...swc({ swc: { jsc: { target: 'es2022', transform: { decoratorVersion: '2023-11' } } } }),
      // Compile only the files that contain a decorator.
      enforce: 'pre',
    },
  ],
});
```

### TypeScript

Stage-3 decorators need no flag on TypeScript 5. Turn `experimentalDecorators` **off**:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Preserve",
    "moduleResolution": "bundler",
    "experimentalDecorators": false,
    "useDefineForClassFields": true,
    "strict": true
  }
}
```

See [TypeScript](/guide/going-further/typing-components.html) for how to type a component's refs, options and events.

## Autoloading

A page that declares its components in the markup does not have to import them all up front. Map each `data-component` token to a dynamic import and the registry downloads a chunk when an element needs it:

```js
import { registerManifest } from '@studiometa/js-toolkit';

registerManifest({
  Accordion: () => import('./components/Accordion.js'),
  Map: { load: () => import('./components/Map.js'), mountStrategy: 'visible' },
});
```

See [Autoloading](/guide/going-further/autoloading.html).
