# HTML

Four attributes are the whole markup surface of the framework.

| Attribute                                  | Declares                                         |
| ------------------------------------------ | ------------------------------------------------ |
| [`data-component`](./data-component.html)  | which components this element runs               |
| [`data-mount`](./data-mount.html)          | when they mount                                  |
| [`data-ref`](./data-ref.html)              | that this element is a named part of a component |
| [`data-option-<name>`](./data-option.html) | the value of one declared option                 |

Every one of them follows the same grammar:

```
data-<namespace>[:<qualifier>[.<part>…]]
```

**The colon selects one member of the vocabulary the namespace declares**, which is why an attribute the framework reads holds at most one colon. See [The attribute grammar](/guide/concepts/attribute-grammar.html).

## What is not an attribute

- `data-load` — the mount and the import are one decision, so `data-mount` says it.
- `<tk-name>` tag sugar and lowercase arbitrary-selector registrations — removed.
- A breakpoint **list** suffix such as `:xxs:xs:s` — a suffix names one breakpoint and cascades.
- A range form or a breakpoint-list form — neither exists.

## Watching your own

`attributeFilter` takes exact names and the DOM has no wildcard, so the engine cannot see an attribute the framework cannot name. Two opt-ins cover the rest:

- [`watchAttributes()`](/api/dom/watchAttributes.html) — every attribute of one element.
- [`watchAttributeNamespace()`](/api/dom/watchAttributeNamespace.html) — a namespace whose names cannot be enumerated, with keyed bindings.
