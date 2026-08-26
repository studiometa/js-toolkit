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
// @twoslash-cache: {"v":1,"hash":"d59bc2e332ec5b84db66a2c6b6787663c77f6fabd89df7a5f6a294482509f6f5","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8aQQFIpNZOeaLRAAVgA7Kt1pskAA2XYLA4MDwgsEQ07nRAAJmut1I90eqLeHxweB+ZD+9CYbE4PF8QOOMjk9DiygMmm0vD0x0M2jMFnCdgcJ2crncnm8bP8ciCIX4YRskWiXIUCSSqXSmWyeSoBSKcFKFWqtXqjWabQ63V6/UGw1G40mMzmeyxcOJWSRW0QO2oGMOHmOTmyXz9NzuD3pRIAjFTqJ9acR6bt/h5GFh+WRMHwceCYPE1WAAGbsFKIXjAcy8Ru8MDMSwwWudUhnFIAbnML0h3qQAA5h4iwBtA2iQ/swyBy1WUpGzl8AMwkuMU54pzA074Z8hZxk5vNaAsYPgttsdtBdieDhZYpYrf0T5FB9GzrHgVvSqNIdd51JckE0JC4dzTfdfiPb9GDbTZoCLUES3iCIAGEOH4HJGECKI0FrZgwAvWsiAgdgoAfaFEzA8dJyQBEZ0xPB0Mw40shXJAYQ3Ml4yeQkIL3AgDwZWCsDueCyD4XDogIojKKxaix1fOjYU/JiPGkhh8S+LigM3BNE3A95U0EulD2obMQFzcSBkk5U8NkjB5KQRNWkTWj310vZ1JATTlwJadYx4rdWgEr4hOgizjxAQinK9R8XNaBi1jfQNXLUuc800gARGAK2YLpWC09iAu4kCnkMl5ZnnaBwqsGxJWAKVeBeXgK00SxeAAcgAAU6Ho+ng5hLRqOoGiaFpWi6vswHMQElWLNZtR5Zr6zARt5jQdh+FCStq0FOtm1/WsusWmAupamaG14FjtuwzS+DWpt7OieIspIaJcvywq0EYbgZsbF5+ycIakFAWIwDgPowDwSoQBeF4gA=="}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"aa7cb574d3adf22c3b661f938d783fe245e0a10110b6a5b6ae509e6108ffd61c","data":"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="}
import { Base, type RefEvent } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"7dae9d87b2c576f2d55398480a3de96d9d47a5de151aa768b9473aeab228c4e1","data":"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"}
import { Base, type DelegatedEvent } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"0dfad2bf894c7dcdb7d52627d397f49cd3eeb113785362e59cdd8d8438216530","data":"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"}
import { Base, type GlobalEvent } from '@studiometa/js-toolkit-v4';

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
