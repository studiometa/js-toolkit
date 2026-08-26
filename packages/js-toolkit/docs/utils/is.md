# Type guards

```js twoslash
// @twoslash-cache: {"v":1,"hash":"ac88e268a6557d9104a05a72a0778b9d7d045b8ecb62a0354205547c6d006af9","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvdnAAiMfuzAwoAHgAqAPkZE2gmIl7reAH17DYi5VG6HdrfdLhGAOmHYBbLBFJon8qxVKECgIEQREEAB1fBg0WNJeZl57RxkksAx4pQBzXgAjQT8AAwsFJRVigDpgtGYciORkEA4wAGtg/DQ0LDhEAHp+gCs4AFo0CAhWNvY0UaIAFiq4NEEoCQ845irYIn6i9lY4fpkqro9WAGIZSwqoEABdB6oV5l8kAE4qVhgwHPjPlQ6qQcnE8DIAndgq1cIgAAxUET4N7MMRkT4AXwo6GwsIIxHRQLoDEiLA4XD4QlE4kkTgAcoIPPkyDo9AZzO1IAB3MC2FJspy8MCM5mkNyeby+ekiwkhMIRaKxeJkJL8hwwQXJYVMsgUXjFOnMOnFXh0EQOWBQGpA+qNZqtDpULo9PqDEbjSbTWbzJYrNYbLY7GB7A5HE5wM5oC7XODa0WPZ4gV7vRAAJgRLV+/3wSAAHDaQWDIjIGTryN8KkgM0iUWjyGm4VicTg8IQSOXqMSmGxODwBMIxBIpDIAPL5IYwMSs9WGYRtbm8uwC9IAJUnPjUK1IuT1c4XmnFXh8flH48nDCooXCeBicQSqtSGvSySwrGYSl4EDPYkMzCkb1IZgMD1ZJilkZgaGKEDeFkEcAFkhWgDU/ygfVhVYVhijcN5kIw01aHNNYVCqNw3HUWJeDqPJ0lIGBmFQ+JSAgQQcnwfUxwnMQqiwJiJkwHAoN4OAIAyT9vz8LlZjYyBeB4iA+NxbCwDgLkyGcJQVjo1CIH4Sj8CYyS/k/f9eA8GQ4FyfUJgAZTQbc/mqWpbSQJoWiUR0CG6XoBmGMYJimGY5kWZZVnWCBNjqIMQ3EMNTnOK4ZC/TiGCeF5gRJABmDMfj+AFEHzag3lBEkQFPZLoUreFEWRQC6yQLKm2oXFWwJDsaHobtyT7KlB1pGRbPsnJp30WdOQgHk+UfQUt1yQ9JRPOABtyYIrwVW9lUSZIpufIS7Nya1CoaFz7XczovNdXyPQC71gr9MKIu2XZ9hi444qjBK4Bmv4EzSt4SQWbKszygrgWK8FFr276K2UKtqtrGh6wBjFExEJDwSPKVgH8cprD1EsZVIPG4A488iaWoyMQEJiPF4AByAABO6AzqS7/K9NBnsOOBaYAbmCB6kFAYlfgsyQ8BGEAMQxIA=="}
import { isDefined, isNumber, isObject, isString } from '@studiometa/js-toolkit/utils';
```

Each one narrows the type.

[[toc]]

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"72723df3b8516208f04e145a646e3dd12af84b134366c17c68c444223860828f","data":"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"}
import { isDefined, isObject, isString } from '@studiometa/js-toolkit/utils';

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
