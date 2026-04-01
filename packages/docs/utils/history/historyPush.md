# historyPush

Push a new history state.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"09c6c7ee2e0714ad09038f5a15b29acc31e518560414c56fec046a7facdd79b8","data":"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"}
import { historyPush } from '@studiometa/js-toolkit/utils';

// Push a new state
historyPush({
  path: '/foo',
  search: { query: 'hello world' },
  hash: 'results',
});
// Old URL: /
// New URL: /foo?query=hello world#results

// Replace the current state
historyPush({
  path: '/foo',
  search: { query: 'hello world' },
  hash: 'results',
});
// Old URL: /
// New URL: /foo?query=hello world#results

// Replace only the hash
historyPush({ hash: 'hello-world' });
// Old URL: /
// New URL: /#hello-world

// For the search and hash options, falsy values can be used to delete things
historyPush({ hash: '' });
// Old URL: /#hello-world
// New URL: /
historyPush({ search: { query: false } });
// Old URL: /?query=foo&page=10#hello-world
// New URL: /?page=10#hello-world

// Complex values for the search are converted into URL params according to the way PHP parses theme into the `$_GET` variable.
historyPush({
  search: {
    array: [1, 2],
    object: {
      foo: 'foo',
      bar: { baz: 'bar' },
    },
  },
});
// Replaced value: ?array[0]=1&array[1]=2&object[foo]=foo&object[bar][baz]=bar
```

### Parameters

- `options.path` (`String`): the new path, defaults to `location.pathname`
- `options.search` (`Object`): the new search, defaults to the current URL params
- `options.hash` (`String`): the new hash, defaults to the current hash
- `data` (`Object`): The data attached to the new history state
- `title` (`String`): The title attached to the new history state

### Return value

- `void`: this function does not return any value
