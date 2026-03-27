# Accordion

An accordion component shows and hides a content panel when the user clicks a trigger button. This recipe uses two refs — `btn` and `content` — to wire the toggle behaviour directly in the component.

## How it works

- **`$refs.btn`** is the toggle button. A click on it calls `onBtnClick`, which checks whether the content is currently visible and toggles it.
- **`$refs.content`** is the collapsible panel. Its visibility is controlled by setting `style.display`.
- **ARIA attributes** — `aria-expanded` is kept in sync with the open/closed state so screen readers announce the correct state to users.
- **`mounted()`** initialises the component in the collapsed state so the content is hidden on page load.

::: tip Production use
For a fully-featured, accessible accordion with animations and keyboard navigation, the [`@studiometa/ui`](https://ui.studiometa.dev) package ships a ready-to-use `Accordion` component.
:::

<script setup>
  const tabs = [
    { label: 'Accordion.js' },
    { label: 'Accordion.html' },
    { label: 'app.js' },
  ];
</script>

::: code-group

```js [Accordion.js]
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

```html [Accordion.html]
<div data-component="Accordion">
  <button data-ref="btn" aria-expanded="false">Toggle</button>
  <div data-ref="content">
    <p>Accordion content goes here.</p>
  </div>
</div>
```

```js [app.js]
import { registerComponent } from '@studiometa/js-toolkit';
import Accordion from './Accordion.js';

registerComponent(Accordion);
```

:::
