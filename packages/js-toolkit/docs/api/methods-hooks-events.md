# Events hooks

Five naming conventions bind a method to an event source. All five are bound for the **mount cycle** and removed by `$unmount()`.

| Method name         | Listens to                                    | Payload                      |
| ------------------- | --------------------------------------------- | ---------------------------- |
| `on<Event>`         | the component's own element                   | the raw event                |
| `on<Ref><Event>`    | a declared ref, delegated                     | `{ event, target, index }`   |
| `on<Child><Event>`  | a component in `config.components`, delegated | `{ event, target, payload }` |
| `onWindow<Event>`   | `window`                                      | `{ event, target }`          |
| `onDocument<Event>` | `document`                                    | `{ event, target }`          |

[[toc]]

## Resolution order

`onWindow` and `onDocument` are **reserved prefixes** and match first. After them a name is resolved **children-first**, then refs.

`onWindowResize` binds to `window` even in a component whose `config.components` holds a `Window`. To reach a child with that name, use `@on('Window', 'resize')`.

The rule is about method names only. `onClick` and `onDocumentClick` are different names and both can exist on one component; a click on the element fires both.

## `on<Event>`

```js twoslash
// @twoslash-cache: {"v":1,"hash":"7fa7e767e264964248713851ec22da15ac890d4b9c170fb4ee9382a0172efb57","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8aQQFIpNZOeaLRAAVh2WXWmyQADZdgsDgwPCCwRDTudEAAma63Uj3R4ot4fHB4H5kP70JhsTg8XxA44yOT0OLKAyabS8PTHQzaMwWcJ2BwnZyudyebys/xyIIhfhhGyRaKchQJJKpdKZbJ5KgFIpwUoVaq1eqNZptDrdXr9QbDUbjSYzOZ7THIlYIsAbLaIeF7DFHCRObJfIkgG53B50wkARkp1E+NOIdN2/w8jCwfLImD42PBMHiqrAADN2ClELxgOZeI3eGBmJYYLXOqQzikANzmF6Qr1IAAcMNWiMDqOo6MOHnLVZSEbOXwAzMS4+TninMNTvhnyFmGTm81oCxg+C22x20F3/YOFpillO1v6kUG0ftZ+BW1LI0g1zGJJkgmBIXNuaZ7r8h6YiAjBtps0BFqCJbxBEADCHD8DkjCBFEaC1swYDnrWRAQOwUD3tCiaJgA7OOr6BnR06fjB6GYUaWTLkgY6ARuIHgbuBD7vSMG5nc8FkHwuHRARRGUZiiYEjxL4BtxH6hh40kMHiXw8bGpLxk8iZge8qaCbSB7UNmsFYOJAySUqeGyRg8lIImK7DvRqmwupX5aUu+JTvpwFPK0AlfEJUFWUeICES5noPm5rTwipb6JsGM4wXmWkACIwBWzBdKw2mcYF64GZuxkvLMMbQBFVg2BKwCSrwLy8BWmiWLwADkAACnQ9H08HMBaNR1A0TTdX2YDmICirFmsWrci19ZgI28xoOw/ChJW1YCnWzY/rW3ULTA3WtdNDa8GxW3YVpfCrU2jnRPE2UkNEeUFUVaCMNw02Ni8/ZOMNSCgLEYBwH0YB4JUIAvC8QA"}
import { Base } from '@studiometa/js-toolkit';

class Toggle extends Base {
  static config = { name: 'Toggle' };

  onClick(event) {
    event.preventDefault();
  }
}
```

The event name is the method name after `on`, in lower case: `onPointerDown` is `pointerdown`.

## `on<Ref><Event>`

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"d3f9157279e6625faa26a3d9be58d3655bc97540400a178a92d1fbe3bb8515ad","data":"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"}
import { Base, type RefEvent } from '@studiometa/js-toolkit';

class Tabs extends Base {
  static config = { name: 'Tabs', refs: ['tabs[]'] };

  onTabsClick({ event, target, index }: RefEvent<HTMLButtonElement>) {
    console.log(index, target.textContent);
  }
}
```

```ts
interface RefEvent<T extends HTMLElement = HTMLElement> {
  event: Event;
  target: T;
  index: number;
}
```

`target` is the **ref element** the handler matched, not `event.target`. `index` is the position in a list ref, or `0` for a single ref.

The ref is named as it is **declared**: `onTabsClick` for `config.refs: ['tabs[]']`.

## `on<Child><Event>`

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"6e0b3ddc7bb01f813ef0202a7e72a66f28e6b77562b4de8b732d9e7e60ecf02f","data":"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"}
import { Base, type DelegatedEvent } from '@studiometa/js-toolkit';

class AccordionItem extends Base<{ $emits: { open: { height: number } } }> {
  static config = { name: 'AccordionItem' };
}

class Accordion extends Base {
  static config = { name: 'Accordion', components: { AccordionItem } };

  onAccordionItemOpen({ event, target, payload }: DelegatedEvent<AccordionItem, 'open'>) {
    console.log(target.$id, payload.height);
  }
}
```

```ts
interface DelegatedEvent<T extends Base = Base, K extends string = string> {
  event: Event;
  target: T;
  payload: EmitDetail<PropsOf<T>, K>;
}
```

`target` is the child **instance**. `payload` is `event.detail`, typed from the child's `$emits`.

::: warning `config.components` is what disambiguates the name
`onSliderDragStart` is `SliderDrag` + `start`, or `Slider` + `drag-start`. The name set from `config.components` decides. A child that is not declared there is not resolved.
:::

A lazy child works the same way, because the key is the name and nothing has to be downloaded to resolve a handler.

## `onWindow<Event>` and `onDocument<Event>`

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"70c90b02eef76278f6cc62af1f0877763f2f799ab0b4d8db15b4d1a9e2e28e91","data":"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="}
import { Base, type GlobalEvent } from '@studiometa/js-toolkit';

class ClickOutside extends Base {
  static config = { name: 'ClickOutside' };

  onDocumentClick({ event }: GlobalEvent<MouseEvent>) {
    if (!event.composedPath().includes(this.$el)) {
      this.$el.removeAttribute('data-option-open');
    }
  }
}
```

```ts
interface GlobalEvent<T extends Event = Event> {
  event: T;
  target: Window | Document;
}
```

- **Phase: bubble, always.** `onDocumentClick` hears what `document.addEventListener('click', …)` hears. To hear a descendant's non-bubbling event, use `on<Ref><Event>`.
- `target` is the global the handler names. There is no `payload` and no `index`.
- Listener options such as `once` and `passive` are not part of this. Use [`$on()`](/api/instance-methods.html#on) for those.

## Delegation

Ref and child handlers are delegated from `this.$el`:

- **One listener per event type** on the root element.
- The handler walks from `event.target` up to `this.$el`, reads the instance map of each element, and calls `on<Name><Event>` for the first **mounted** instance that matches.
- A ref or a child inserted later needs **no new binding**.
- Events that do not bubble — `focus`, `blur`, `scroll`, `mouseenter`, `mouseleave` — are delegated from the **capture** phase.

## Typing

A method named by convention is **not typed by convention**: the name is resolved at runtime, so annotate the payload with `RefEvent`, `DelegatedEvent` or `GlobalEvent`.

The [`@on` decorator](/api/decorators/on.html) checks that annotation against a real target instead of leaving it unverified.

## Dynamic sets of events

A handler name belongs to the class. When the set of events is **data** — one subscription per markup declaration, with its own modifiers — bind it yourself and own the cleanup:

```js
mounted() {
  return this.$options.events.map((type) => this.$on(type, this.handle));
}
```

That is the intended path, not a workaround.
