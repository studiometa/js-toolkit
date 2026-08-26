# The attribute grammar

Every attribute the framework reads has one shape, and one module owns it:

```
data-<namespace>[:<qualifier>[.<part>…]]
```

[[toc]]

## A namespace is a whole name

There are two kinds.

**A fixed namespace is written in a module** — `data-component`, `data-mount`, `data-ref`, and in `@studiometa/ui` `data-on`, `data-track`, `data-bind`.

**A generated namespace comes from a declaration.** Every declared option owns the one built for it, so `columns` owns `data-option-columns`, and `data-option-` is a namespace _family_ rather than a namespace.

An option's name is therefore **inside** its namespace, never a qualifier of a shared one: `data-option-columns:s`, never `data-option:columns:s`.

## The colon has one meaning

It selects one member of the vocabulary the namespace declares.

`data-option-columns:s` and `data-on:click` are not two meanings of the separator. They differ in what the _namespace_ is — one already-declared option against an open family of bindings — and in both cases the colon picks one member.

So **an attribute the framework reads holds at most one colon**, which is a rule you can check, and `attributes.spec.ts` does.

`data-on:click:s` is not an attribute. Responsiveness belongs to declared options, the only vocabulary that is finite, ordered, and has a value to resolve through a cascade.

## A dot splits the qualifier, and core reads none of it

Whether the first part names what a binding writes to (`data-bind:prop.value`) or modifies how it fires (`data-on:click.prevent`) is the business of whoever declared the namespace.

Core reads the qualifier's **head** only, to check it against a vocabulary the caller handed over, and never past it.

> **Core owns when a declaration is re-parsed and how the attribute is observed. The namespace's owner owns what the string means.**

## The kind of namespace decides the mechanism

What matters is whether the _whole set of names_ can be listed in advance — not whether the qualifier vocabulary is finite.

| Namespace               | Names                                       | Mechanism                               |
| ----------------------- | ------------------------------------------- | --------------------------------------- |
| `data-option-columns`   | `attribute × breakpoint` — enumerable       | registered in the one `attributeFilter` |
| `data-component`        | fixed plus one per breakpoint — enumerable  | registered in the one `attributeFilter` |
| `data-on`, `data-track` | any DOM event — open                        | `watchAttributeNamespace()`             |
| `data-bind`             | finite head, open name — **not** enumerable | `watchAttributeNamespace()`             |

A generated namespace is enumerable _because_ it comes from a declaration, which is why the page-wide filter stays precise and no option costs a second observer.

`data-bind` shows why "finite or open" is the wrong axis on its own: its binding types are finite, but the class, property or attribute name after the dot is not — so the names cannot be listed and the namespace must be watched. Validating a finite head is an **independent** capability, available to a watched namespace and a registered one alike.

## The two escape hatches

`attributeFilter` takes exact names and the DOM has no wildcard, so the engine cannot see an attribute the framework cannot name.

### `watchAttributes(element, callback)`

Observes **every** attribute of that element, through a second, unfiltered observer. The page pays for the elements that ask.

- **The caller owns it.** It returns one idempotent cleanup and knows nothing about `Base`.
- **The records join the shared queue**, so they are drained wherever the engine drains its own, `whenDOMSettled()` included.
- **A callback runs after the framework work of the batch.**
- **Changes are coalesced**, with the rule of `option<Name>Changed()`.
- **The payload is one object**: `{ name, value, previousValue }`, with raw attribute strings and `null` for an absent attribute. It covers the element's whole attribute set, framework names included, so a caller narrows by prefix.

See [`watchAttributes()`](/api/dom/watchAttributes.html).

### `watchAttributeNamespace(element, namespace, bind, options?)`

The mechanism for a namespace whose names cannot be enumerated. Declare the prefix, hand over a binder, and get the per-element observation, the keyed bindings and the teardown.

- **One binding per attribute, keyed by the name that produced it.** That is what lets one code path cover all three shapes a change takes: **added** attaches with nothing to release, **changed** releases then attaches, **removed** releases with nothing to attach. A memoised parse cannot express the middle one — and rewriting an attribute in place is not hypothetical, since `swap({ mode: 'morph' })` does it.
- **The binder returns that binding's release**, or nothing when the declaration produced no binding, so a malformed value costs no bookkeeping.
- **Declaration order survives a rewrite.** The bindings are a `Map` keyed by attribute, and `set` on a key already there keeps its position.
- **An optional finite vocabulary validates the qualifier's head.** Given one, an unknown head warns once per element and per name with `attribute.unknown-qualifier` and binds nothing — so `data-bind:prpo.value` stops being an attribute that silently does nothing. Omitted, the vocabulary is open and anything binds, which is the only honest answer for `data-on`.
- **It is built on `watchAttributes()`**, so `whenDOMSettled()`, and therefore `swap()`, covers a namespaced declaration the way it covers a mount.
- `Base` has no wrapper and owns no cleanup. A component calls it from `mounted()` and returns its cleanup.

See [`watchAttributeNamespace()`](/api/dom/watchAttributeNamespace.html).

To watch a subtree, character data, or a node the framework does not know, use [`useMutation()`](/api/services/useMutation.html).

## The one module that owns the vocabulary

`attributes.ts` owns every name in the filter and every test against one: `data-component`, `data-mount`, `data-ref`, the `data-option-` prefix with `optionAttributeFor()` and `isOptionAttribute()`, the responsive separator, and the coalescing rule. **It imports nothing from core.**

`component-declarations.ts` consumes that vocabulary and reads the DOM through the responsive cascade.

## The coalescing rule, written once

Several writes to one attribute in a batch give **one** change, from the value before the first write to the value at the end of the batch. A write that ends where it started is not a change.

`rememberPreviousValue()` and `isNetChange()` hold the rule. The comparison uses **raw strings**, so a breakpoint crossing and an attribute write are the same kind of event.
