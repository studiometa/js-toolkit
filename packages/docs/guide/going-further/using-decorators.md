# Using decorators

## What are decorators?

Decorators are higher-order functions that wrap a `Base` class (or any class extending it) to add new behavior. Each decorator returns a new class with extra capabilities — lifecycle hooks, event listeners, observers — without modifying the original class.

## How to use a decorator

Pass your base class to the decorator function, then extend the result:

```js
import { Base } from '@studiometa/js-toolkit';
import { withScrolledInView } from '@studiometa/js-toolkit';

class MyComponent extends withScrolledInView(Base) {
  static config = {
    name: 'MyComponent',
  };

  scrolledInView({ progress }) {
    console.log('Scroll progress:', progress.y);
  }
}
```

## Combining decorators

Decorators can be chained by nesting them. The innermost decorator is applied first:

```js
import { Base } from '@studiometa/js-toolkit';
import {
  withScrolledInView,
  withMountWhenInView,
} from '@studiometa/js-toolkit';

class MyComponent extends withScrolledInView(withMountWhenInView(Base)) {
  static config = {
    name: 'MyComponent',
  };

  scrolledInView({ progress }) {
    console.log('Scroll progress:', progress.y);
  }
}
```

You can also compose them step by step for readability:

```js
import { Base } from '@studiometa/js-toolkit';
import {
  withScrolledInView,
  withMountWhenInView,
} from '@studiometa/js-toolkit';

const BaseWithInView = withMountWhenInView(Base);
const BaseWithScroll = withScrolledInView(BaseWithInView);

class MyComponent extends BaseWithScroll {
  static config = {
    name: 'MyComponent',
  };
}
```

## When to use which decorator

| Need                               | Decorator                    | Description                                 |
| ---------------------------------- | ---------------------------- | ------------------------------------------- |
| Respond to viewport size           | `withBreakpointObserver`     | React to active/inactive breakpoints        |
| Manage breakpoint-dependent config | `withBreakpointManager`      | Switch full configs per breakpoint          |
| Responsive options                 | `withResponsiveOptions`      | Options that change value per breakpoint    |
| Scroll-linked animations           | `withScrolledInView`         | Progress-based scroll callbacks             |
| Mount only when visible            | `withMountWhenInView`        | Lazy mount on intersection                  |
| Mount on media query               | `withMountOnMediaQuery`      | Mount/destroy based on a media query        |
| Mount when motion is allowed       | `withMountWhenPrefersMotion` | Respects `prefers-reduced-motion`           |
| Drag interactions                  | `withDrag`                   | Drag handlers with inertia support          |
| Relative pointer tracking          | `withRelativePointer`        | Pointer position relative to element bounds |
| Intersection observer              | `withIntersectionObserver`   | Raw `IntersectionObserver` access           |
| DOM mutations                      | `withMutation`               | `MutationObserver` integration              |
| Group components                   | `withGroup`                  | Coordinate sibling component instances      |
| Extra config                       | `withExtraConfig`            | Override config on an existing class        |
| Freeze options                     | `withFreezedOptions`         | Prevent option changes after mount          |

:::tip API Reference
Find all natively available decorators and their full API details in the [Decorators](/api/decorators/) section of the API Reference.
:::
