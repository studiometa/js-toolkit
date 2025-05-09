# withMutation

Use this decorator to add a `mutated(props)` hook managed by the [mutation](/api/services/useMutation.html) service.

## Usage

```js twoslash
import { Base, withMutation } from '@studiometa/js-toolkit';

export default class Component extends withMutation(Base, {
  target: (instance) => instance.$el,
}) {
  static config = {
    name: 'Component',
  };

  /**
   * @param {MutationRecord[]} props
   */
  mutated(props) {
    for (const mutation of props.mutations) {
      console.log(mutation); // MutationRecord
    }
  }
}
```

### Parameters

- `BaseClass` (`Base`): the class to add mutation observation to
- `options?` (`{ target?: (instance:Base) => Node } & MutationObserverInit`): define which element should be observed (defaults to the component's root element) and any options for the mutation observer

### Return value

- `Base`: a new class extending the given class with mutation observability enabled

## API

### Class methods

#### `mutated`

The `mutated` class method will be triggered when a DOM mutation occurs on the given target.

**Arguments**

- `props` (`MutationServiceProps`): the [mutation service props](/api/services/useMutation.md#props)

## Examples

### Update a component when its children have changed

This decorator can be used to update a component when its inner HTML has changed to rebind refs and child components.

```js twoslash
import { Base, withMutation } from '@studiometa/js-toolkit';

export default class Component extends withMutation(Base, {
  childList: true,
  subtree: true,
}) {
  static config = {
    name: 'Component',
  };

  /**
   * @param {MutationRecord[]} props
   */
  mutated(props) {
    this.$update();
  }
}
```
