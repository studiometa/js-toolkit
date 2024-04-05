# historyPush

Push a new history state.

## Usage

```js
import { historyPush } from '@studiometa/js-toolkit/utils';

// Push a new state
historyPush({ path: '/foo', search: { query: 'hello world' }, hash: 'results' });
// Old URL: /
// New URL: /foo?query=hello world#results

// Replace the current state
historyPush({ path: '/foo', search: { query: 'hello world' }, hash: 'results' });
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
historyPush({ search: { query: null } });
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
