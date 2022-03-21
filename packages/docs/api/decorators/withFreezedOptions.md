# withFreezedOptions

Use this decorator to transfrom the `$options` property to be read only. This can help improve performance when accessing options in the [`ticked` service method](/api/methods-hooks-services.html#ticked).

## Usage

```js
import { withFreezedOptions } from '@studiometa/js-toolkit';
import Component from './Component.js';

export default class ComponentWithFreezedOptions extends withFreezedOptions(Component);
```

### Parameters

- `BaseClass` (`Base`): The class to use as parent.

### Return value

- `Base`: A child class of the given class with the `$options` property freezed.

