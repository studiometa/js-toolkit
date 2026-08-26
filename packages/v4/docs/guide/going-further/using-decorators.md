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
// @twoslash-cache: {"v":1,"hash":"243a917ecae12015acfae2fac16235c0871d3d323eb5dd42f9afa23f117c3691","data":"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"}
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
// @twoslash-cache: {"v":1,"hash":"2cf63509c775468b51c64aafaeda7b5ca878b3e92f71db5d50c713ef981a9420","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGACENadvmiM/J2N7H6IDjAAwsOj3OMycvS+ShPTYC6kzTm2xoxEbM0w49IU3WDVaOOTQnBwACIwQ6TMaLZrFzLGfDrGvEQQ7Cg5isNjs3V6SXOTigEH4CBiAGUorxAjBwTZIfYhmARn5eMxFLxSDA/OwXGQUfg0YJhLwAO5Urrsexk3iwEZJKAAOicLjc0QAjABWby+AJBfJhNyRaIgIYQ/pODhJJBpOWZZ45SqIYVFEo4PCEEjkMLyWocLh8bEuIkwZhQebSfCs+TLZQSU4AQQiIldihErQA1pA6WBkABdXb7ViHcYANQBUAAslFCFAZM64F6fcZTgB9bEXK43OApwLQB5PF5vTofJ1k04JwFltMZhu8b1+ExfXg/XhN5Op6BtrMdnPA3pg4n26Gw+EgBEZGBQZo+SloyxDqC8ABG0AwvES694SXotvtvCwmVUXN4Dw2WzQHS6/AJ/BgrBEOEUiTxdNsgY8lQfLuIgABMABsor+IEIRShEUR4NOUBKokyRqhkWRankkF6tQpSGhUJrUGaMQsBaDTWvYdKkMyRy8COiwKCscTZl2TFurwQYhmGkZ7Ac9EDi2w71qOnYmPmhbyMWwjCVAla2NWpDvPII6NomclqWOXbGD2fZCVuWniWYFiTtRtE0LOcJ4IuVIrmuqK8Ju5bbnuUAHkejmnuZdGXteMC3veaCbO0nQCG+H5fssv70gBQHOOE0QAMxgdB4pICK1DSohMQ0XRqEqqk6QatkuRICleGYAaMRGpUpo1GRdSWuifTnIMMxjKsHVzAxsh+ixEhrA+2ykFGAnHKcUn0DJtwKc8rzKbWqnSHpvz/ICE6gliPQYoqVAwtZiLIo58q7ecZy4vihLEqS5KkMeNK3PSjKHiyIjsmh3K8olSAAOxQSAPgwRKXhZQhsqna1DAJIVqXqlhZU6pVBE1URVSkSAjBYJoOB2BgfBxGsuJcmAzCbuMGy/t9/JIAAHLTaWwYgoRgzKeCk5uBXJHDmGaojApJcj1XlMa6MNXKJa8CmXDNMS1OgQKAuMxKv3wWzMTS3AsvxIDaHlcVCPahBQtlLVxEXOa9RWpLcQLP17qqIY2i9hMTsmJttj2HE8uCmBoNA+lzNqzlsQSFz+vw3z2pgWBJuEaL9WyuRVtnDayGOpmHH+hMbG+ks2fcRAoYRmNMaCRphmibnua8AWS3Tbw1yyVuc1KSp9BaQZLlGTmq39hX3dV9p7umVt54oftc42Uu9loo5zlpru+6Hl0XnyOPfkSIF8DBY+z7hW0kWXtF/ixaQgE+0gwqZQHTMs+E6sgMh4eIADvOldqgvFPhwtm2LScL2gHwTW2suSbhlsSRgPV1oTwSjTHUEE4a3xVsHWU4CtZyxhskVWkcP44TjqjBOJFxZYxxmQTABMJCSDiG7YwXIAAkH5xgAAlpBJgADIAFEfCbihMBH6OoPAM0BmKJmSVUF4EYawF+wj37YSQGBYIBCRZ1WIUnbGWhyH414NwmAvC0BcjgPwTQrBWDMJgKMfAlwTzNEsDuVRB15xOjRAAKhcQAAyMSYsxFi/BWPcW48eABaTorADwaNxpgXgEBGjHl0foleuRGjZDRKyZgTk7QYL0f0aJsTHJUksfYGJV05A8P6AAchEFJc4pxEiCGaFAGK1T7CQHsEQMk7AdxrjCo5LxMBfBskOCiCA0TjSNFYEXLk5hzDICTHcAAcrwAASjARoZBfDvnDIwKxaBtCIAAPT7NgCQCZuMwEQAAF7sFMcwLktg/BHLnPsgA6jAHc+zPRqAAJL7Pif0fZXiICmPMYU7gl9wIpCQaIiUAo4YPxDoC4FvirEyINlHHCtNlF/0TpbZqVF6QWXooxe2Odh5ZxWIXYufFoyxn7s2SumZq6SXrtYputw5KtwWu3NAncB6tiHsZPuXd+WMuHiZEEnsCX5UnodBcM9VxzypBklyS93Ir2PN5KVNBN43jvDvEKT4wqvkPp+Y+P5T7/nPvFEC0QY4s2QRlCRuVCUv0VmivB5UsVoxxWRQBUBgGZNAcwLAWAwlQPGDA8FYEUrK0dazEOwbQ0YFdTzEq8jwJeqIRbMiEStGUNUNQgwOMTAMKYbwVhHC/l8LgaBMCQoBSxsQOI+NsopGuubXIxGhRv5VVNt6tRTBc14z4FWtAkwEQIi+WAZUMAESYB8IY+d9Fx0TqXZWIQ81nxWXnLMhZyzVnrMPlsnZezDnHI/Jo0g5yrk3LuRER5cIXlvI+d8/ZFauFlPOACpdYL+HwLrTfaFcb4WyhcBgHw7b3XpoFpm1R2bMZ+r4Cuud4GYDrqyIasAcRDFRCdlo0hl7MAU2Cr+U4NL6KU1PgAHxsaY042MOgWQwAAfmI7Rfw0DEzbrwM43gbj3HIbXY8DdLxnw4bQHhvGUCAkuOVYvRISSUm8FUGgEQ6Skh0j+AJJoth8SXjIXjaJXR0kruU0utkwmMP7wgDuAAVo8Ax0ywxzMWSstZxIj3bLQLsuAByjkwBOZe691yhB3oeY4p97zPk/ME6h9Dm7OgAtwwZihUaIINpEcDK+GWQN4BU5JzAkHcHQcKOGdI0AygSrBMAUlkNMSnGQqcPK2qChNE0JYXg5SAACLgGkdGcswfZtm4BBNeECwMzIglEGCOUgA3E5rrdX+iMBqxzei5SQHEnKbwAo3BzCPREJttEJK4i8GAOYXgvAADEBS/H2D0CkebYALu8C68hF76DtZQLOy9y7gQyRchu8i+7lIAdSMMcYoFPjClPcuwUJzl2uvNZgC9xNYa+Dna6Jd0HcBS2sEXah8TBWMCMHKUEoJt2rHlNOO4+hwB/u46B4UgoWBaDuO4LDnb5gChOAG0gUAfo4BbpiKpkABQChAA=="}
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
