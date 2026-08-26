# Decorators

**Every decorator is a thin wrapper over a function API that works without it.** No engine ships stage-3 decorators, so a page that loads the package from an ESM CDN keeps `registerComponent`, `$provide`, `$watchChildren`, `$read`, `$write` and the `on<Child><Event>` method names.

Decorators are sugar. They are never a requirement.

[[toc]]

## The six

| Decorator                           | Wraps                                   | Notes                                                                           |
| ----------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------- |
| `@component({ name })`              | `static config` + `registerComponent()` | Registers as soon as the class is defined.                                      |
| `@on(target, type)` / `@on(type)`   | the `on<Child><Event>` names            | The target is a name or a value.                                                |
| `@provide(key)` / `@inject(key)`    | `$provide()` / `$inject()`              | The shape of Lit's `@provide` and `@consume`.                                   |
| `@children(nameOrClass, callbacks)` | `$watchChildren()`                      | Exact name, or constructor and subclasses. Callbacks are bound to the instance. |
| `@read` / `@write`                  | `$read()` / `$write()`                  | Runs the method body in that phase, cancelled on unmount.                       |

Each value decorator works on a plain field and on an `accessor` field.

## A component with decorators

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"93ac0031ab031a9abdf2d67f8884e4a8d0282c97d738b1b868a7510ba80cbff9","data":"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"}
import {
  Base,
  children,
  component,
  on,
  type ChildrenCollection,
  type DelegatedEvent,
} from '@studiometa/js-toolkit-v4';

@component({ name: 'AccordionItem' })
class AccordionItem extends Base<{ $emits: { open: void } }> {
  @on('click')
  toggle() {
    this.$emit('open');
  }
}

@component({ name: 'Accordion', components: { AccordionItem } })
class Accordion extends Base {
  @children(AccordionItem)
  items!: ChildrenCollection<AccordionItem>;

  @on(AccordionItem, 'open')
  closeOthers({ target }: DelegatedEvent<AccordionItem, 'open'>) {
    for (const item of this.items) {
      if (item !== target) item.$el.removeAttribute('data-option-open');
    }
  }
}
```

## `@component` and `static config` merge

They merge in a class initializer, which runs after the fields and inside the class definition, so `registerComponent()` on the next line reads the finished config. The rules are the rules of `$config`: `refs` union, `options` and `components` merge entry by entry, a declared value overrides.

A key both sides declare differently is reported as `component.config-conflict`.

**The decorator is applied last**, so it registers a finished class.

## `@on` — a name or a value

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"243a917ecae12015acfae2fac16235c0871d3d323eb5dd42f9afa23f117c3691","data":"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="}
import { Base, component, on } from '@studiometa/js-toolkit-v4';

class AccordionItem extends Base {
  static config = { name: 'AccordionItem' };
}
// ---cut---
@component({ name: 'Demo', components: { AccordionItem }, refs: ['dots[]'] })
class Demo extends Base {
  @on('click') a(event: MouseEvent) {} // own element, typed from HTMLElementEventMap
  @on('submit') b(event: SubmitEvent) {} // idem
  @on('dots[]', 'click') c() {} // a ref, named as declared
  @on('AccordionItem', 'open') d() {} // a child, by name — imports nothing
  @on(AccordionItem, 'open') e() {} // a child, by class — the class is the type
  @on(window, 'load') f() {} // a global
  @on(document, 'click') g() {} // a global
}
```

- **The one-argument form types its event from `HTMLElementEventMap`**, so `@on('click')` hands over a `MouseEvent` and `@on('submit')` a `SubmitEvent`. A name outside that map is a component event, whose detail only its emitter knows, so the handler declares the type it expects: `@on('content') inject(event: CustomEvent<{ content: string }>)`.
- **A class resolves to its merged `config.name`** and lands on the same delegated entry as the string form. The class is the type, so `target` is the component and `payload` comes from its `$emits`.
- **A lazy child needs the string form.** `@on('Child', 'open')` imports nothing; a thunk is not a target and both the overloads and the runtime refuse it.
- **A name is a child or a ref**, resolved children-first, so the handler is typed as `DelegatedEvent` or `RefEvent`.
- **A ref is named as it is declared**: `@on('dots[]', 'click')` for `config.refs: ['dots[]']`. A mismatched `@on('dots', 'click')` warns at bind time when the other spelling is declared. A name that matches nothing stays silent.
- **A global target goes through the same binding `onWindow<Event>` uses**: bubble phase, one listener per mount cycle, removed by `$unmount()`. `@on(window, 'click')` types the event from `WindowEventMap` and falls back to `Event`.
- **Nothing is reserved in its string space**: `'Window'` means the child and `window` means the global.
- **Any other `EventTarget` is refused**, by the overloads and by a `TypeError`. A decorator is evaluated once, at class definition, so an arbitrary target can only be a module-scope value.

## `@read` and `@write`

They are **leaf-method sugar: the phase belongs to the call site.**

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"2cf63509c775468b51c64aafaeda7b5ca878b3e92f71db5d50c713ef981a9420","data":"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"}
import { Base, component, read, write } from '@studiometa/js-toolkit-v4';

@component({ name: 'Measure' })
class Measure extends Base {
  #height = 0;

  @read
  measure() {
    this.#height = this.$el.scrollHeight;
  }

  @write
  apply() {
    this.$el.style.setProperty('--height', `${this.#height}px`);
  }
}
```

::: warning Decorate a method nobody overrides
A phase decorator returns a wrapper around the method it decorates, and that wrapper is a property of **that class**. A subclass that overrides the method defines its own, undecorated, and `this.method()` resolves to it — so the base's scheduling disappears and the body runs in whatever phase the caller was in.
:::

A **template method** — a base that schedules work its subclasses implement — schedules at the call site instead:

```js
// in the base, where the call is
state.subscribe((value) => this.$write(() => this.update(value)));
```

The alternative, dispatching a decorated method through something a subclass cannot replace, was refused: it would make a decorator's behaviour depend on inheritance depth, which nothing else in v4 does.

### Stacking with `@on`

The skip is keyed by the method name, so `@on` and `@read`/`@write` stack in either order. The order decides what the listener calls:

- a phase decorator written **below** the `@on`, nearest the method, schedules the body of the handler;
- one written **above** it schedules direct calls only.

Write `@read` and `@write` closest to the method body.

## Build setup

Vite 8 transforms TypeScript with Oxc, which passes decorators through untouched. The package itself compiles them with `@rollup/plugin-swc` and `decoratorVersion: '2023-11'`, filtered to the files that contain a decorator. See [Installation](/guide/introduction/installation.html#with-a-build-step).

## The same component, without any of them

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"2dc0a895ed4ac7d866699f86f6235f7b3601fefdc23565ff1d86e11c453f5cfb","data":"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"}
import { Base, registerComponent, type DelegatedEvent } from '@studiometa/js-toolkit-v4';

class AccordionItem extends Base<{ $emits: { open: void } }> {
  static config = { name: 'AccordionItem' };

  onClick() {
    this.$emit('open');
  }
}

class Accordion extends Base {
  static config = {
    name: 'Accordion',
    components: { AccordionItem },
  };

  items = this.$watchChildren(AccordionItem);

  onAccordionItemOpen({ target }: DelegatedEvent<AccordionItem, 'open'>) {
    for (const item of this.items) {
      if (item !== target) item.$el.removeAttribute('data-option-open');
    }
  }
}

registerComponent(Accordion);
```
