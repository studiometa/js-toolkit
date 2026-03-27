# logTree

Log the component tree to the browser console starting from a given instance. Uses the global instance registry and DOM containment to build the tree — does **not** rely on the deprecated `$children` API.

Components with children are displayed as collapsed groups. Each entry shows:
- **●** for mounted instances, **○** for unmounted
- The instance `$id`
- A reference to the DOM element

## Usage

```js
import { createApp, logTree } from '@studiometa/js-toolkit';

const useApp = createApp(App);
useApp().then((app) => logTree(app));
```

You can also call it from the browser console if you expose the app instance:

```js
// In your app's mounted hook
mounted() {
  globalThis.$app = this;
}

// Then in the console
logTree($app);
```

### Parameters

- `instance` (`Base`): The root component instance to log the tree from.

### Return value

- `void`: Logs to the console, does not return a value.
