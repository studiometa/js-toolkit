---
outline: deep
---

# queryComponent

Use the `queryComponent` function to get the first instance of a component matching a given query. Use `queryComponentAll` to get all matching instances.

## Usage

```js twoslash
import { queryComponent, queryComponentAll } from '@studiometa/js-toolkit';

// Get the first instance of component with `config.name === 'Foo'`
const foo = queryComponent('Foo');

// Get all instances of component with `config.name === 'Foo'`
const allFoos = queryComponentAll('Foo');
```

### CSS selector filtering

You can filter by CSS selector by appending it in parentheses:

```js twoslash
import { queryComponent } from '@studiometa/js-toolkit';

// Get the first instance of 'Foo' with a CSS class `.sidebar`
const sidebarFoo = queryComponent('Foo(.sidebar)');

// Get the first instance of 'Foo' with an id `#main`
const mainFoo = queryComponent('Foo(#main)');
```

### State filtering

You can filter by component state using `:mounted`, `:destroyed`, or `:terminated`:

```js twoslash
import { queryComponent } from '@studiometa/js-toolkit';

// Get the first mounted instance of 'Foo'
const mountedFoo = queryComponent('Foo:mounted');

// Get the first destroyed instance of 'Foo'
const destroyedFoo = queryComponent('Foo:destroyed');
```

### Scoped search

By default, the search is performed on the entire document. Use the `from` option to limit the scope:

```js twoslash
import { Base, queryComponentAll } from '@studiometa/js-toolkit';

class Parent extends Base {
  static config = {
    name: 'Parent',
  };

  mounted() {
    // Only get Foo instances inside this component's element
    const foos = queryComponentAll('Foo', { from: this.$el });
  }
}
```

## `queryComponent`

**Parameters**

- `query` (`string`): a query string in the format `ComponentName(.cssSelector):state`
- `options` (`{ from?: HTMLElement | Document }`): optional scope for the search (defaults to `document`)

**Return value**

- `Base | undefined`: the first matching instance, or `undefined` if none found

## `queryComponentAll`

**Parameters**

- `query` (`string`): a query string in the format `ComponentName(.cssSelector):state`
- `options` (`{ from?: HTMLElement | Document }`): optional scope for the search (defaults to `document`)

**Return value**

- `Base[]`: an array of all matching instances
