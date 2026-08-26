# History

```js twoslash
// @twoslash-cache: {"v":1,"hash":"79b6cab6ca859ba2309b104e9d055e8736d9de1a9932df6e128f4a4fa053cba7","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvfOzhoIpDAAVBcfIwhZxkuIl4AJWfMUB5LRLBwKvKMzTMA/HuEBrSAHcw18WlYwnvHKk7GAA5tx6RBDsUAA6YOwAtlgKaNJGCsqq+JQgUBAiCIggKmq8zLxgMO7pcpm8MGBoigIKvGj4MLyh7CRSAKoASgAyvFjMpGhwAHS5chMMiACMS1R+YR1IK1T2pKEwiwQZiqU5ayG4y1Qi+BPMYmRIAEwAvhTo2JcExI87dIcsDhcPhCUTaKQyOqKQYwLCse4wDTmHR6QxQjBmcFWGx2RzOMBuCCebzsXz+PRBELhSLROIJZKpWrGDAwuEI3L5Qp4VnwkRdDpdESCUikRppSHMhpNFruUn4dqdbq9Rq8IajcaTGZzXaLJ4ANjWjVCm2WABYdhN9ocJZkeezzlVntdbqR7jRyIhXu9qJ88IQSOQ/vQmGxODwBMIxBZeBAAEYAKxgYgAKhA1QBlGATG5KO6JOAaBNJtB6GEiBRQAA8lLC1kz2fwuddiQAkmAsII0AA+aywfjMQSsND10g3AI16mqkYjnN5uDxJIpSYxosptPTrOjxtzjkFIogADCkgDaWYUjjibE7QgvAABhnN7Pm3Bb9YfqQFYLhaKmoFH/LYwwGwYH7Qc0FmC1QiKZBkBAOhmGSPxclvFD43nSBVzQVMHwbJsEILYABHYIcyF0XhCPLVgFD0AByUUoBo3gXiY6waJo7hpnkdNmipRhuAAbniAB6ISiJI0g4AAUgAVgAIUohQZIAEQAXno+IUNvEAAF1tKoeZJiQU1zRAdZjRyT0AGYLT2A48AvYtsI3XCdwdS5rJAG47geD1Xj0zzoC+RdGWAeJeCZTJTgoMKIuhWFeRgaKpBXS8sPXYYZ23Z8kuY/hSAgRJeBogABORBCgCREgOZghLQgBaeQIFYFxSTqohTSEztiLgGj+NyKr7CQUB/kaOALDwNCQBeF4gA"}
import {
  historyPush,
  historyReplace,
  objectToURLSearchParams,
} from '@studiometa/js-toolkit-v4/utils';
```

## `historyPush` and `historyReplace`

```ts
historyPush(options: HistoryOptions, data?: unknown, title?: string): void
historyReplace(options: HistoryOptions, data?: unknown, title?: string): void
```

```ts
interface HistoryOptions {
  path?: string;
  search?: URLSearchParams | Record<string, SearchParamInput>;
  hash?: string;
}
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"1c4232b87df279fc3201f1da1afb7ef4e0fa5b9c755d8f52a170390ec908e116","data":"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"}
import { historyPush, historyReplace } from '@studiometa/js-toolkit-v4/utils';

historyPush({ path: '/products', search: { page: 2, sort: 'price' } });
historyReplace({ search: { page: 3 } });
historyPush({ hash: 'section-2' });
```

**Each part is optional, and an omitted part is kept.** `historyReplace({ search })` keeps the path and the hash; `historyPush({ hash })` keeps the path and the query string.

That is the whole reason these exist over `history.pushState()`: rebuilding a URL from `location` by hand is where a filter update loses the hash, or a hash update drops the query string.

| Function           | Effect                   |
| ------------------ | ------------------------ |
| `historyPush()`    | adds a history entry     |
| `historyReplace()` | replaces the current one |

`push` is what makes a state navigable with the back button. `replace` is what keeps a scroll position or a tab index out of the history.

## `objectToURLSearchParams`

```ts
objectToURLSearchParams(object: Record<string, SearchParamInput>, defaultSearch?: string): URLSearchParams
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"009d3bb3de6ffe396275dc7e0cde1cb81e11d624db2d0d490515e132117d6262","data":"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="}
import { objectToURLSearchParams } from '@studiometa/js-toolkit-v4/utils';

objectToURLSearchParams({ page: 2, tags: ['a', 'b'], open: true });
objectToURLSearchParams({ page: 2 }, location.search);
```

`SearchParamInput` accepts a string, a number, a boolean, `null`, `undefined`, an array of those, or a nested object of those — so a filter state serializes without being flattened first.

`defaultSearch` is the starting point, so the result **merges into** an existing query string instead of replacing it.

## See also

For a URL that is also a store you can read, write and observe, use [`createUrlSearchParamsStorage()`](/api/storage/presets.html) — it is these functions behind a typed key-value surface, with `popstate` wired up.
