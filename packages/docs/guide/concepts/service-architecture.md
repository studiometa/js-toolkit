# Service Architecture

## What are services?

Services are shared, singleton event listeners that distribute browser events (scroll, resize, pointer movement, keyboard input, animation frames) to all subscribed components. Instead of each component adding its own `addEventListener`, a single listener is shared.

## The singleton pattern

Each service (e.g. `useScroll`, `useResize`, `useRaf`) creates **one instance** regardless of how many components use it. This is implemented via `AbstractService.getInstance()` which caches instances using a `WeakMap`-like pattern.

```
┌─────────────────────────────────────┐
│         ScrollService (1 listener)  │
│                                     │
│  callbacks:                         │
│    "Header-0"  → Header.scrolled()  │
│    "Sidebar-1" → Sidebar.scrolled() │
│    "Hero-2"    → Hero.scrolled()    │
└─────────────────────────────────────┘
         ↑ single scroll listener
         │
    window.scroll
```

When the event fires, the service iterates over all registered callbacks and calls them with computed props (position, delta, direction, etc.).

## Why this matters for performance

Without services, 20 components reacting to scroll would mean 20 separate `scroll` event listeners on `window`. Each computes its own values, potentially causing redundant layout calculations.

With services:

- **One listener** per event type, regardless of component count
- **Shared computation** — scroll position, viewport size, pointer coordinates are computed once per frame
- **Built-in throttling/debouncing** — `useScroll` is throttled, `useResize` is debounced, preventing excessive callbacks
- **Automatic cleanup** — when the last callback is removed, the event listener is removed too

## Automatic lifecycle

Services are automatically tied to the component lifecycle via the `ServicesManager`:

1. **On mount** — if a component defines a `scrolled()`, `resized()`, `ticked()`, `moved()`, or `keyed()` method, the corresponding service is automatically enabled
2. **On destroy** — all active services for that component are disabled
3. **On terminate** — full cleanup, including removing the callback from the singleton

This means you never manually add or remove event listeners:

```js
class Parallax extends Base {
  static config = { name: 'Parallax' };

  // Defining this method is enough — the scroll service
  // activates on mount, deactivates on destroy
  scrolled({ y, changed }) {
    if (changed.y) {
      this.$el.style.transform = `translateY(${y * 0.5}px)`;
    }
  }
}
```

## Manual service control

You can programmatically enable, disable, or toggle services via `this.$services`:

```js
class LazyComponent extends Base {
  static config = {
    name: 'LazyComponent',
    refs: ['btn'],
  };

  onBtnClick() {
    // Toggle the scroll service on/off
    this.$services.toggle('scrolled');
  }

  scrolled(props) {
    // Only runs when the service is enabled
    console.log('Scroll position:', props.y);
  }
}
```

Available methods on `this.$services`:

| Method                 | Description                                   |
| ---------------------- | --------------------------------------------- |
| `enable(name)`         | Start the service, returns a disable function |
| `disable(name)`        | Stop the service                              |
| `toggle(name, force?)` | Toggle or force enable/disable                |
| `has(name)`            | Check if the service is currently active      |
| `get(name)`            | Get the current service props                 |

## Standalone usage

Services can also be used outside of components:

```js
import { useScroll } from '@studiometa/js-toolkit';

const { add, remove, props } = useScroll();

add('my-key', (scrollProps) => {
  console.log('Scroll Y:', scrollProps.y);
});

// Later
remove('my-key');
```

## Custom services

You can create custom services by extending `AbstractService` and registering them with `$services.register()`. See [Custom Services](/guide/going-further/registering-new-services.html) for details.

::: tip API Reference
See the [Services hooks](/api/methods-hooks-services.html) and individual service APIs in the [Services](/api/services/) section.
:::
