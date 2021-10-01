---
sidebar: auto
sidebarDepth: 5
---

# withExtraConfig

Use this decorator to quickly create variants of an existing class.

## Examples

### Add new refs

This decorator can be used to easily add a new ref to an existing component.

```js
import Modal from '@studiometa/ui/Modal';
import { withExtraConfig } from '@studiometa/js-toolkit';

export default withExtraConfig(Modal, { refs: ['toggle'] });
```

### Change default options

Components can define default values for their options, this decorator can be used to change them without the hassle of re-writing the whole configuration.

```js
import Modal from '@studiometa/ui/Modal';
import { withExtraConfig } from '@studiometa/js-toolkit';

export default withExtraConfig(Modal, {
  options: {
    styles: {
      default: () => ({ /* ... */ }),
    },
  },
});
```

### Enable debug or log easily

This decorator can be used to quickly enable debug for an external component.

```js{9}
import { Base, withExtraConfig } from '@studiometa/js-toolkit';
import Modal from '@studiometa/ui/Modal';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Modal: withExtraConfig(Modal, { debug: true }),
    },
  };
}
```

### Pass option to the merge function

This decorator uses [`deepmerge`](https://github.com/TehShrike/deepmerge) to merge the `config` properties, you can pass [options](https://github.com/TehShrike/deepmerge#options) to it with the third parameter:

```js{7}
import { withExtraConfig } from '@studiometa/js-toolkit';
import Modal from '@studiometa/ui/Modal';

export default withExtraConfig(Modal, {
  refs: ['toggle']
}, {
  arrayMerge(target, source, options) { /* ... */ }
})
```

## API

This decorator does not expose a specific API.
