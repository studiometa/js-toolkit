# Teleport refs

Move a DOM element outside the component tree (e.g. to `<body>`) while keeping ref access. This pattern solves CSS stacking-context issues for modals, tooltips, and dropdowns.

## What we're building

A modal component that teleports its content element to a different part of the DOM (via the `move` option) while still being able to access that element through `$refs`. This demonstrates **options**, **ref overriding**, and the **mounted lifecycle hook**.

## Why teleport?

CSS stacking contexts can prevent elements like modals from appearing above other content. Common culprits:

- **`z-index` conflicts** — a parent creates a stacking context, capping child z-index
- **`overflow: hidden` on parents** — clips absolutely positioned children
- **`transform`, `filter`, `opacity` on ancestors** — create new stacking contexts

The solution: move the element to `<body>` so it escapes these constraints.

::: tip When to use this
Only use this pattern when CSS `position: fixed` with a high `z-index` is not enough. For most cases, CSS alone is simpler.
:::

## HTML markup

The `data-option-move` attribute tells the component where to teleport the content:

```html
<div data-component="Modal" data-option-move="body">
  <button data-ref="open">Open the modal</button>
  <div data-ref="content">Modal content goes here.</div>
</div>
```

## JavaScript component

The key technique: save refs _before_ teleporting (while they are still inside `$el`), then override the `$refs` getter to merge saved refs with current ones:

```js
import { Base } from '@studiometa/js-toolkit';

export default class Modal extends Base {
  static config = {
    name: 'Modal',
    refs: ['open', 'content'],
    options: {
      move: String,
    },
  };

  originalRefs;

  get $refs() {
    const $refs = super.$refs;

    // Merge saved refs with current refs
    if (this.originalRefs) {
      Object.entries(this.originalRefs).forEach(([name, value]) => {
        if (!$refs[name]) {
          $refs[name] = value;
        }
      });
    }

    return $refs;
  }

  mounted() {
    if (this.$options.move) {
      const target = document.querySelector(this.$options.move);
      if (target) {
        this.originalRefs = this.$refs;
        target.appendChild(this.$refs.content);
      }
    }
  }

  onOpenClick() {
    // Implement modal opening logic here
  }
}
```

## App setup

```js
import { registerComponent } from '@studiometa/js-toolkit';
import Modal from './Modal.js';

registerComponent(Modal);
```

## Further reading

- [Refs guide](/guide/introduction/managing-refs.html) — how `$refs` works
- [Options guide](/guide/introduction/managing-options.html) — defining and reading `data-option-*` attributes
- [Lifecycle guide](/guide/introduction/lifecycle-hooks.html) — the `mounted()` hook
- [Base class API](/api/) — `$refs`, `$options`, and other instance properties
