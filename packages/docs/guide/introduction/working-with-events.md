# Working with events

The `Base` class helps you manage event handler with automatic binding of a class methods following a naming convention.

Two types of events:

- native events: click, mouseenter, submit, etc.
- framework events

## Emitting and listening to events

Events can be emitted from a class instance with the [`$emit(event, ...args)`](/api/instance-methods.html#emit-event-args) method.

Handlers can be bounded to an event with the [`$on(event, handler)`](/api/instance-methods.html#on-event-callback) method.

Handlers can be unbounded from an event with the [`$off(event, handler)`](/api/instance-methods.html#off-event-callback) method.

## Naming convention for event handlers binding

### on\<Event>

### on\<Refname>\<Event>

### on\<Childname>\<Event>
