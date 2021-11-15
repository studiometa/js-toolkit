# Instance methods

## `$log(…content)`

Can be used to log content to the console when the `instance.$options.log` options is set to true, either via the `config` getter or via the `data-options` attribute.

## `$on(event, callback)`

Bind a callback function to an event emitted by the instance. Returns a function to unbind the callback from the event.

## `$off(event[, callback])`

Unbind a callback function from an event emitted by the instance. If no callback function is provided, all previously binded callbacks will be removed.

## `$emit(event[, ...args])`

Emit an event from the current instance, with optional custom arguments.

## `$mount()`

Mount the component and its children, will trigger the `mounted` lifecycle method.

## `$update()`

Update the children list from the DOM, and mount the new ones. This method can be used when inserting new content loaded over Ajax.

## `$destroy()`

Destroy the component and its children, will trigger the `destroyed` lifecycle method.

## `$terminate()`

Terminate the component, its instance is made available to garbage collection. A terminated component can not be re-mounted, use with precaution.
