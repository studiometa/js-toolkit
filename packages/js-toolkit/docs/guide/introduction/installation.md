# Installation

```bash
npm install @studiometa/js-toolkit@next
```

::: warning The `next` tag is not optional yet
4.0 is still a prerelease, so it publishes to the `next` dist-tag. Plain `npm install @studiometa/js-toolkit` installs 3.x, which is a different framework — the tag is what selects this one. `next` becomes `latest` when 4.0.0 ships.
:::

## Importing

The root barrel carries everything a page normally needs:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e758326ba00abde243c78e6daa032f3a35c7f1d07885b8fb902464d586b64936","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XgAMy6YAefTAvFIMBS7E6ZAAwmEbJFoowUeF0WgkX44IgHDAUWBOqQug9bNxCUQIOwoOYrDY7DC4QjHli0VEGFQXG48AAlNmI0i8ZihbHcsWKXhNESWMgHKCg5iWdisDAUXibKK8OD8ZjQyzMNA3M4pORrBXRODxczmLw+MCqnz8foiEGaSza7y8BX7GDKt1gEHsFJajg5Hw62Wk5IQmAAchEAAMACT0lPS5U68wpgCSADkAMrSACChaRAFFi1njVheFGQk1eFgugAjDhwbwiOUwVgg3jg2CkQniuAdwTCXgAd3w7BucnocREzHMbsl0VnTXwS7QpHFwdDFsNypBtgOaBEtVZzoVs4gXVYyogOtIM4RPlh8JF5mHZF4FN/1DSIoCzM5EWYF9BzdVgOF6MALQ/TYfSdF1ZXsM5vFIJpA0SXZUnSTJsjyKgCiKAkykqGo6gaJoWnaToej6BVBmGUZxhKb92WCLjhQ5VEIm5eICksVhplmEB5kWRAAEYAFZVnWTYkFkgB2AiAwYDxuJFTkhOiJxsi+K4QBuO4HjIVT5JeSS3VgPAmVsexgCJLVdIEzd7BeUEvV4RMAAEmN6fpkgqapanqRo0ETABuJxWOYJBQFiUkoTwSoQBeF4gA=="}
import { Base, registerComponent } from '@studiometa/js-toolkit';
```

Utilities live on `/utils`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"7070ec6349867bc2a1b06e7152793423c378cbfd3a3cf4c7456eaa290f6388c7","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEa2YBbLIyJtBMRLzCC5AIzIVec9mHWadeg81omtu0t2tnSAHTDsFEUmmmyFlEFAgRBEQQAGEfLF5mXmVWVV4jKN4Ac3YSKVJmMGSYADo/NGZk4ORkEA4wAGs/fDQ0LDhEAHomgCs4AFo0CAhWSvY0DqIAFly4NEEoCTkYQtzYIibBcVY4JrlmNHxc2rlWAGIZeSwQAF1TqnHmTyQATipWGGytpABWKkLSHIYQo98Hoy4RAABioInw12YYjIdwAvhR0NggQRiDCPnQfiAWBwuHwhKJxJJeFBjoxPt8AGoqNQaGzmESCUikJ5oKlxGmmWz6fhQ7qkBxc3gwWQNGBQAXmLDMkTsOASMAAfgldmVLjcWA8XhJ/38gWCIAASrNGVItjANBjeOIZh1tFwxcTjg7YvEslBeHAwMxIgB3Ab4RIAAylMBlcskgfyHyKJTKFWqVFq9UaLXaXR6fQGQ1G40m01mzHmMEWy3Yq3WEEJYB2aD2+21J3Ol0+PwAjAA2B5PZIvRDDaNfWZ4Bt+CpA0EgcGQ6HkRAd2EXSfQZHqzW8YDeY76Bu8WECUgQOS8ADkAAFc1NDwW2p1ur1+mglis4MeANx+GaFJCgDFPcNgPB2hAWFYSAA"}
import { clamp, damp } from '@studiometa/js-toolkit/utils';
```

Test helpers live on `/test`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"bed011f8d337b03e1953da786de393a2f4346c5ec180b0f4533e15bfd01d7750","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALYRhaRvjTTWiXnDSl2YAObc1ABVIRp7ODAA8ACQAqAWQAyAUVYxpMMGgB8AHTDtpLAhSNBk5T0oQKAgRBEQQACUPWFIZZlIAa0EsXm00CF5mXgB3UmYsHFSAAyh2IiqKQork3ND83jR8GF5okUF3T0KwKBLmdlD+YL9O7pETILAPNDhcsDh2WFaOgoAjbtl5GBHmYfUYNDRXKAA6Pz8bLt5Sc8FSRZGYVwHQsw7H0vKlUaixIqRmaUy2QA5CsIMUpMYIGg1ONcitmH4NMwdq5ePgTlBcZNqgBHQRkDAAZU+MDEwUY3CqvBEbFY6NOqIyMBgWHRAjKOm+vAg/DOoLYmPYOO0OhWxWCGRl114SWYInwAmCvCq1347FIGhcbiWAGF8OxWFAmcUulJwXNApIljDhfC/DShb8bcw2o8aBpeIsjnBbmA/FUI8s/HM1qFEaEALyFYpjUIHTyMKEWWpEHo+5gAWgdCyWCZ8IBN4RopHLXgsAHoc14odwANzRyQB5BzQ6kAC6vCTOnOAElYycRPALJXe15MzPPGQoY1423wxHIliQkgAJxUVy6TpIACsVDQ6WHDHi6YY++0uEQAAYqOr0mrq7uAL4UdDYB8EYgyEiGh6CYNhOB4ARhDECQpHMC5XAZQxjFMcwLCICANl8fxHRCM4ENwKhejiEAAHVU14eQLV4GBQQwXgcGGGUwnkIYPjo9R1SOQQrhKLQaDxLheFYAkjlDe5HjAfo9gNQpnkDJE5J2cYylIeiCTk7pIFCHRyTgOBsSJFC/m6ORlg2GBlQAQQ7R1FkGG8Vn4YyiiqOxBHPcRJAAeR2cxSFBJkWVYVgdjVDJGhtdh1RM3gdmMYp/L8WAOFBWEpHGWF4U4rooB47oyhmMF8SkSRYtMERjHPOAMj+H0mkY2ARhmd0viWVtYvlTJYuLJ1BhmKQyRgPS0R6Mp7xGHZ6PBOAuLy1xUm0PwRMWYVSBSRoNKKFb9mYeihvJVZ2nBRZ6GFRZlUpApFnGLpUnxVhRTMd1IEEHQNTYJ01CKML5KqG0PBHQkYAZIKTieeAIFYEg4pgYlunBCA/LIUFBJWWiPD8Z4ghCI5Yo9JZNtOH70gRgIyGZcHnjQV4pD2NBim5O15WEk54GVAAxOoYCx8IoFhUVy1cX1ugxwZWAgCAchpt5GgGsaxjtR5Zty/KaxAZlANSIob2mfFQhZWbmFgFY8gKdULSgZ4wEabQACtaS8tY2N4AARby7D48Z2buMAHl+X5wS0d62kl1hNVSct7XmPqfhWbIXcyr3/U0nonXLZURzQPxA/+YxdG2KGI8KDoyjWcZYJdFosQEwAUAjObo/GAAABDgwFqvwU3GDmpjAT8/GuTdz23RAAEYADZ9w8HQj0QSfqAvc48Hgy5CJANuH2fEBXzKMQgLH8fPz7F9oH/AIcdCYAWM8RoV9xT9+RMXgoWbjRBFqExzmYes7bgAt8ihoqNA9Z/RoChK2SI7hzxIFAHQGg5dJB4F/iAT8n4gA"}
import { mount, settle } from '@studiometa/js-toolkit/test';
```

### One subpath per export

Every public export also has a subpath of its own — 197 of them. The barrel is convenient; the subpath is precise:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"927af6dca86d2630abb2ccaa0581588f6c37b88d0a3950bef59a36e86a8db688","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XgAMy6YAefTAvC6qgAyvxNKxWIw9gc0AB+RC8BFI1jSBbo7jYuFkIjsfhSXH1ViGbRmCzhOww+GImlOFxuPAAVVUvAiPjgbORvFUpHJlN4OFIvDRA3ivAAIjAQcwuqw0CJarLvLwAO5nFx6xK7VLpTLZPJUApFOClCrVWr1RrNNodbq9fqDYajcYlMUS+AlWEwanI+IFSysaazEDzRaIABsAEZVutNstTftDh4Q2Ho6dzohUyAbncHmRlm8Pjg8D9K7t/h4WBwuHwwRC0FDfMxrIwiGwujBsWAupYAEZkCi8SxnEdjyekaeWZi0ecTsjE3ijjekcxWGzMwS9rAc1zuEAAYSE1l4zF4A9YQ94ZzvvBS7BI0NIzDABxN1BmkgGRZGcVoEIUxRlJUNR1A0TQtO0nQ9H0lgDMwQyBMGXasHAJQrpsEZoFGADEx7WDGcx7AwxYAEwAMxpn+GaIAArFm6J4ORp6Fl8tHXLcP4Vk8ryxvw0BfCAB62PYwAOD4Lygpoli8AA5AAAshnpockDqwc6TQlMcqkANz7kysksqGwqsLwikgspamaR6qHoXpTrwWgwasnipnmYelncXZSlhE5WmubpMEeS62HsLhJTcaZTg6cwSCgLEYBwFCeCVCALwvEAA==="}
import { Base } from '@studiometa/js-toolkit/Base';
import { useScroll } from '@studiometa/js-toolkit/useScroll';
import { clamp } from '@studiometa/js-toolkit/utils/clamp';
```

Which one to reach for depends on how the code is delivered:

- **With a bundler**, prefer the barrel. Tree-shaking removes what you do not import, and the barrel keeps the import lines short.
- **From an ESM CDN, with no build step**, prefer the subpath. There is no bundler to shake the graph, so a barrel import downloads the barrel's whole module graph before the first line of your code runs.

The subpath layout is what keeps a dependency contained. `morphdom` is reachable through [`swap()`](/api/dom/swap.html) only, so a page that never swaps content never downloads it.

## No build step

v4 needs no compiler. Every decorator is sugar over a function that works without it, so a page loaded from an ESM CDN keeps the whole framework:

```html
<script type="module">
  import { Base } from 'https://esm.sh/@studiometa/js-toolkit@next/Base';
  import { registerComponent } from 'https://esm.sh/@studiometa/js-toolkit@next/registerComponent';

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
