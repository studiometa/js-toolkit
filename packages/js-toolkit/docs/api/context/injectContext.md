# injectContext

```ts
injectContext<T>(el: Element, key: ContextKey<T>): { promise: Promise<T>; cancel: () => void }
```

Asks the nearest provider for a value, once.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"d9ddb6a94a28816a7302f1d37139fefd08b93b0808a56d3fddf08591852e92fe","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAi1IgFsBLODETsACt36CAPGACuPAEZkAfJRBsAhqQaIAHFQA2MMAHM0+JAHYqaTcZjaQXXgNwG+YXIgAMVRvk3qjDTkugC+FOjYngTEZKo09EwsbOyM6mCMMPrCABQAlOwAvErsRBB8UKoaWkgAjFYghiZmSABs1rb2TOmZ+qr67p4+IH4BQXGI9eGROHiEJOTWdA456gPqcAXuAFYwQQDCLAlo0nKKpEo5WcIAooY8RmgU7ADWMBjCh2DHANLvpwplHlhMAADpgdiQzjiFzCMTOKSyQEXADc4KhqR613Y+SKJTKFTRYFC4L4PCwEC07B2ezQX2OqigEEYCEQIAASvAIPoSOwzDB2B5NPAOE4iBUYFBSmsZAKAGaU9gAAzeGCVz0gAHd2IrNfgjOx1NDiBLSOD1FgcJo4AA6dgAFXwAnYpBgAEdZSlnSwYABaOCENDCfnsOV8UgpdJwTVkdiCNBoQxwPn640SAXpKDg108WLJkOuj0im3g8GOgVOdNxmwYZM4MBQdzGdh6viGQUQY3i2Ckdh0ARoW3KtIZLL5JUumC5kj5/xocH1xsmSdFyMN9hM+AdsxNw1y4KGiFRmOkG3xdTGVnIZCNdwvVT4BNYOCIAD0r+2cF9aAg3JefDQX0iAAFhtNgZEbXh7HUG1YCIV8LT4V9mG+ZZXxpA4jmWG1Hx4PoAF18KoaptAAJj0RojFMcxJgAZg6Ug7AcDC6SwxI3A8JBhlGUhAmCJByOmagojmWJFmoZYklYDhsQACXtABZAAZO4p0eKobBqRBgNIgwqJaRBdOoToHCyfpBi43x/F48YQh0oTMFmNl5jiJZEjZFCUj+D52HpZZvIBc4VGIzTtGA9pKOaGj6OMxiujZbzzM47wrLGfjtNaUIiJGaBok8jhgDTFxnhHXp2FCIpqTAXZMNQ+grn0Z5vLyFFVAeGwkFAZYjDgPgWDwQcQFCUIgA"}
import { createContext, injectContext } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"38df78da63ca9f0a489c75f256c632998b5cdc60933b87191965b4052d475c5a","data":"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="}
import { Base, createContext, type Signal } from '@studiometa/js-toolkit';

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
