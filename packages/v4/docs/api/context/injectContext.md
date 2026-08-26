# injectContext

```ts
injectContext<T>(el: Element, key: ContextKey<T>): { promise: Promise<T>; cancel: () => void }
```

Asks the nearest provider for a value, once.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"1a3d045e1721b371559044ab01033b094d33a0fdec51f4bdc6f0c345fdb20cf5","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAi1IgFsBLODETsACt36CAPGACuPAEZkAfJRBsAhqQaIAHFQA2MMAHM0+JAHYqaTcZjaQXXgNwG+YXIgAMVRvk3qjDTkugC+FOjYngTEZKo09EwsbOyM6mCMMPrCABQAlOwAvErsRBB8UKoaWkgAjFYghiZmSABs1rb2TOmZ+qr67p4+IH4BQXGI9eGROHiEJOTWdA456gPqcAXuAFYwQQDCLAlo0nKKpEo5WcIAooY8RmgU7ADWMBjCh2DHANLvpwplHlhMAADpgdiQzjiFzCMTOKSyQEXADc4KhqR613Y+SKJTKFTRYFC4L4PCwEC07B2ezQX2OqigEEYCEQIAASvAIPoSOwzDB2B5NPAOE4iBUYFBSmsZAKAGaU9gAAzeGCVz0gAHd2IrNfgjOx1NDiBLSOD1FgcJo4AA6dgAFXwAnYpBgAEdZSlnSwYABaOCENDCfnsOV8UgpdJwTVkdiCNBoQxwPn640SAXpKDg108WLJkOuj0im3g8GOgVOdNxmwYZM4MBQdzGdh6viGQUQY3i2Ckdh0ARoW3KtIZLL5JUumC5kj5/xocH1xsmSdFyMN9hM+AdsxNw1y4KGiFRmOkG1VGw1RAAJj0jSMpnMkwAzB1SHYHDSDkdlv1BkhhqMpCBMESA3tM1BRHMsSLNQP5sswrAcNiAAS9oALIADJ3FOjznpo2gACxXgY94tNer7vngWS/h4/6+P4QHjCERHgZgsxsvMcRLIk8HJBwfwfOw9LLAJALnCoVDVIR7R3s0j4vtQnQOAJNFDPRYwgYgBGtKEAC6vjQNECEpMAaYuM8I69OwoRFNSYC7F+3zLFc+jPAJeQoqoDw2EgoDLEYcB8CweCDiAoShEAA==="}
import { createContext, injectContext } from '@studiometa/js-toolkit-v4';

const Key = createContext<number>('answer');
const el = document.body;
// ---cut---
const { promise, cancel } = injectContext(el, Key);
```

**Return value**

- `promise` — resolves with the nearest provided value.
- `cancel` — withdraws the request.

## It never settles when nothing provides

**A missing provider means "not yet", not "no".** The request stays pending, and it resolves when a provider appears and replays it — which is what makes mount order irrelevant.

If you need an answer now, or none, use [`injectContextSync()`](./injectContextSync.html).

## From a component

`$inject()` is the same call with the element filled in, and it returns the promise directly:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"e3403a50c1bd8d48de05417e30ab3d64cc7baa937733a37cc1f76c5ad65c6a9b","data":"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="}
import { Base, createContext, type Signal } from '@studiometa/js-toolkit-v4';

const CountContext = createContext<Signal<number>>('count');
// ---cut---
class Output extends Base {
  static config = { name: 'Output' };

  async mounted() {
    const count = await this.$inject(CountContext);
    return count.subscribe((value) => {
      this.$el.textContent = String(value);
    });
  }
}
```

::: tip The pending request is unmount-scoped
`$unmount()` cancels it, and a new mount runs `mounted()` again and asks again. That is why `mounted()` is the right place: a component that outlives several cycles asks once per cycle, and never holds a request for a scope it has left.
:::

The [`@inject`](/api/decorators/inject.html) field decorator asks once, at construction, instead.

## It is one-shot

`injectContext()` and `$inject()` resolve with the **first** answer and stop. To follow providers as they come and go, use [`subscribeContext()`](./subscribeContext.html).
