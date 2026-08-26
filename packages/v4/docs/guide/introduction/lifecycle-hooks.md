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
// @twoslash-cache: {"v":1,"hash":"6e9c395a3e4e90ce6a99392ad410ca0b46f1e9b38f666ee788b52b70b23118f8","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"04e73299d7c49b1cbbf9a65f3ece298d2db554836ad17715a7c135f7d577f0f8","data":"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"}
import { Base, useScroll } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"73ad57c23286be730ef4c29ac9b1a9102c36133fc629400404f2c537c2429f74","data":"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"}
import { Base, useResize, useScroll } from '@studiometa/js-toolkit-v4';

class Sticky extends Base {
  static config = { name: 'Sticky' };

  mounted() {
    return [useScroll().subscribe(() => {}), useResize().subscribe(() => {})];
  }
}
```

An async `mounted()` works the same way:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"171b2fc7942fa37c0bb9212380df9e0e990f50ea0d107b6f5fd0a7dfe2f6101d","data":"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"}
import { Base, createContext, type Signal } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"2fbe886dc5977e6d9eed60514f837332610a0f60c0389db3b9fb6b9fd08ab424","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"079df0ae22b777b7e4e8989ed5676fa7585bc05f2ad400d87de7fadf218fb8ea","data":"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"}
import { EVENTS, type LifecycleEventDetail } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"583673fc21894168c2c5b4563977b2fae9c36ba56a814cc43218b32ff546fe8a","data":"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"}
import { whenDOMSettled } from '@studiometa/js-toolkit-v4';

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
