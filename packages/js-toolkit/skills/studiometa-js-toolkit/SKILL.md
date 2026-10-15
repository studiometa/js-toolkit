---
name: studiometa-js-toolkit
description: Write components with @studiometa/js-toolkit v4 — classes that extend Base, registered with registerComponent and bound to the DOM through data-component, data-ref, data-option-* and data-mount attributes. Use when code imports @studiometa/js-toolkit, extends Base, uses $refs, $options, $emit, $query, $closest, on<Ref><Event> hooks, services (useScroll, useResize, useRaf, withScroll…), mount strategies, provide/inject, the scheduler or @studiometa/js-toolkit/utils, or when you migrate code from js-toolkit v3.
---

# @studiometa/js-toolkit

`@studiometa/js-toolkit` binds JavaScript classes to server-rendered HTML. A component is a class that extends `Base`, a name in the registry, and a `data-component` attribute in the markup.

This skill matches the installed package version. v4 is a full breaking major: most examples on the web and in training data are v3 code that does not work in v4. Read the references in this folder before the online docs.

## References

- `references/guide/introduction/`: components, refs, options, events, lifecycle, services. Start here.
- `references/guide/going-further/`: autoloading, mount strategies, scheduling, shared state, swapping content, testing, TypeScript, decorators, storage, diagnostics.
- `references/guide/migration/v3-to-v4.md`: every v3 API that changed, with its replacement. Read it before you change existing code.
- `references/api/`: the exact API of `Base`, the registry, services, context, DOM helpers, scheduler, storage and diagnostics.
- `references/utils/`: the utilities of `@studiometa/js-toolkit/utils`, by category.

## A component

```js
import { Base, registerComponent } from '@studiometa/js-toolkit';

class Counter extends Base {
  static config = {
    name: 'Counter',
    refs: ['output'],
    options: { step: { type: Number, default: 1 } },
  };

  count = 0;

  onClick() {
    this.count += this.$options.step;
    this.$refs.output.textContent = String(this.count);
  }
}

registerComponent(Counter);
```

```html
<button data-component="Counter" data-option-step="5">
  Clicked
  <span data-ref="output">0</span>
  times
</button>
```

## v4 rules

These are the v3 habits that break in v4:

| Do not write (v3)                                   | Write (v4)                                                                                       |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `createApp(App)`                                    | `registerComponents(A, B, C)`: no root component                                                 |
| `this.$children.Item`, `this.$parent`, `this.$root` | `this.$query('Item')`, `this.$watchChildren('Item')`, `this.$closest('Name')` (can be `null`)    |
| `this.$update()`                                    | nothing: `$refs` reads the DOM on each access                                                    |
| `data-ref="items"` for a list                       | `data-ref="items[]"`, same as `refs: ['items[]']`; read it as `this.$refs.items`                 |
| `this.$options.open = true`                         | `$options` is read-only: change the `data-option-*` attribute                                    |
| `data-option-open="false"`                          | remove the attribute, or `data-option-no-open` when the default is `true`                        |
| `default: {}` or `default: []`                      | a factory: `default: () => ({})`                                                                 |
| `this.$emit('go', 1, 'left')`                       | one payload object: `this.$emit('go', { index: 1, direction: 'left' })`                          |
| `onItemClick(event, index)`                         | one object: `onItemsClick({ event, target, index })`, `onChildEvent({ event, target, payload })` |
| `updated()`                                         | `option<Name>Changed()` or `watchAttributes()`                                                   |
| `unmounted()` only to unsubscribe                   | return the cleanup from `mounted()`                                                              |
| `data-load`, `withMountWhenInView`, `importWhen*`   | `data-mount="visible"` or a `registerManifest()` entry with `mountStrategy`                      |
| `withExtraConfig()`                                 | a subclass with its own `static config`                                                          |
| `withResponsiveOptions`, `data-option-x:s:m`        | every option is responsive: `data-option-x:s` cascades up                                        |
| `domScheduler`, `afterWrite`                        | `this.$read()` / `this.$write()`, or `defaultScheduler`                                          |
| `tween`, `animate`                                  | not in core: use `transition()`, `spring()`, `smoothTo()` or `@studiometa/ui-motion`             |

## Practices

- Let the registry construct instances. Never call `new MyComponent(el)`.
- Declare `refs` and use `on<Ref><Event>` hooks instead of `querySelector` and `addEventListener`. Use `onWindow<Event>` and `onDocument<Event>` for global events.
- Use a service before a custom listener or observer: the mixins `withScroll` (`scrolled`), `withResize` (`resized`), `withRaf` (`ticked`), `withPointer` (`moved`), `withDrag` (`dragged`), `withKey` (`keyed`), `withInView` (`intersected`), `withMutation` (`mutated`), `withScrollProgress` (`scrolledInView`), or the `use*()` functions.
- Use mount strategies (`eager`, `visible`, `in-view`, `idle`, `interaction`, `media:<query>`) to defer work, not custom observers.
- Share state with `provideRootContext()`, `$provide()` and `$inject()`, not with global variables.
- Import utilities from `@studiometa/js-toolkit/utils` (for example `import { clamp, damp } from '@studiometa/js-toolkit/utils'`). Read `references/utils/` before you write a helper.
- Diagnostics (`EVENTS.diagnostic`) explain wrong refs, options and payloads. Read the warning code in `references/api/diagnostics/DIAGNOSTICS.md`.

## Related skills

- `studiometa-ui`: ready-made components (Action, Dialog, Disclosure, Tabs, Carousel, Fetch, Transition, Data*…). Look for a component there before you write a custom one.
- `studiometa-eslint-plugin-js-toolkit`: the lint rules for js-toolkit code.
