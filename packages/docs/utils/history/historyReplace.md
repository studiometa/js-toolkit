# historyReplace

Replace the current history state.

## Usage

```js
import { historyReplace } from '@studiometa/js-toolkit/utils';

// Push a new state
historyReplace({ path: '/foo', search: { query: 'hello world' }, hash: 'results' });
// Old URL: /
// New URL: /foo?query=hello world#results

// Replace the current state
historyReplace({ path: '/foo', search: { query: 'hello world' }, hash: 'results' });
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
