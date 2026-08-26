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
// @twoslash-cache: {"v":1,"hash":"51216bb4327c9577ef1628320921a6533b4e40e6190d6d1a1abd84f2bca56fae","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCAFssEMDDBpGgsADN2Ac0S8AQlxgBhMfIXdlAHgAqvOjTBQ4q9VrBw0pAK780EUgD5GRNg5jLDFATEaemUNVi44ABEYQVJmF1IbYLQjNz4AXjdeIgh2KAAdMHYRVzRAkvFJShAoCH4ERBAAZRgytHwYctFKspkdXmZzXlIYBXY7Ml52zv5wuEsAdw6wXnYy8d5YeXEoADpqu2ZSBkQARipWCQV2pABOKjQjhVa8QQqJBgv2cSQABip+PgjsxnGQkKcAL4UdDYXCNQgkcgPUxMLCkCA4Y4YPhqOCabSKXZgZhCXy8Oykb4KA6PY7ggDMFyuN0QABYHk8Xo1iaTqhwfoh/iBAcDQeQzvSoTCcHgEWDkfRXnNLAB5BxoLDqmlHE70gDsTLA13wSAAbBzSM8TiA1RqtV8BedhUC4mKzVLqLDZcR5dQUY0WBwuHxZhErHijCZ6BILOGYAAFdFYSzpOOJjFwNyFYqiY5x7V0xAAVgATIbjUh2dROdbcbgHXCnSLXTRxSXIdDPTL4T6kX7FQG2JweKswAArGIpJqKYmsfRgBxCABGZDcHgA1jAMKEgqYANJb/TThSz+eLlfuNLKABq3hgKqXeNIiKPM7YZ+Xq94AB9eA5zDA2wwFAWZFCUebfBOzjVLU9R4AASvAECsCQUwdLw4hHPAZRosQeTAdkd6ji4aGdLAsTxAR8gwKwey8IY6HUbR5KPBglgAAb/ls3zAexf6SOwrDDEhrDquwYi7IUiFwMhYliCxOqWGI/CdPEgS2PYThoOJKyDFAmwQPAGEQGUIyHHmzCyK2mzYY4zg6fsVDmScppliAlxGiy5rVpaXIgJBk58jxSBuc2IKtkgkqdpg3YEL21TJK8Yh2LwWj/mgSSmDukj7oex6ngun6XgWLn3O5zImmcbm0laeBpZImWKg2IUAi64VgmcvwejFcJxYiCX+iAjC4ZimB8LampoLszAAPzKPl76FReWS/lxgE8VAJVIAAHIy5WeZVTo1X5zBBQKoVtW6iAlqy3Vej2/UKtagbDnw3ytrIIKdAtc7GKm/7rpACxgKBOalLwP0wXUDQgAAgsJ4XsKhXiiZ0CxrPg5IYGAgLopADiWHADiPvwlJYNpyWOSAzk7Qa+0Vog3nHdakPNddrWihF13bXdsVyn2iWDkGI4Bc4r4not56rhuW7ZckB4YOLBVS5eei8LeqMPk+L4/R+y0/vx3E7KD4HrOOgVULBMPSchqHTBhMBYSluFEPh+koz4xEQKRNkUTQ+lMXRDGdIHClsbwnEAUBUB8elgnCTJokU2AklgDbSc6QpxxKTjqm9Mlmn2fJekGUZkCmdhOoDFZkywBSWkOVtnXeR5DNMzWeCi587nBYge1hVdUXSr1/MDQOwoF6lEDpY1aBy7liu60t0tN6cpx7a3LKnNVHeNPVGW7k1PcCv3l1c6cXXRfdfW+oLQ0gip8yuON6qTbsS7zW+c7L+4BtrdHq96QtwquCC0tVGhLjOnCU+nMOr0iHl2Ee8UnpMCHMGYiZBPoqQhl/SM/0wCAwgMDE2uYyisxqNDPA8MRiI2RkRdG7QsY43wHjaehNiZwFJuwcmOk4BUxphKMqm9Krt18izL+UDIocxbHA00EIAC6AJoC9QAAJvG6B8RgwAMIkjJAAcgmuqPRvAITcEKKGeYvBDFlFMDGSwdZeDAEKLwXgKiu6MH3rPPgs1P4S2/irNwABuZxrj3GeMPmgbx/BH4yVILwD+OC/F6y/KtKOG1glgAhNUUkjwkCgFsbYHSeA0AIAhBCIAA"}
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
