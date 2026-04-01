# historyReplace

Replace the current history state.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"0ec4f56fdb4e541bc4e1488db203253d02b9ceb5347f6fe33ac964e84d15be02","data":"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"}
import { historyReplace } from '@studiometa/js-toolkit/utils';

// Push a new state
historyReplace({
  path: '/foo',
  search: { query: 'hello world' },
  hash: 'results',
});
// Old URL: /
// New URL: /foo?query=hello world#results

// Replace the current state
historyReplace({
  path: '/foo',
  search: { query: 'hello world' },
  hash: 'results',
});
// Old URL: /
// New URL: /foo?query=hello world#results

// Replace only the hash
historyReplace({ hash: 'hello-world' });
// Old URL: /
// New URL: /#hello-world

// For the search and hash options, falsy values can be used to delete things
historyReplace({ hash: '' });
// Old URL: /#hello-world
// New URL: /
historyReplace({ search: { query: false } });
// Old URL: /?query=foo&page=10#hello-world
// New URL: /?page=10#hello-world

// Complex values for the search are converted into URL params according to the way PHP parses theme into the `$_GET` variable.
historyReplace({
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
