# @inject

```ts
inject<T>(key: ContextKey<T>): ValueObserver<T | undefined>
```

Field sugar over [`$inject()`](/api/instance-methods.html#inject). **It asks once, at construction.**

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"ba9d337f5f3103b99658664499f1064e04785ee421835139e217d235ed12d90e","data":"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"}
import { Base, component, createContext, inject, type Signal } from '@studiometa/js-toolkit-v4';

const CountContext = createContext<Signal<number>>('count');
// ---cut---
@component({ name: 'Output' })
class Output extends Base {
  @inject(CountContext)
  count?: Signal<number>;

  mounted() {
    // The request may not have been answered yet.
    return this.count?.subscribe((value) => {
      this.$el.textContent = String(value);
    });
  }
}
```

The field type includes `undefined`, because the request is asynchronous and the value lands when a provider answers.

## When to use it, and when not

| Situation                                                      | Reach for                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------- |
| the value is there for the whole life of the instance          | `@inject`                                                  |
| the consumer must be able to wait through several mount cycles | `$inject()` from `mounted()`                               |
| the answer is optional and there is a fallback                 | `$injectSync()`                                            |
| the provider comes and goes                                    | [`subscribeContext()`](/api/context/subscribeContext.html) |

**`@inject` asks once, at construction.** `$inject()` from `mounted()` is unmount-scoped: `$unmount()` cancels the pending request, and a new mount asks again. That difference is the whole reason both exist.

## A plain field or an `accessor`

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"51216bb4327c9577ef1628320921a6533b4e40e6190d6d1a1abd84f2bca56fae","data":"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"}
import { Base, component, createContext, inject, type Signal } from '@studiometa/js-toolkit-v4';

const CountContext = createContext<Signal<number>>('count');
// ---cut---
@component({ name: 'Output' })
class Output extends Base {
  @inject(CountContext) a?: Signal<number>;
  @inject(CountContext) accessor b: Signal<number> | undefined;
}
```

## The function form

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

The `await` form has no `undefined` to handle, which is usually the better trade.
