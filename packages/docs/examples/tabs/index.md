# Tabs

A tabbed interface with multiple panels, keyboard navigation, and ARIA attributes. This example demonstrates array refs, the `keyed` service hook, options, and accessible markup patterns.

## What we're building

A tab bar with clickable tab buttons and corresponding content panels. Only one panel is visible at a time. The component supports:

- Click to switch tabs
- Arrow key navigation between tabs
- Proper ARIA roles and attributes for screen readers
- A configurable default active tab via options

## HTML markup

Each tab button is a `tabs[]` ref and each panel is a `panels[]` ref. ARIA attributes connect them:

```html
<div data-component="Tabs" data-option-default-tab="0">
  <div role="tablist">
    <button
      data-ref="tabs[]"
      role="tab"
      aria-selected="true"
      aria-controls="panel-0"
      id="tab-0"
      tabindex="0">
      Tab 1
    </button>
    <button
      data-ref="tabs[]"
      role="tab"
      aria-selected="false"
      aria-controls="panel-1"
      id="tab-1"
      tabindex="-1">
      Tab 2
    </button>
    <button
      data-ref="tabs[]"
      role="tab"
      aria-selected="false"
      aria-controls="panel-2"
      id="tab-2"
      tabindex="-1">
      Tab 3
    </button>
  </div>

  <div
    data-ref="panels[]"
    role="tabpanel"
    id="panel-0"
    aria-labelledby="tab-0">
    <p>Content for Tab 1</p>
  </div>
  <div
    data-ref="panels[]"
    role="tabpanel"
    id="panel-1"
    aria-labelledby="tab-1"
    hidden>
    <p>Content for Tab 2</p>
  </div>
  <div
    data-ref="panels[]"
    role="tabpanel"
    id="panel-2"
    aria-labelledby="tab-2"
    hidden>
    <p>Content for Tab 3</p>
  </div>
</div>
```

## JavaScript component

The component tracks the active tab index, handles click events on the `tabs[]` array ref, and listens for keyboard events via the `keyed` service hook. Arrow keys move focus between tabs, and Enter/Space activates the focused tab:

```js
import { Base } from '@studiometa/js-toolkit';
import { keyCodes } from '@studiometa/js-toolkit/utils';

export default class Tabs extends Base {
  static config = {
    name: 'Tabs',
    refs: ['tabs[]', 'panels[]'],
    options: {
      defaultTab: { type: Number, default: 0 },
    },
  };

  activeIndex = 0;

  mounted() {
    this.activate(this.$options.defaultTab);
  }

  /**
   * Handle click on any tab button.
   * The `index` parameter tells you which tab in the array was clicked.
   */
  onTabsClick({ index }) {
    this.activate(index);
  }

  /**
   * Handle keyboard navigation when a tab button is focused.
   * Arrow keys move focus; Enter/Space activates.
   */
  keyed(props) {
    // Only handle keys when a tab button is focused
    const focusedIndex = this.$refs.tabs.indexOf(document.activeElement);
    if (focusedIndex < 0) return;

    const { event } = props;
    const lastIndex = this.$refs.tabs.length - 1;

    if (event.keyCode === keyCodes.RIGHT || event.keyCode === keyCodes.DOWN) {
      event.preventDefault();
      const nextIndex = focusedIndex < lastIndex ? focusedIndex + 1 : 0;
      this.$refs.tabs[nextIndex].focus();
    }

    if (event.keyCode === keyCodes.LEFT || event.keyCode === keyCodes.UP) {
      event.preventDefault();
      const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : lastIndex;
      this.$refs.tabs[prevIndex].focus();
    }

    if (
      event.keyCode === keyCodes.ENTER ||
      event.keyCode === keyCodes.SPACE
    ) {
      event.preventDefault();
      this.activate(focusedIndex);
    }
  }

  /**
   * Activate a tab by index — show its panel, hide the rest.
   */
  activate(index) {
    this.activeIndex = index;

    this.$refs.tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.setAttribute('aria-selected', String(isActive));
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
    });

    this.$refs.panels.forEach((panel, i) => {
      panel.hidden = i !== index;
    });
  }
}
```

## App setup

```js
import { registerComponent } from '@studiometa/js-toolkit';
import Tabs from './Tabs.js';

registerComponent(Tabs);
```

## Further reading

- [Refs guide](/guide/introduction/managing-refs.html) — array refs with `[]` suffix
- [Options guide](/guide/introduction/managing-options.html) — typed options with defaults
- [Services guide](/guide/introduction/using-services.html) — the `keyed` service hook
- [Events guide](/guide/introduction/working-with-events.html) — the `index` parameter in array ref events
- [`useKey` service API](/api/services/useKey.html) — keyboard service reference
- [`keyCodes` utility](/utils/keyCodes.html) — key code constants
