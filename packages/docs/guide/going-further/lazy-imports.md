# Lazy imports

## Why lazy import?

By default, all components are bundled together and loaded upfront. Lazy imports let you split your application into smaller chunks that are only fetched when actually needed — improving initial load time and reducing the amount of JavaScript parsed by the browser.

js-toolkit provides several helper functions to control exactly when a component's module is fetched:

| Helper | Trigger |
|---|---|
| `importWhenVisible` | When the target element enters the viewport |
| `importWhenIdle` | During browser idle time |
| `importOnInteraction` | On a user interaction (e.g. `click`, `mouseover`) |
| `importOnMediaQuery` | When a media query matches |
| `importWhenPrefersMotion` | Only if the user hasn't disabled motion |

## Available strategies

### `importWhenVisible`

Loads the component when the target element (or a custom selector) becomes visible in the viewport, using an `IntersectionObserver` under the hood.

```js
import { Base, importWhenVisible } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      // Import when the component's own root element is visible
      HeavyComponent: (app) =>
        importWhenVisible(
          () => import('./components/HeavyComponent.js'),
          'HeavyComponent',
          app,
        ),
    },
  };
}
```

You can also trigger the import based on any element in the DOM:

```js
components: {
  HeavyComponent: () =>
    importWhenVisible(
      () => import('./components/HeavyComponent.js'),
      '#my-trigger',
    ),
},
```

### `importWhenIdle`

Loads the component during browser idle time using `requestIdleCallback`. Useful for non-critical components that shouldn't compete with the main thread.

```js
import { Base, importWhenIdle } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      // Import when the browser has spare cycles, with a 2 second deadline
      Analytics: () =>
        importWhenIdle(() => import('./components/Analytics.js'), { timeout: 2000 }),
    },
  };
}
```

### `importOnInteraction`

Loads the component when the user interacts with a specific element. Ideal for heavy widgets like modals, video players, or chat interfaces.

```js
import { Base, importOnInteraction } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      // Import the modal only when the user clicks the trigger button
      Modal: (app) =>
        importOnInteraction(
          () => import('./components/Modal.js'),
          '#open-modal-btn',
          'click',
          app,
        ),
    },
  };
}
```

Multiple events can be passed as an array:

```js
importOnInteraction(
  () => import('./components/Tooltip.js'),
  '.has-tooltip',
  ['mouseenter', 'focus'],
);
```

### `importOnMediaQuery`

Loads the component only when a specific media query matches. The component will not be imported (and thus not mounted) if the query doesn't match.

```js
import { Base, importOnMediaQuery } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      // Only load the desktop sidebar on wide screens
      Sidebar: () =>
        importOnMediaQuery(
          () => import('./components/Sidebar.js'),
          '(min-width: 1024px)',
        ),
    },
  };
}
```

### `importWhenPrefersMotion`

Loads the component only if the user hasn't enabled `prefers-reduced-motion`. Use this to avoid loading animation-heavy components for users who prefer minimal motion.

```js
import { Base, importWhenPrefersMotion } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      ParallaxBackground: () =>
        importWhenPrefersMotion(() => import('./components/ParallaxBackground.js')),
    },
  };
}
```

## Usage with `config.components`

All lazy import helpers return a `Promise` resolving to the component class. This matches the async arrow function pattern expected by `config.components`:

```js
import { Base } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      // Simple dynamic import — no specific trigger
      HeavyComponent: () => import('./components/HeavyComponent.js'),

      // With a lazy import helper
      VisibleComponent: (app) =>
        importWhenVisible(
          () => import('./components/VisibleComponent.js'),
          'VisibleComponent',
          app,
        ),
    },
  };
}
```

When a parent component is mounted, dynamic components are only imported if a matching element is found in the DOM. If no element is found, the import is never triggered — giving you automatic code-splitting with no extra configuration.

:::tip API Reference
Find the full API details for each helper in the [Helpers](/api/helpers/) section of the API Reference.
:::
