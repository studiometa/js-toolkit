# What is js-toolkit?

`@studiometa/js-toolkit` is a data-attributes driven micro-framework for building JavaScript components. It provides an abstract `Base` class that you extend to create components, and binds them to the DOM using `data-*` attributes.

## Why js-toolkit?

When building websites with server-rendered HTML (WordPress, Twig, PHP, etc.), you often need to sprinkle JavaScript behavior onto existing markup. js-toolkit provides a structured, class-based approach to this:

- **No build-step required mental model** — components are plain classes, bound to DOM via `data-component`, `data-ref`, and `data-option-*` attributes
- **Automatic lifecycle management** — mount, destroy, and update components in response to DOM changes
- **Built-in services** — scroll, resize, pointer, keyboard, RAF, and more — with automatic enable/disable tied to component lifecycle
- **Tree-shakeable utilities** — import only what you need from a rich set of DOM, math, CSS, string, and animation helpers
- **TypeScript support** — full type definitions included, with generic typing for refs, options, and children

## How it works

Write classes extending the `Base` class, add some `data-*` attributes to your HTML, and register your components:

```html
<div data-component="Toggle">
  <button data-ref="btn">Toggle content</button>
  <div class="hidden" data-ref="content">Some content</div>
</div>
```

```js
import { Base, registerComponent } from '@studiometa/js-toolkit';

class Toggle extends Base {
  static config = {
    name: 'Toggle',
    refs: ['btn', 'content'],
  };

  onBtnClick() {
    this.$refs.content.classList.toggle('hidden');
  }
}

registerComponent(Toggle);
```

That's it — `registerComponent` finds all `[data-component="Toggle"]` elements and mounts them automatically. Components are also mounted on newly inserted DOM elements without any extra work.

## Next steps

<div class="vp-doc">

1. **[Installation](/guide/introduction/installation.html)** — install the package and configure your build tool
2. **[Managing components](/guide/introduction/managing-components.html)** — learn about parent/child relationships and lazy loading
3. **[Managing refs](/guide/introduction/managing-refs.html)** — access DOM elements from your components
4. **[Managing options](/guide/introduction/managing-options.html)** — pass data from HTML to JavaScript
5. **[Lifecycle hooks](/guide/introduction/lifecycle-hooks.html)** — react to mount, destroy, and update events
6. **[Using services](/guide/introduction/using-services.html)** — respond to scroll, resize, pointer, and more
7. **[Working with events](/guide/introduction/working-with-events.html)** — handle DOM and custom events

</div>

::: tip Already familiar with the basics?
Jump to [Going further](/guide/going-further/typing-components.html) for TypeScript typing, decorators, and lazy imports. Or explore the [API Reference](/api/) and [Utilities](/utils/) for the full technical details.
:::
