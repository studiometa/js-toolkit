# DOM

The functions that change the document, negotiate a change, or watch an attribute the framework does not read.

## Changing content

- [`swap(target, content, options?)`](./swap.html) — replace, prepend, append or morph, and wait for the framework to catch up
- [`whenDOMSettled()`](./whenDOMSettled.html) — the completion boundary

## Negotiating a change

- [`domUpdate(target, mutate, detail?)`](./domUpdate.html) — announce a mutation so an ancestor can take it over
- [`emitExtendable(target, event, detail?)`](./emitExtendable.html) — announce a step so an ancestor can delay it

## Watching attributes

- [`watchAttributes(el, callback)`](./watchAttributes.html) — every attribute of one element
- [`watchAttributeNamespace(el, ns, bind, options?)`](./watchAttributeNamespace.html) — a namespace whose names cannot be enumerated

## Breakpoints

- [`BREAKPOINTS`, `getBreakpoints()`, `setBreakpoints()`](./breakpoints.html)

## Read next

[The mutation engine](/guide/concepts/mutation-engine.html) and [The attribute grammar](/guide/concepts/attribute-grammar.html).
