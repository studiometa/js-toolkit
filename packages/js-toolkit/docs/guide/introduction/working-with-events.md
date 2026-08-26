# Events

Everything a component announces is a real DOM event, and everything it listens to is delegated from its own root element.

[[toc]]

## The conventions

| Method name         | Listens to                                    | Payload                      |
| ------------------- | --------------------------------------------- | ---------------------------- |
| `on<Event>`         | the component's own element                   | the raw event                |
| `on<Ref><Event>`    | a declared ref, delegated                     | `{ event, target, index }`   |
| `on<Child><Event>`  | a component in `config.components`, delegated | `{ event, target, payload }` |
| `onWindow<Event>`   | `window`                                      | `{ event, target }`          |
| `onDocument<Event>` | `document`                                    | `{ event, target }`          |

Every one of them is bound for the **mount cycle** and removed by `$unmount()`.

## The component's own element

```js twoslash
// @twoslash-cache: {"v":1,"hash":"1e1fb7cf910135011c799269aafffceafda4226ca5e2d67c6ff2eccafa2aaf9d","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8aQQFIpNZOeaLRAAVh2WXWmyQADZdgsDgwPCCwRDTudEAAma63Uj3R4ot4fHB4H5kP70JhsTg8XxA44yOT0OLKAyabS8PTHQzaMwWcJ2BwnZyudyebys/xyIIhfhhGyRaKchQJJKpdKZbJ5KgFIpwUoVaq1eqNZptDrdXr9QbDUbjSYzOZ7THIlYIsAbLaIeF7DFHCRObJfIkgG53B50wkARkp1E+NOIdN2/w8jCwfLImD42PBMHiqrAADN2ClELxgOZeI3eGBmJYYLXOqQzikANzmF6Qr1IAAcMNWiMDqOo6MOHnLVZSEbOXwAzMS4+TninMNTvhnyFmGTm81oCxg+C22x20F3/YOFpillO1v6kUG0ftZ+BW1LI0g1zGJJkgmBIXNuaZ7r8h6YiAjBtps0BFqCJbxBEADCHD8DkjCBFEaC1swYDnrWRAQOwUD3tCiaJgA7OOr6BnR06fjB6GYUaWTLkgY6ARuIHgbuBD7vSMG5nc8FkHwuHRARRGUZiiYEjxL4BtxH6hh40kMHiXw8bGpLxk8iZge8qaCbSB7UNmsFYOJAySUqeGyRg8lIImK7DvRqmwupX5aUu+JTvpwFPK0AlfEJUFWUeICES5noPm5rTwipb6JsGM4wXmWkACIwBWzBdKw2mcYF64GZuxnhemUU0DFub5nY56SpIQp8iY8QACQwKwtYABLSAAsgAMgAomsbbRK5iC0YmXlvgBIZft1rABV8THBYZyzVZBmbRaJJ44E1fDjTAk1oGWfhwMN7CdLWOUAPKDSCORRDdnROC4bh4F4PikDAzBQFUESsCEABUYMAAaAv471oJDEO8IdZ68BAFa8JsPinedvBnI8BX8D45bJGcIjMLwHAkLwj3PRAr1gHDoSsGsDx9GAvD/dlqjRN2GPyjDZOFF2ABGXQ0Kj6OY3IE14fEwL4LdAiEXzUS8MLPhdKoUAYxAvCWIR7BYEVzDi1LAsU7dF3mOYyCDTlAByvAAEr5WQUSE1MjAmsUZTDD1p6kPElgQAAXuwzPMKh+wlF9cAlAA6jAwslAAgmoACSJTY3hJQC3D3DTbRykTssvkwXnltrUgG1AVtM0rjtkV7XVonwYQUB8DTL1vZb8S1DiMCMLU9PXreKQULwFa2ITAD8tbC3UayEdw8+LwDYCfTKP3yhDkP9yWjDcAjYN6wM7cSyr1NPd3DOW7j0RkATf1nRmZPs3Qlu88PqsVpoliXxwTovBCLa3+t0UgYARAFVYKoOW6dJbym/uzFw8AwAAHIYi0Dvk0NBZMoCwG1iAy+FYuhgFZhEDmAwugQJEDeLopZrZgFtg7Z2rt/pkJgJ7b2Zpfa4VYAHIOodw5CCjikGOMoE5J1ThnEoXc6Y906CUfeawC4JSoqOeak4y54GUb+LiiAa58SeASBuswYzQAilYGwEpgCSl4C8Sef9eBoIAAKdB6H0eCzALQ1EXjaNBfYwDmHNsWNYWpuR2PrOzXg8w0DsH4KESs1YBR1mbD+WsaDQkwDQfYwJDZUZgAwvE7CWk+BRKbI5aI8RsokGiHlAqRU0CH0CRUzYt0uo9UusIOGfdkJrEYGg26VQyTsBIGg7gLT7H9icF4pAoBYiQLZngSoIAXgvCAA==="}
import { Base } from '@studiometa/js-toolkit';

class Toggle extends Base {
  static config = { name: 'Toggle' };

  onClick(event) {
    event.preventDefault();
    this.$el.classList.toggle('is-active');
  }
}
```

## Refs

See [Refs](/guide/introduction/managing-refs.html#event-handlers). The payload's `target` is the ref element the handler matched, not `event.target`, and `index` is its position in a list ref.

## `$emit()` — a native event

`$emit(name, payload?)` dispatches a bubbling, cancelable `CustomEvent`. `detail` **is** the payload:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"5f3220a830b588ae47251930e05ca9f8b4f16533a1374e3d3a2b9c1531b18671","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8AAinFYEBSTnmi0QAFYdll1pskAA2XYLA4MDygtgQpzZL4AJmut1I90eqLeHxweB+ZD+9CYbE4PF8QOOMjk9DiygMmm0vD0x0M2jMFnCdgcJ2crncnm8bP8ciCIX4YRskWiXIUCSSqXSmWyeSoBSKcFKFWqtXqjWabQ63V6/UGw1G40mMzmeyxKJWiLAGy2iARe0xRwk+LORJJdwe9MQhIAjFTqJ9acR6bt/h5GFh+WRMHwceCUvE1WAAGbsFKIXjAcy8Ru8MDMSwwWudUhnFIAbnMLyh3qQAA5YaskUG0dQMYcPOWq5DTudEABmGNkuNPV7vVM074Z8hZxk5vNaAsYPgttsdtBdgODhZYpZTtYB5HB9H7WfgVvSglINcQBuWMKQTC4U0wPcCAPBksRARg202aAizBCF4jPMBGG4WsiAgdgoAfGFE0TAB2cc3yDEMZzgjDI2XMcgNJcl40JCC033X4jzghCBkIKA+A5YV+RMeIABIYEsJpJFMEAMJk4xGECKI0FrGS5MoXgsGYDBwWYKAAH4cLwqBeAAH14CAACNyhgB4zN4LpFBgKtIn42sAGEuk6MIAFESGiSRcPw+yrJsh5jCcFw3DwUE4C0tAbl4ZheEsrpLMs7IUgoARmDAfgYCEDKfCUrUAHcmnwXhNh8LSdIgPSkpEAADWBknYVgmsSdE0iQDIQFIAYulIMAECoLwfF6OLmAS7wTJKtB4l4dzvH4HJeBa5zmC6Vg0A0eaYCgJreArWwcrygqhDQPowEST0QGhLFEyWQDX0DJAGNDb9xMkhgly+MjGJA+Nt2pL5oM46hs3gxC+JQ3FSxSCBakYM5YFoWtcovIz8MIrEkwY173yor84MR2o6K+RMrkBjdQNYndILBulD0h494K0slELIPhUboDGwAwXGkEJQlqcJoMPuovBedoCmkCp9dmKeEi2Kg5nYKYGHkKlSQhKMYwxIkqSZLJiB5MU/yVN4E2kbNjTat0gzsZM8zQts+xzMc2AXIO7Clq82pLD85TAuMkLrPdiKqCiuVYvixLktS9LMuy/hcvywq1mVZTeHKzYqoVB36pMrh1ta5h2s6vUepQTIBu6YbRvlCb2CmmaDuz6JFuW2y1o2istp2vbLYOo6TtIM6M8u67btme6hwTJYCYnd7PzDDxvqaOXEETYkaaV5ZVaZmCuKYU8cDsC9eBl/nBa9R8AOI8i3rhNfvxl7fd8VzdhdhF457VLAaWEp7DAClLwF4x1NCWF4AAcgAAKdB6H0RCzBLQ1DqA0JosC+xgHMICJUxYITah5OA+sYBGzzCuvwUIlZqyCjrM2X8tZYFEJSLAiBuCGwWRwJhPg5Cmy8DKLwAAchATS2lHa1g2m1Dq18RDVU0pdceMCiBsC6D4JqYBtodXiNwxsmxW6Gx+owWBGFYHcFwY2F45huGmxRk5Wg/D9FCJKLwAA8pEHhV0IhsAshHB42VcomRkRXORrcC7TX8WFBaLjDFwGMU0UxptYHZTATLCBljuE2LAAOKgqCkCgFiCNa6eBKggBeC8IAA==="}
import { Base } from '@studiometa/js-toolkit';

class Dialog extends Base {
  static config = { name: 'Dialog' };

  open() {
    // No payload: `detail` is the platform value `null`.
    this.$emit('open');
  }

  goto(index) {
    // One optional object, and `detail` is that object.
    this.$emit('goto', { index });
  }
}
```

- It **bubbles**, so any ancestor hears it — a component, or a plain `addEventListener`.
- It is **cancelable**, and `$emit()` returns the event, so the emitter can read `event.defaultPrevented`.
- The payload is **one object**, or nothing. A value that is not an object is refused by the type and reported at runtime as `event.invalid-emit-payload`. The event still dispatches.

Nothing in the framework is gated on cancellation. It is a channel for component code.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"16469ce33386d9211e776fa86a9d6a0bad9a6be11a45767130119435ba1f7d27","data":"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"}
import { Base } from '@studiometa/js-toolkit';

class Dialog extends Base {
  static config = { name: 'Dialog' };

  close() {
    const event = this.$emit('close');
    if (event.defaultPrevented) return;
    this.$el.removeAttribute('data-option-open');
  }
}
```

### Typing the events a component emits

`$emits` in the props type maps each name to its payload object, or to `void` for an event with no payload:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"16cc25875efe389196be040cbef3c29e0aaa04b8f7335d6ba08c5417e1c5d881","data":"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"}
import { Base } from '@studiometa/js-toolkit';

class Slider extends Base<{
  $emits: {
    goto: { index: number };
    stop: void;
  };
}> {
  static config = { name: 'Slider' };

  mounted() {
    this.$emit('goto', { index: 2 });
    this.$emit('stop');
  }
}
```

`$emits` replaces the runtime `config.emits` of v3. Nothing of it stays in the bundle.

## Child events {#child-events}

A parent hears a child through `on<Child><Event>`, resolved against the names in `config.components`:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"e39ac88beeb2a3e455cec30beb6682bc2f109534361c9ec706708aaa6cebb995","data":"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"}
import { Base, type DelegatedEvent } from '@studiometa/js-toolkit';

class AccordionItem extends Base<{ $emits: { open: { height: number } } }> {
  static config = { name: 'AccordionItem' };

  onClick() {
    this.$emit('open', { height: this.$el.scrollHeight });
  }
}

class Accordion extends Base {
  static config = {
    name: 'Accordion',
    components: { AccordionItem },
  };

  onAccordionItemOpen({ target, payload }: DelegatedEvent<AccordionItem, 'open'>) {
    console.log(`${target.$id} opened to ${payload.height}px`);
  }
}
```

How it works:

- **One listener per event type** on the parent's root element.
- The handler walks from `event.target` up to `this.$el`, reads the instance map of each element, and calls `on<Name><Event>` for the **first mounted instance** that matches.
- A child inserted later needs no new binding.
- Events that do not bubble, `mouseenter` and `mouseleave` included, are delegated from the **capture** phase.

::: warning `config.components` is what disambiguates the name
A method name alone is ambiguous: `onSliderDragStart` is `SliderDrag` + `start`, or `Slider` + `drag-start`. The name set from `config.components` is what decides. A child that is not declared there is not resolved.
:::

A lazy child works the same way — the string key is the name, so nothing is downloaded to resolve a handler:

```js
static config = {
  name: 'Accordion',
  components: { AccordionItem: () => import('./AccordionItem.js') },
};
```

## Global handlers

```js twoslash
// @twoslash-cache: {"v":1,"hash":"30147118d23e3eb6664d8f0ac8a5ceff8c36c70c5e577dfc6b70b36d77c069c5","data":"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"}
import { Base } from '@studiometa/js-toolkit';

class ClickOutside extends Base {
  static config = { name: 'ClickOutside' };

  onDocumentClick({ event }) {
    if (!event.composedPath().includes(this.$el)) {
      this.$emit('click-outside', { event });
    }
  }

  onWindowResize() {
    this.$el.removeAttribute('data-option-open');
  }
}
```

- **Scope: the mount cycle.** `$unmount()` removes the listener and a new mount binds it again.
- **Phase: bubble, always.** `onDocumentClick` hears what `document.addEventListener('click', …)` hears. To hear a descendant's non-bubbling event, use `on<Ref><Event>`.
- **The two prefixes are reserved**, and they match before children and refs. `onWindowResize` binds to `window` even in a component whose `config.components` holds a `Window`. To reach a child with that name, use `@on('Window', 'resize')`.
- The rule is about method names only. `onClick` and `onDocumentClick` are different names and both can exist; a click on the element fires both.
- The payload is `{ event, target }`, where `target` is the global the handler names. There is no `payload` and no `index`.

## `$on()` and `$off()`

For an event whose name is data rather than a method name, listen by hand and return the cleanup:

```js
import { Base } from '@studiometa/js-toolkit';

class Watcher extends Base {
  static config = { name: 'Watcher', options: { events: Array } };

  mounted() {
    // `$on()` returns its own remover.
    return this.$options.events.map((type) => this.$on(type, () => console.log(type)));
  }
}
```

## Negotiated events

Two helpers let a component announce a step **before** it happens so an ancestor can take part. They are not `Base` methods and they are absent from `$emits`:

| mode          | asks for   | registers with | keeps                 | on failure                     |
| ------------- | ---------- | -------------- | --------------------- | ------------------------------ |
| **take over** | the action | `wrap(runner)` | one runner, last wins | the mutation is applied anyway |
| **delay**     | the moment | `waitUntil(x)` | many, all are awaited | the step happens anyway        |

```js
import { Base, EVENTS, domUpdate, emitExtendable, viewTransition } from '@studiometa/js-toolkit';

class Panel extends Base {
  static config = { name: 'Panel' };

  // Take over: the code that mutates announces instead of mutating.
  async render(fragment) {
    await domUpdate(this.$el, () => this.$el.replaceChildren(fragment));
  }

  // Delay: the choreography announces its step and waits.
  async close() {
    await emitExtendable(this.$el, 'close');
    this.$el.removeAttribute('data-option-open');
  }

  mounted() {
    return [
      this.$on(EVENTS.dom.update, (event) => event.detail.wrap(viewTransition)),
      this.$on('close', (event) => event.detail.waitUntil(this.leave())),
    ];
  }

  leave() {
    return Promise.resolve();
  }
}
```

- **`defaultPrevented` is ignored.** The step is announced, not proposed.
- **A registration is valid only while the event dispatches.** A listener that keeps the function and calls it later is warned (`protocol.late-registration`) and ignored.
- **The work of the emitter always completes.** A runner that throws, rejects, or never calls `apply` loses the animation, never the change.
- **An unclaimed `domUpdate()` is synchronous.** With no listener the mutation runs before the returned promise exists.

See [`domUpdate()`](/api/dom/domUpdate.html) and [`emitExtendable()`](/api/dom/emitExtendable.html).

## Framework events

`EVENTS` is a deeply frozen object of the events the framework itself dispatches, all namespaced `js-toolkit:`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"3832de98eb13b02a7f1b923cc868222c035d4d3b7013e32ed679f9dde349c5f7","data":"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"}
import { EVENTS } from '@studiometa/js-toolkit';

EVENTS.component.mounted; // 'js-toolkit:component:mounted'
EVENTS.component.unmounted; // 'js-toolkit:component:unmounted'
EVENTS.dom.update; // 'js-toolkit:dom:update'
EVENTS.diagnostic; // 'js-toolkit:diagnostic'
```

Component events are typed lower-kebab string literals declared through `$emits`. Private framework transports — the context request, for one — use module-local constants and are deliberately **not** in `EVENTS`.
