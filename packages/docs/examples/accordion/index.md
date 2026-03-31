# Accordion

An expandable/collapsible content section toggled by a button click. This example demonstrates refs, event handling, and ARIA attribute management.

## What we're building

A single accordion panel with a trigger button and a collapsible content area. Clicking the button shows or hides the content and keeps `aria-expanded` in sync for screen readers.

::: tip Production use
For a fully-featured, accessible accordion with animations and keyboard navigation, the [`@studiometa/ui`](https://ui.studiometa.dev) package ships a ready-to-use `Accordion` component.
:::

## HTML markup

The root element is marked with `data-component`. Two refs — `btn` (the trigger) and `content` (the panel) — are declared with `data-ref`:

```html
<div data-component="Accordion">
  <button data-ref="btn" aria-expanded="false">Toggle</button>
  <div data-ref="content">
    <p>Accordion content goes here.</p>
  </div>
</div>
```

## JavaScript component

The component hides the content on mount and toggles visibility on button click. ARIA attributes are kept in sync:

```js
import { Base } from '@studiometa/js-toolkit';

export default class Accordion extends Base {
  static config = {
    name: 'Accordion',
    refs: ['btn', 'content'],
  };

  onBtnClick() {
    const isOpen = this.$refs.content.style.display !== 'none';
    this.$refs.content.style.display = isOpen ? 'none' : '';
    this.$refs.btn.setAttribute('aria-expanded', String(!isOpen));
  }

  mounted() {
    this.$refs.content.style.display = 'none';
    this.$refs.btn.setAttribute('aria-expanded', 'false');
  }
}
```

## App setup

```js
import { registerComponent } from '@studiometa/js-toolkit';
import Accordion from './Accordion.js';

registerComponent(Accordion);
```

## Further reading

- [Refs guide](/guide/introduction/managing-refs.html) — connecting HTML elements to your component
- [Lifecycle guide](/guide/introduction/lifecycle-hooks.html) — the `mounted()` hook
- [Events guide](/guide/introduction/working-with-events.html) — auto-bound click handlers
- [Base class API](/api/) — full `Base` class reference
