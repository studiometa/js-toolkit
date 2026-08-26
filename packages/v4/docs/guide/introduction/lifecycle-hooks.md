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
// @twoslash-cache: {"v":1,"hash":"583673fc21894168c2c5b4563977b2fae9c36ba56a814cc43218b32ff546fe8a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO74YYACIB5ALIBlGGjSsYURt0S8ACqQgBbdnBgAeIhHZQAfAB0w7M1gik0MuYtUaWjpQlCBQECIIiCAASvAQrCS+8rwwJKQYvGaCaMzikrwigqSk8tqZEABGVqREzJU6vJWZIl4wvPhcTTDyrlimIvBWULzMYCPsaHCpzADmZLwc/DAiGCKN0l4A1h1dpMIAdK6uACr4lrzh8LyQPtLMkwJevESW7JXsHJgUvOxgNKRmGIJGAfg4dD9nmZdJxXK1xpMQXAfmMJj4rtNbqN7o9+uZLNdSmhimBdE1MgADMwQYQ0PTcCkHUK5WZRZDIEAcMBbUL4LRYOCIAD0QoAVnAALRoCAJLaTCVEAAsBzgxKgEmhuQOsCIQuYWHYQvCZiFsnkynUmm0ugOfLMrBAAF1HVRVcxvEgAJxUHRgWZofBIACMiqouVI8wY0TN/ktQV0oS5uEQAAYqCJOoCxGQvQBfCjobDJgjEHNhuhRkBCUT5KSlLCsIEwRgwViGACiOmh/x+drbvFVpD+swMxlMFistnsTlCbo9iAA7AA2H3yf2Bxdh92RvD1xuDRN/ZMAJnTmaBAODAFZ84WcHhCOlmRWmFh3cxNWQ+K2O12yrPwyjAAOUNOTXAMkFPaht00PBW0PUlILPd9s3IRBjwAZlvagiwfUtyHLeg8D+AF+CbXhOxgbsGCocJIjwAAqBiKUo6iKSY35pgDdpqVVXh5lJQFWCaLh2nWLhpn4cdfHYDNRlYYTWyospeCqUUVimXhGHYA4YAOSFKnUsQuM6Hx61KKx/lSP9/h4X4pGYXgFAiQRqPsuQhzQA5eAASR8SRWEyTppk1QgoGmVFeDxHBvHYa5WjMakpGleThLlcZpggfhrOU2zvJUNoBxwER2H4WTCkbOArGmP4PMeKTzAomyvOOMBkBUBQADleDiZZSlEGBHUYPk0AFYUjTSVsIBig5qQAL0+RsDi8WYjQiOAhQAdRgSohQAQSMHyhVYspuAA91gKA1c/QgzdoIjWDohO/4EJPZCs0vdCF2wzB72iR8y2oF9okYN9AU/Ug+D7QxB2Hc7509BdrvXJBQPDHd/rQe1XqQkAMxQz6MKXH7cP+/DnyIkGwY/TQv2s39cpokA5yjIMgyvZHbqg9HHpAeCfSPJAMPei8c3Qkm/pLJ9CMrUHTBizA+Gery/kEgAJE4VAAGRhtAhz9UI6KiEAznaJiKVVsgNe19iGKi+WyEwVTsu4prGfs0jyMjTLSAHTQTPaa2tdU32AA1tayd0tkELBCkkXIjxGaRJnOZK5By6jIQsLRh1GMBMjgTpwmkXhTAgTS/iacv8EKUS4COMBXHarqepgPr5EGIaRrGkUdSmmb5sW5hlojNbIi2nb9sO47mqFS3SCDs7XUA4MgyusCbo3b17oxkB56DnHEGFvHz1QpAbwLHDJYBgigcpkBQffCGoax/tYYN5eLuDDC0w3lHEDRjBSsfZD7H3xh9MWQZvqX1+sWG+FNZZsE4HZGMFpAjWnpIYEw+JJx2AcC4NwHgvB3D8Ggq0wRDbrTwHEOACQkgxlSOkTI2Rci1kKMUfq5RVLVDIHUBo7Rmhx1KLsaYlQeiNzAHiQYVUySRUmNMGAcwFhLBWGsDY2wRGl0OK1M4FwMQ3HLjIB4Ph+DPFeHAd4nxJgYDBP8MgF4QRgigBCEOWQYTMDhJIdUtZkR5zRJcCA1wsTMBxD4PEE5CSaBJGSQRVIaR2PpIyZkcw2Qci5DyKg3dBQinFFKGUrA5RoAVMqVUgh1TmE0MPHUeoDRrRNKggI5CbQgOdJ/ecIZQK+n/iGLcD1KwNLjBgw+oFwGizQkBXMLo8bQGLO4Tw3heDAGSLGdBwReC5gENJAA5AAAVKeUzUzAxSSmlLKeUSotkAG5WpcAwKIAQwhgQFD3E2Fs/Zla9lfrrfWI5FmuF4NZA4+9NbBwALwdFftcqQ2JjHLLIfGekUKAUigokwmY8xfYJU8KSKyldXakhLmYKOMdNHUlpDaVwuZQiHKQKACs8gLGSDwFMEAuZcxAA=="}
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
