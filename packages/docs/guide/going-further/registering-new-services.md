# Registering new services

## Why register a custom service?

The built-in services (`scrolled`, `resized`, `ticked`, `moved`, `keyed`) cover common use cases, but you may need to react to other global events — geolocation changes, device orientation, WebSocket messages, etc. You can create a custom service and register it on any component to use it like a built-in service.

## Creating a custom service

A custom service extends `AbstractService` and implements its own event handling logic. Here's an example that reacts to device orientation changes:

```js
import { AbstractService } from '@studiometa/js-toolkit/services';

class OrientationService extends AbstractService {
  static config = [[() => window, [['deviceorientation']]]];

  props = {
    alpha: 0,
    beta: 0,
    gamma: 0,
  };

  handleEvent(event) {
    this.props.alpha = event.alpha ?? 0;
    this.props.beta = event.beta ?? 0;
    this.props.gamma = event.gamma ?? 0;
    this.trigger(this.props);
  }
}

export function useOrientation() {
  return OrientationService.getInstance();
}
```

The static `config` property defines which event listeners to attach. Each entry is a tuple of:

1. A function returning the `EventTarget` (e.g. `window`, `document`, or any element)
2. An array of `[eventName, options?]` tuples

The service is lazy: event listeners are added when the first callback is registered, and removed when the last callback is unregistered.

## Registering on a component

Use the `$services.register()` method to add your custom service to a component. Once registered, it works like any built-in service — define a method with the service name, and it will be called automatically.

```js
import { Base } from '@studiometa/js-toolkit';
import { useOrientation } from './services/useOrientation.js';

class Compass extends Base {
  static config = {
    name: 'Compass',
  };

  mounted() {
    // Register the custom service
    this.$services.register('orientation', useOrientation);
  }

  destroyed() {
    // Unregister when no longer needed
    this.$services.unregister('orientation');
  }

  // This method is called automatically when orientation changes
  orientation(props) {
    console.log('Device orientation:', props.alpha, props.beta, props.gamma);
  }
}
```

## Using standalone

Like built-in services, custom services can be used outside of components:

```js
import { useOrientation } from './services/useOrientation.js';

const orientation = useOrientation();

orientation.add('my-key', (props) => {
  console.log('Orientation:', props);
});

// Later
orientation.remove('my-key');
```

## Service lifecycle

The `AbstractService` class manages the service lifecycle automatically:

- **`init()`** — called when the first callback is added; attaches event listeners defined in `config`
- **`kill()`** — called when the last callback is removed; detaches event listeners
- **`trigger(props)`** — call this from your event handler to notify all registered callbacks

Override `init()` and `kill()` if you need custom setup/teardown logic beyond event listeners:

```js
class WebSocketService extends AbstractService {
  ws = null;

  init() {
    this.ws = new WebSocket('wss://example.com');
    this.ws.addEventListener('message', (event) => {
      this.trigger({ data: JSON.parse(event.data) });
    });
  }

  kill() {
    this.ws?.close();
    this.ws = null;
  }
}
```

::: tip API Reference
See the [Services hooks](/api/methods-hooks-services.html) API for hook signatures, the [Services](/api/services/) section for built-in service APIs, and [`$services`](/api/instance-properties.html#services) for the service manager.
:::
