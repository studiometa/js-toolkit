# watchAttributeNamespace

```ts
watchAttributeNamespace(
  el: Element,
  namespace: string,
  bind: AttributeNamespaceBinder,
  options?: { qualifiers?: readonly string[]; component?: string },
): () => void
```

The mechanism for a namespace whose names **cannot be enumerated**. Declare the prefix, hand over a binder, and get the per-element observation, the keyed bindings and the teardown.

```ts
interface AttributeNamespaceDeclaration {
  qualifier: string;
  value: string;
  attribute: string;
}

type AttributeNamespaceBinder = (declaration: AttributeNamespaceDeclaration) => (() => void) | void;
```

[[toc]]

## Usage

```js
import { watchAttributeNamespace } from '@studiometa/js-toolkit';

mounted() {
  return watchAttributeNamespace(this.$el, 'data-on', ({ qualifier, value }) =>
    new ActionEvent(this, qualifier, value).attach(),
  );
}
```

`Base` has no wrapper and owns no cleanup. A component calls it from `mounted()` and returns its cleanup.

## One binding per attribute, keyed by the name that produced it

That is what lets **one** code path cover all three shapes a change takes:

| Change  | Effect                          |
| ------- | ------------------------------- |
| added   | attach, with nothing to release |
| changed | release, then attach            |
| removed | release, with nothing to attach |

A memoised parse cannot express the middle one — and rewriting an attribute in place is not hypothetical: `swap({ mode: 'morph' })` does it, and so does any templating around the element.

**The binder returns that binding's release**, or nothing when the declaration produced no binding. Returning nothing leaves nothing held, so a malformed value costs no bookkeeping.

## Declaration order survives a rewrite

The bindings are a `Map` keyed by attribute, and `set` on a key already there keeps its position — so a consumer applying its bindings in order is not reordered by an edit.

## Validating the qualifier's head

```js
watchAttributeNamespace(el, 'data-bind', bind, {
  qualifiers: ['class', 'prop', 'attr', 'style', 'text', 'html'],
  component: 'Bind',
});
```

Given a finite vocabulary, an unknown head warns **once per element and per name** with `attribute.unknown-qualifier` and binds nothing — so `data-bind:prpo.value` stops being an attribute that silently does nothing.

Omitted, the vocabulary is **open** and anything binds, which is the only honest answer for `data-on`, whose qualifiers are any DOM event.

## The qualifier and its parts

```
data-<namespace>:<qualifier>[.<part>…]
```

**A dot splits the qualifier, and core reads none of it.** Whether the first part names what a binding writes to (`data-bind:prop.value`) or modifies how it fires (`data-on:click.prevent`) is the business of whoever declared the namespace.

Core reads the qualifier's **head** only, to check it against the vocabulary you handed over, and never past it.

> Core owns when a declaration is re-parsed and how the attribute is observed. The namespace's owner owns what the string means.

## It is built on `watchAttributes()`

So its records join the one mutation engine's queue and are reported from the same batch: [`whenDOMSettled()`](./whenDOMSettled.html), and therefore [`swap()`](./swap.html), covers a namespaced declaration the way it covers a mount.

## When a namespace does not need this

If the whole set of names can be listed in advance, it belongs in the one page-wide `attributeFilter` instead:

| Namespace               | Names                                       | Mechanism                 |
| ----------------------- | ------------------------------------------- | ------------------------- |
| `data-option-columns`   | `attribute × breakpoint` — enumerable       | the one `attributeFilter` |
| `data-component`        | fixed plus one per breakpoint — enumerable  | the one `attributeFilter` |
| `data-on`, `data-track` | any DOM event — open                        | **this**                  |
| `data-bind`             | finite head, open name — **not** enumerable | **this**                  |

`data-bind` is the case that shows why "finite or open" is the wrong axis on its own: its binding types are finite, but the class, property or attribute name after the dot is not. See [The attribute grammar](/guide/concepts/attribute-grammar.html).
