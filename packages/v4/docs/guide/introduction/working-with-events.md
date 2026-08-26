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
// @twoslash-cache: {"v":1,"hash":"641dcac5e31faa092f5833a73f54ee0656da7b209c9e3d6570d27cb4df4764ee","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvNIQfn4+Ti5u0QCsAOzevgFBiABsYW6R0SCNza0JSUgATOmZpNm5SENFJTh4hCTkYfJMbJw8AkJwyhIycvS+Sg7qmtq8enGG2mYW1rb2cW3h0W6ixAPn8gRCowiUTwf1myWBGSyOUqiHmAEZNtRSjsKvtqIcYowsE8yJg+FMWjAAHT8CBgABm7D8iF4wHMvA5vDAzEsMBZLlIiT8AG5zAV/h0kAAOKV9MGDEbUMbQmK0hlMpwcOaIADMSyRa3ymMw2xiu0qBxqhOJWlJGD43N5/LQgv8Evc+S8IP64MQoSVUImjviIMSyT1IERK2ReXmKWN2LNuKqBJAjF5gWg5KalKpdIAwhx+ABrRgwEhgNAs5hge0sogQdhQd3RNFxuUDJC9APjPAFovFzVhpCdfXRw3zBOm8p7FNWtNYLIZsh8cu+Ku8GsYFtINuy73ykeQ3sxNeVofa0eR5arFFo+PFLHT8146oTIlLqIruQVjdbneIGiwRoh2vpXuEJ4gGeDBwusY63nkwRTmUL5zhM/5UO0HpAd2oKdoB/oQSqIDEtBAAiMD0swACurAwaG2qKlGCG7g+WwocmlrvjaOB2PaDySG8TwmFSAAkMCsCyAAS0gALIADIAKI+Ly56YQCu7dP6eG+hGRETOJrAXsk3bMTGnjITis5cUwPF2nwykwKpaA0uccDyewLgsmRADysmNMWvgeS4ThQBA/AIDE0j4DAvCkDAzBQAAtHSrAYLwABUGUAAZ1BcwVoNlWW8HZfG8BA9K8IEsWOc5vCJLkVH8LFaquIkIjMLwHAkLwvn+RAgVgAVAgQKwPg5OwdJxTApGqJWQpVTFZz1MwaAuuwABG1E0OVlXVXIKnrlSDT4J5Ag1otvi8BtsXUaoUBVRAvCWDW7BYLRq2xfteUiBwLhUuY5jILJZEAHK8AASpRZC+M1AC6jD4Gt2iIAA9KjsAkKwtqkFSlgQAAXuwY3MHmEQY+FcCowA6jAG2owAgmoACSqO1euqM/QV3AAWi3T7jpgxevptRuQVxldvB5mATqllJtZ+LzumUSEFAfB9QFQWeS5aA5j4jC64Nzqun4FC8PStjNQA/CyG0QKNCVgNwtv2z4NahZTeDRbFWXZbr0wwIw3BFRlz0q9Au2Xb1fma0N2v1ZWZBNbF8X4yQHVgDc2sLYbV30polhR399g1g98VoNRpBgCIVGsKox3M3tS255nYXwGAADk9h0PH7BoB3HVQLAD2l1H9LUWAE1TeXlfV1VpDUdSgNgMDYOQ9D8WTzACNI2gKPo5jEk43jhPE0IZN+BTEU03TjMs6jGsDVrLio/7lI8+pkqATKoEKsexFvxmAxEyUsJyyzhukaAZQrA2DsKyB4vACjmwLrwDuAABFw1EoCTQzMwVGAArOASVdajWLH3JKRBggd1FGAcwP0Gh61ivIO4lxVCsnZLwdoaB2D8BGuqPwLx4HBhZB3CkPgO6IJoRw/sPDSzQT4GyTOnJoJUlIr+CiVFaJoCDjQzki1PJiQkq5YQBUqSAMDh3TySVVjsBIB3bgujEFiicLgpAoBmHV0mmAPAhCQAFAKEAA==="}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"46cb02b072153e9be8797d9afaf768e337b5cd302aef6cfcd1b1321dc66a798e","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvAAinKwQfk4ubtEArADs3r4BQYgAbGFukdEgTWytThxJSABM6Zmk2blIw0UlOHiEJORh8kxsnDwCQnDKEjJy9L5KDuqa2rx6cYbaZhbWtvZx7XC0R6yxAPn8gRCYwiUTwAISC0QoIyWRylSRAEZttRSnsKodqMcYowsC8yJg+NMWn4AHT8CBgABm7D8iF4wHMvC5vDAzEsMDZLlIiT8AG5zAVAZ0kAAOGX9CFDUbUcawmL0pksuaJZIAZhWqI2+WxmF2MX2lSONWJpK05IwfF5/MFaGF/il7nyXjBA0hiFCKphkyd8TBOqQ+pAKLWaLyixSJtx5vxVSJIEY/MC0EpzVaNLtYEY3DZRAg7CgHuiGPjCsGUMDEzwBe1iK6BpjRsWibN5QOqet6czhCgfDikg+LxMNIAJDBLOw0JJTCAC8vjIwYCQwGg2cvV5ReFhmBgWswoAB+EtlqC8AA+vAgACMAFYwHJ33gAV0UMGZSRHbIAMKfi4ECWAAolui6luWH5Pq+OTGE4UAQPwCAxE0cBHmgGS8MwvCPp+j6PvMfgUAIzBgPwMBCCRMByFBvAAO4LvgvCBPRR4nhAZ54SIAAGsCuOwrD8TSVTMH46HIMgICkFEn6kGACBUNI+D0VA7BYcwOHqTem6+GgNK8IB6n8AA1rwgm/swn6sGgGgGduMBQPxvCMrYFFUTRQhoOwDLiQAuoFVAdJ6GIeMq4J1ogbYNmqICzvODAIskfRRqs6zooUxQ4j2FoEtUkwZlEw45jMtJ+BAaAQIwiSwLQbKUQ6V7lpWSwYvKPqKvW4SNjEVU1S2yQYmkGWGuiXa5aaZQFf2xVHmsmZkHw9V0E1YAYO1SKLJG0V+nFfUJWttDDUgo3tlleQ9N2s0plaxVDtmTzjgYk7GDOc4LkuICDRAa4blBu6/dV/0Hlxp4Xq1N73vBb72Pe36wH+LnFiZIE1RBUGSDBMMPi+8NIVQKFoXgmHYbh+GEcRpHkfwlHUbRPgMYZzGsex6mHsekN8VZQnMCJYkSVJSAyXJClKSpIBqRpWkU3pLPbsZplvpZ1mMrZ9mOVBLluR5pBeYzvn+WAQUhc4QJLB4XX7UMh2qpMSULmdiDVpdsaeLdeJ9g9TC2jgdgOrwJ0bVtoWW4guoYgGttIPbQZ4CdLtu+NHaTV0BTm/SsCJ78djsk8vAFO5miWLwADkAACLifppYFRMwAD0z5wAAtDVECsOZC6t0QwTl+KYDmHUVyNLmfh3AojxxOynK8B0fn8AIDLMhPejADyfIChXVKtOXReD3PBZFrPYDcrwjeN7wAByEBc9xZ5stZwmicHIgcYevn62XRBsJ+9H8TAHZUSNI55ckCFpT6yVGDlwLOXbgg8uQFHMHPP6dUfy0D4ByM+3JL68AAPJJAfFgPyDI2D4wQmgcilEbzPwFq/LSHMdIUPhqAnB4D8CQKdmgGBf1y7kQ3idIuCC57ILAJKKgmZmBIFAPIXwcATZ4BbiAAoBQgA="}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"b5fe681a5e12cdfdd249a26584df851a8d4d908e6322a30ac52a296f88f90861","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"61c9ca14d92485a08d1102fa267af2ef1ef742dc2da3c15543ae063ca2b54c96","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"3588aaa4fad252aeddb08f4ea9f3f0172b5480fec7addc68e58f5e201b329ee2","data":"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"}
import { Base, type DelegatedEvent } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"b059098e1d88d353bf17e49b175ec8839363d0e60042c1e57dac18d90f1c374b","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"4be32aa2e4c3d8ac70df162e8372131735d9b395308826383b062c104e476e39","data":"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"}
import { EVENTS } from '@studiometa/js-toolkit-v4';

EVENTS.component.mounted; // 'js-toolkit:component:mounted'
EVENTS.component.unmounted; // 'js-toolkit:component:unmounted'
EVENTS.dom.update; // 'js-toolkit:dom:update'
EVENTS.diagnostic; // 'js-toolkit:diagnostic'
```

Component events are typed lower-kebab string literals declared through `$emits`. Private framework transports — the context request, for one — use module-local constants and are deliberately **not** in `EVENTS`.
