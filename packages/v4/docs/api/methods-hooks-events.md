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
// @twoslash-cache: {"v":1,"hash":"d59bc2e332ec5b84db66a2c6b6787663c77f6fabd89df7a5f6a294482509f6f5","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvNIQfn4+Ti5u0QCsAOzevgFBiABsYW6R0SCNza0JSUgATOmZpNm5SENFJTh4hCTkYfJMbJw8AkJwyhIycvS+Sg7qmtq8enGG2mYW1rb2cW3h0W6ixAPn8gRCowiUTwf1myWBGSyOUqiHmAEZNtRSjsKvtqIcYowsE8yJg+FMWjAAHT8CBgABm7D8iF4wHMvA5vDAzEsMBZLlIiT8AG5zAV/h0kAAOKV9MGDEbUMbQmK0hlMpwcOaIADMSyRa3ymMw2xiu0qBxqhOJWlJGD43N5/LQgv8Evc+S8IP64MQoSVUImjviIMSyT1IERK2ReXmKWN2LNuKqBJAjF5gWg5KalKpdIAwhx+ABrRgwEhgNAs5hge0sogQdhQd3RNFxuUDJC9APjPAFovFzVhpCdfXRw3zBOm8p7FNWtNYLIZsh8cu+Ku8GsYFtINuy73ykeQ3sxNeVofa0eR5arFFo+PFLHT8146oTIlLqIruQVjdbneIGiwRoh2vpXuEJ4gGeDBwusY63nkwRTmUL5zhM/5UO0HpAd2oKdoB/oQSqIDEtBAAiMD0swACurAwaG2qKlGCG7vGAC66TQGUVg2HYrIPLwBS8PSmiWLwADkAACLjUVA7AQBmzAAPQAFZwAAtGgEAQKwxbsGg6lEME4mimA5h1BcDQ5j4NwKPccSsuyvDtGg7D8AIdKMn4Lz8cGLLiRSPjiYJplOf2bmltBfBsmAnI/uuVKkb+FFUbRaCMNwpkcgUYpOIpSCgPIvhwPJYB4GpIAFAUQA="}
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
// @twoslash-cache: {"v":1,"hash":"aa7cb574d3adf22c3b661f938d783fe245e0a10110b6a5b6ae509e6108ffd61c","data":"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"}
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
// @twoslash-cache: {"v":1,"hash":"7dae9d87b2c576f2d55398480a3de96d9d47a5de151aa768b9473aeab228c4e1","data":"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="}
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
