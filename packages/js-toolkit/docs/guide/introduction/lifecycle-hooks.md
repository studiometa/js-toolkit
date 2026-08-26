# Lifecycle

**`mount` and `unmount` are the whole lifecycle.** There is no third, permanent notion: a component never declares that its work is over, and nothing marks an instance as never mountable again.

[[toc]]

## The two notions

| Notion           | What it is                        | Effect                                                                                                             |
| ---------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| **disconnected** | The element left the document.    | The registry calls `$unmount()`. The instance **stays on its element**, and a re-inserted element mounts it again. |
| **unmount**      | The reversible opposite of mount. | Unbinds the cycle's listeners, runs the `mounted()` cleanups, cancels the scheduled tasks, calls `unmounted()`.    |

A **move** gives one removal record and one addition record: the instance is unmounted and then mounted again, with the same identity, and the state of the cycle starts over. This is the behaviour of `disconnectedCallback` and `connectedCallback` for custom elements.

**Unmounting a parent does not unmount its children.** Each element answers for itself.

## `mounted()` and `unmounted()`

```js twoslash
// @twoslash-cache: {"v":1,"hash":"78af471525674eacde9b544df6a1b0f9ca1170064114be0ac36563988da77f19","data":"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="}
import { Base } from '@studiometa/js-toolkit';

class Player extends Base {
  static config = { name: 'Player' };

  mounted() {
    console.log('the element is in the document');
  }

  unmounted() {
    console.log('the element left, or the declaration was withdrawn');
  }
}
```

## `mounted()` returns its cleanup

`mounted()` can return a function, or an array of functions, sync or async. They run on the next `$unmount()`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"a6e344e772190f71d5bc84c5b881cc01fb4ed3ccf01a20ebf348c72bad97724c","data":"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="}
import { Base, useScroll } from '@studiometa/js-toolkit';

class Header extends Base {
  static config = { name: 'Header' };

  mounted() {
    // `subscribe()` returns its own unsubscribe — hand it straight back.
    return useScroll().subscribe(({ directionY }) => {
      this.$el.classList.toggle('is-hidden', directionY > 0);
    });
  }
}
```

Several cleanups: return an array.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"13f29d639ecb9a18bacafea53e641acf122ab2417714e525330d1c83b039ae64","data":"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"}
import { Base, useResize, useScroll } from '@studiometa/js-toolkit';

class Sticky extends Base {
  static config = { name: 'Sticky' };

  mounted() {
    return [useScroll().subscribe(() => {}), useResize().subscribe(() => {})];
  }
}
```

An async `mounted()` works the same way:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"553ddd826feb7337b273c2dccd38b4fed18aa25568e3b9ebe328cbbaf9e498b7","data":"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"}
import { Base, createContext, type Signal } from '@studiometa/js-toolkit';

const CountContext = createContext<Signal<number>>('count');

class TodoCount extends Base {
  static config = { name: 'TodoCount' };

  async mounted() {
    const signal = await this.$inject(CountContext);
    // Released on unmount, even if the await resolved after it.
    return signal.subscribe((count) => {
      this.$el.textContent = String(count);
    });
  }
}
```

If an async `mounted()` resolves **after** the unmount, the cleanup runs immediately.

`unmounted()` stays available for the cases the returned cleanup does not fit.

## What is unmount-scoped, and what is not

| Registered in                             | Scope            | Released by                        |
| ----------------------------------------- | ---------------- | ---------------------------------- |
| a `mounted()` return value                | the mount cycle  | the next `$unmount()`              |
| a pending `$inject()` request             | the mount cycle  | the next `$unmount()`              |
| `on<X><Event>` handlers, service mixins   | the mount cycle  | the next `$unmount()`              |
| `$read()` / `$write()` tasks              | the mount cycle  | the next `$unmount()` cancels them |
| `$provide()` in a field initializer       | the **instance** | nothing — it dies with the element |
| `$watchChildren()` in a field initializer | the **instance** | nothing — it dies with the element |

A component whose declaration is withdrawn therefore keeps providing context until its element goes.

## "Do this once per element"

Because `$unmount()` leaves the instance on its element, **a plain field survives every move, re-insertion and `swap()` that preserves the element**. "Once per element" is instance state, not a lifecycle decision:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"1822959ec582125a080d8971fed5b6132711e9c26489c5b9c31af248a0eed79a","data":"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="}
import { Base } from '@studiometa/js-toolkit';

class Reveal extends Base {
  static config = { name: 'Reveal' };

  hasRevealed = false;

  mounted() {
    if (this.hasRevealed) return;
    this.$el.classList.add('is-revealed');
    this.hasRevealed = true;
  }
}
```

What a field does **not** survive is an element that is genuinely replaced — which is exactly when the work should run again.

## Withdrawing a declaration

When an element stops declaring a component — the token leaves `data-component`, or a responsive declaration stops matching — the registry unmounts the instance and **drops it from the element**, so declaring the name again builds a new one.

That is the registry rearranging its own bookkeeping. The instance only ever sees `$unmount()`.

## Announcements

Every instance dispatches a framework event on mount and on unmount, carrying itself in the payload:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"88ecfea50e08a71d2adb580735a2ba1696c914d334f1cce94b8e824a20335045","data":"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="}
import { EVENTS, type LifecycleEventDetail } from '@studiometa/js-toolkit';

document.addEventListener(EVENTS.component.mounted, (event) => {
  const { instance } = (event as CustomEvent<LifecycleEventDetail>).detail;
  console.log(`${instance.$id} mounted`);
});
```

- The **mount** event bubbles from the element, so any ancestor can follow its descendants with no declaration.
- The **unmount** event dispatches from `document`, because the element can already be detached.
- An instance that is scheduled but **not mounted** announces nothing.

See [`$watchChildren()`](/api/instance-methods.html#watchchildren) for the component-level API built on this.

## Waiting for the DOM to settle

`whenDOMSettled()` is the completion boundary for morphing, fetch updates and breakpoint crossings. It drains the pending mutation records, follows the mutation chains of eager lifecycle work, and resolves after the eager mounts and the teardown:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"5a074619e474be6bc350b4c831ae05c65ebc6557f9e5e9d87558215a93ea05cd","data":"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"}
import { whenDOMSettled } from '@studiometa/js-toolkit';

async function replace(el: Element, html: string) {
  el.innerHTML = html;
  await whenDOMSettled();
  // Every eager component in the new markup has mounted.
}
```

It does **not** wait for visibility, interaction, idle or media conditions, and it does not await the promises returned by `mounted()`. [`swap()`](/api/dom/swap.html) awaits it for you.

## Manual mounting

`$mount()` and `$unmount()` are public, and calling them is legitimate — but on a page the registry does it, and doing it yourself is nearly always a sign that a [mount strategy](/guide/going-further/mount-strategies.html) is the answer instead.

```js
instance.$unmount(); // reversible, the instance stays on its element
instance.$mount(); // a new cycle, same identity
```
