# history

Helpers to interact with the [History API](http://developer.mozilla.org/en-US/docs/Web/API/History_API). The two `push` and `replace` functions allow you to replace parts of the current URL with the History API by merging the given options with the current URL, avoiding the need for complex merging strategies.

**Parameters**

- `options.path` (`String`): the new path, defaults to `location.pathname`
- `options.search` (`Object`): the new search, defaults to the current URL params
- `options.hash` (`String`): the new hash, defaults to the current hash
- `data` (`Object`): The data attached to the new history state
- `title` (`String`): The title attached to the new history state

**Usage**

```js
import { push, replace } from '@studiometa/js-toolkit/utils/history';

// Push a new state
push({ path: '/foo', search: { query: 'hello world' }, hash: 'results' });
// Old URL: /
// New URL: /foo?query=hello world#results

// Replace the current state
replace({ path: '/foo', search: { query: 'hello world' }, hash: 'results' });
// Old URL: /
// New URL: /foo?query=hello world#results

// Replace only the hash
replace({ hash: 'hello-world' });
// Old URL: /
// New URL: /#hello-world

// For the search and hash options, falsy values can be used to delete things
replace({ hash: '' });
// Old URL: /#hello-world
// New URL: /
replace({ search: { query: false } });
// Old URL: /?query=foo&page=10#hello-world
// New URL: /?page=10#hello-world

// Complex values for the search are converted into URL params according to the way PHP parses theme into the `$_GET` variable.
replace({
  search: {
    array: [1, 2],
    object: {
      foo: 'foo',
      bar: { baz: 'bar' }
    }
  }
});
// Replaced value: ?array[0]=1&array[1]=2&object[foo]=foo&object[bar][baz]=bar
```
