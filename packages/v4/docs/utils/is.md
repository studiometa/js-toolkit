# Type guards

```js twoslash
// @twoslash-cache: {"v":1,"hash":"fff64dc38ec3510e8eb8b7bc77cd7780456c0f99a592b13bb88facebcd7203f3","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvdnAAiMfuzAwoAHgAqAPkZE2gmIl7reAH17DYi5VG6HdrfdLhGAOmHYBbLBFJon8qxVKECgIEQREEAB1fBg0WNJeZl57RxkksAx4pQBzXgAjQT8AAwsFJRVigDpgtGYciORkEA4wAGtg/DQ0LDhEAHp+gCs4AFo0CAhWNvY0UaIAFiq4NEEoCQ845irYIn6i9lY4fpkqro9WAGIZSwqoEABdB6oV5l8kAE4qVhgwHPjPlQ6qQcnE8DIAndgq1cIgAAxUET4N7MMRkT4AXwo6GwsIIxHRQLoDEiLA4XD4QlE4kkTgAcoIPPkyDo9AZzO1IAB3MC2FJspy8MCM5mkNyeby+ekiwkhMIRaKxeJkJL8hwwQXJYVMsgUXjFOnMOnFXh0EQOWBQGpA+qNZqtDpULo9PqDEbjSbTWbzJYrNYbLY7GB7A5HE5wM5oC7XODa0WPZ4gV7vRAAJgRLV+/3wSAAHDaQWDIjIGTryN8KkgM0iUWjyGm4VicTg8IQSOXqMSmGxODwBMIxBIpDIAPL5IYwMSs9WGYRtbm8uwC9IAJUnPjUK1IuT1c4XmnFXh8flH48nDCooXCeBicQSqtSGvSySwrGYSl4EDPYkMzCkb1IZgMD1ZJilkZgaGKEDeFkEcAFkhWgDU/ygfVhVYVhijcN5kIw01aHNNYVCqNw3HUWJeDqPJ0lIGBmFQ+JSAgQQcnwfUxwnMQqiwJiJkwHAoN4OAIAyT9vz8LlZjYyBeB4iA+NxbCwDgLkyGcJQVjo1CIH4Sj8CYyS/k/f9eA8GQ4FyfUJgAZTQbc/mqWpbSQJoWiUR0CG6XoBmGMYJimGY5kWZZVnWCBNjqIMQ3EMNTnOK4ZC/TiGCeF5gRJABmDMfj+AFEHzag3lBEkQFPZLoUreFEWRQC6yQLKm2oXFWwJDsaHobtyT7KlB1pGRbPsnJp30WdOQgHk+UfQUt1yQ9JRPOABtyYIrwVW9lUSZIpufIS7Nya1CoaFz7XczovNdXyPQC71gr9MKIu2XZ9hi444qjBK4Bmv4EzSt4SQWbKszygrgWK8FFr276K2UKtqtrGh6wBjFExEJDwSPKVgH8cprD1EsZVIPG4A488iaWoyMQEJiPF4AByAABO6AzqS7/K9IKFmew44FpgBuYIHqQUBiV+CzJDwEYQAxDEgA"}
import { isDefined, isNumber, isObject, isString } from '@studiometa/js-toolkit-v4/utils';
```

Each one narrows the type.

[[toc]]

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"5a88be95fd50c88040bc4d208c4c4f6f6e1e8cb73cb83b3f689cdc32acd97658","data":"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"}
import { isDefined, isObject, isString } from '@studiometa/js-toolkit-v4/utils';

function label(value: unknown): string {
  if (isString(value)) return value; // string
  if (isObject(value)) return JSON.stringify(value); // Record<string, unknown>
  return '';
}

function first<T>(items: (T | undefined)[]): T[] {
  return items.filter(isDefined); // T[]
}
```

`isDefined` as a `filter` predicate is the case that earns the export: it is the one narrowing TypeScript will not do from a truthiness check.

## The guards

### isNull

```ts
isNull(value: unknown): value is null
```

### isDefined

```ts
isDefined<T>(value: T | undefined): value is T
```

Narrows `T | undefined` to `T`. Passing it by reference to `filter` is what it is for.

### isString

```ts
isString(value: unknown): value is string
```

### isNumber

```ts
isNumber(value: unknown): value is number
```

**It rejects `NaN`**, because a `NaN` that passes a number check is a bug that surfaces three functions later.

### isBoolean

```ts
isBoolean(value: unknown): value is boolean
```

### isFunction

```ts
isFunction(value: unknown): value is (...args: unknown[]) => unknown
```

### isObject

```ts
isObject(value: unknown): value is Record<string, unknown>
```

## What is not here

| Not shipped     | Write                               |
| --------------- | ----------------------------------- |
| `isArray`       | `Array.isArray(value)`              |
| `isEmpty`       | the check the caller actually means |
| `isEmptyString` | `value === ''`                      |
| `isDev`         | your bundler's own flag             |

A guard earns its place by narrowing something the platform does not, or by being a predicate you pass by reference.
