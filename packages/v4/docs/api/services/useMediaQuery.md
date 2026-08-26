# useMediaQuery

```ts
useMediaQuery(query: string): Service<{ readonly matches: boolean }>
```

The `matchMedia` engine, exposed. One instance per query string.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"1707a68e02a4c3c3038de76b7a5f404b5308c3d7c0567f1b73307a3ccd833e31","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvQXBgBZGFE4BFQWQyMAjmtIZEvOGlLswAc276AymSLsRMADwKlzVeoAKpCFjgA+ADpg7AC2WBCkaNKyzio6GJQgUBAiCIggAKqyvJIwBvjMpIoGNna5OKS8kKTBbOwAXkXBipy82uoAdAmGBQyIAJxUrDBmaPhIAIwAzFRoBaYwvSAy8s2ucQkcYLiIAAxUIvmkzGJkSH0AvhTo2NsExKczdIsikoa8AO7ssFYl9k6rbl0nm8cAovCIEC+vi6swiSAAbPDBsNTKMkAAWGZzBZ4T6wDYmbYAJn2h2ONHIiHhl2uODwhBI5Ee9CYtS4fGWMTW6i0cX0hmMZgsvGspFsfy5gIwwJ8ASCoXCkU5APWVCSKTwmVyOTyBSKsjFpV45Uq4RqHAaUF4TRcrTinSo3ThiAA7NMQEMRmNEFMsaR5otlS4pQStkgSSADgVyacfZMadQbvT7kzqE88C8wG88TAfoaJSqPF4fGCIVCYT1wztxsivRi/QHcV9cINCUgAKyk6MnSnohOYOlpBkPNMstKMJqjaB8UXixySuIy0HgyFQXztLDFuCMYULosghLq1IgABKC0EpCkIgvhTAkU3II+7CngkicEEACM4CJjB+TKZ2l4AAVfBcjgQ4iggD8ACsYDEXgRGYKQP21Rl3mMNAaCkSReFGXItnoaQsCgZgaAAbgQ7wMHBNg1DgXD8kiYIZHvMg4HYQwHRAJ1eiJHYkQ9FE0UQTtqGxRYHx8UNtlEqMjh7M5+yTIcUwSGgxxARhJLITA+D3IEt3aGo0AOeB9A/CAICGJDD2SY8AHVQLwio8LtdRrVI0z6Mgd4uJ48NxkxQS61dBscTSYyvOkjsu3kikJhdJTBzuRk1PTNJMzeYR3y/H92BQ/R0izT9v1/FtuNhXj0RrYLUW9cYathRs0mykq8pQ6L+limNKWpK5E2S4dU3U55XkiHM8znf5g0XLdS1XaFHUq8N21Ez06vrMT/XCkAc06gZIzJBTED4pLbiGtKNInBZCCgGdfnnQsDJBeaoXaHLSvymBGEQ1hWA/Y4AGtJtKABhNh/qB6bYn3EsVyhMFvHEV4AH4rDasqAHksGRrNhSKj72vKo88EsDGvtwiAGLAh6wR4/9eGfRn+EZ8auFNSJSGEIIzC42ZTFSZBkBAQo0AvLMEgJ8mUMAkCafzMC0EfT5RlZ+jWC4N9pbIToAF1daWysTvhPZauEg6mp2wmyv27rjqJdszuTVLmUWLTo0nMg+Ei0C4HMyzrLAWyNTSRybrIam3N0DyTN901fIrZ0iTdWsNtCrbmpAH34Ftw7u3ixBJgADidlSXdHRYiAKSisys3NeFB1468T3i+hq9bhJdMLRtroZOvGU25J68NS5SkcRqYSdbr4Rve5gdpWAgUxGHaVeSNmfQkIwZBdeFMsoGD485d4AAqE+AANMrrhel53c+z4MWZxBEa0bugbJXywV96OYV+4DgZg8xKaRyvkMdogRAjIDkAAEQAHK8DPPwMgwx7C60YPgTCPhEAAHpsGwBIIvcoRkIB1HYH9Zg7RwimDwXZbB9kYAfmwQAQXcAASWwaAmA2DF6mAAPrdGftwFu4Y+gHQ7t6d0ltFg8P7oPI6BcB6jwuq7JgWAPYLC9jHLy/s642TVHZPAYdnKRzaNHbO3kIAJ0Ns6SYOx3TiKQF3DOO1zGyLtgovsBtIzQFuCEMIEReDACiCsGa7lzgCC8MEXgAByAAAoYQQSgICTmYNg6CcAAC0SsrKA2fBkog6JolkQgaIMaT5YC8AALzBP0hoaJE4TAZLxKMfQ8J0SFGCNwaJ3BilgECLg3g59JLbm4OfXgSE4DvDYk+VWkADDkxxhIMAYIUKIWWOMuAuSzDjN4LUgAMhxSIHEdmFGYFAcBQQWaMBzBuLcO4jKeV9nwYAgReC8AGYAMgJAjnBKZlJUxVcplSqeU+e1svqMEYEE8xvBzh8Eqb4QJrya5wGvjwicjz4A9O+T0hIKSkCgCeMMdikg8DpJAOcc4QA=="}
import { useMediaQuery } from '@studiometa/js-toolkit-v4';

const wide = useMediaQuery('(min-width: 64rem)');

// `props()` answers with no subscription, because asking a MediaQueryList is a read.
if (wide.props().matches) {
  // …
}

const unsubscribe = wide.subscribe(({ matches }) => {
  console.log(matches);
});
```

**Parameters**

- `query` — any media query string.

## `props()` needs no subscription

Asking a `MediaQueryList` whether it matches **is a read**, so this service can answer without starting anything. Emissions are crossings.

That makes it the one service where `props()` outside a subscription is not a compromise.

## Where it is used

`data-mount="media:<query>"` is this service, which is why that strategy is **reversible**: a crossing out unmounts the instance and a crossing back mounts it again.

See [Mount strategies](/guide/going-further/mount-strategies.html).

## See also

- [`usePrefersReducedMotion()`](./usePrefersReducedMotion.html) — the named case
- [`useBreakpoint()`](./useBreakpoint.html) — the named breakpoint set
