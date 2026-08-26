# Type guards

```js twoslash
// @twoslash-cache: {"v":1,"hash":"fff64dc38ec3510e8eb8b7bc77cd7780456c0f99a592b13bb88facebcd7203f3","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvdnAAiMfuzAwoAHgAqAPkZE2gmIl7reAH17DYi5VG6HdrfdLhGAOmHYBbLBFJon8qxVKECgIEQREEAB1fBg0WNJeZl57RxkksAx4pQBzXgAjQT8AAwsFJRVigDpguDRmXyQATipWGDAc+OaqetIcuLwZAIqoYI5lJAAGKhF8BuYxMmaAXwp0bFxIwhJyHroGSJYOLj4hUXFJJwA5QQ98sh09A3MwAGtIAHcwWxSnp14wLd7qQ3J5vL5rkCllRQuE8DE4gkkr8HDB/slAXcyBReMUrswrsVeHQRA5YFAalQ6g0DgAmaYgNodLqIAAcPQa/QOIBkNyxu0ZFSmMzmpAWNHIiHpq3WODw22h1H2TDYnB4AmEYgkUhkAHl8gArGBiR6owzCd4QL4/VJo9IAJWNPjUdVIuRxFs+YE0oK8Pj8esNxoYMLCEWisXiZGRtvRvCwrGYSl4ECDYkMzCkDTFGBxyWKsmYNGKed4sl1AFkAdA0ZmoLjAaxWMU3A1a03ibRSYJyVU3G51LFePU8ulSDBmPX4qQIIIcvhcfqjWIqlgZ2gIJgcCXeHAIBkU2m/B92PFq/H15uNq2wHAPmRnEo6hP6xB+MP8DOTx0U1neB4ZDgXJcQ3ABlNA3Q6apal6A4AGYGSZTp8CQdlqE5AZIkDZcQ0FCZEAZWZ5kWSUEJlagNnlYhFRoegVWOdUzi1S4ZHAyCclNfRzTeL0bT+dJXVyX1wQDOA2NyYJYXDBEo0SZJY3SZJBI6SkQGpRpEAAFkQ9pkNQjk+kwnkxIgiTWiFAiRWIiUkG05YAF0ZhrQY/QhYB/HKawcV5KFSG8uAl2DfzxJ/ZYBBnDxeAAcgAATqHsJA8OJmAAegNOAAFoNwgVhXlPDKiE0lKinYVg4CigBuYIkvqJBQH2dogMkPB0pAZZliAA==="}
import { isDefined, isNumber, isObject, isString } from '@studiometa/js-toolkit-v4/utils';
```

Each one narrows the type.

| Function            | Signature                                  |
| ------------------- | ------------------------------------------ |
| `isNull(value)`     | `value is null`                            |
| `isDefined(value)`  | `value is T` — for `T \| undefined`        |
| `isString(value)`   | `value is string`                          |
| `isNumber(value)`   | `value is number`                          |
| `isBoolean(value)`  | `value is boolean`                         |
| `isFunction(value)` | `value is (...args: unknown[]) => unknown` |
| `isObject(value)`   | `value is Record<string, unknown>`         |

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

## `isNumber` rejects `NaN`

```js
isNumber(NaN); // false
```

Because a `NaN` that passes a number check is a bug that surfaces three functions later.

## What is not here

| Not shipped     | Write                               |
| --------------- | ----------------------------------- |
| `isArray`       | `Array.isArray(value)`              |
| `isEmpty`       | the check the caller actually means |
| `isEmptyString` | `value === ''`                      |
| `isDev`         | your bundler's own flag             |

A guard earns its place by narrowing something the platform does not, or by being a predicate you pass by reference.
