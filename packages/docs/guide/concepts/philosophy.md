# Philosophy

## Progressive enhancement, not application framework

`@studiometa/js-toolkit` is designed for **server-rendered websites** — WordPress, Laravel, Symfony, static HTML, or any backend that produces HTML. Instead of owning the DOM (like React or Vue), it **enhances existing markup** with JavaScript behavior.

The core idea: your HTML is the source of truth. Components bind to it via `data-*` attributes — no virtual DOM, no JSX, no template compilation.

## The data-attributes approach

Every concept in js-toolkit maps to a `data-*` attribute:

| Concept           | HTML attribute            | Purpose                                      |
| ----------------- | ------------------------- | -------------------------------------------- |
| Component binding | `data-component="Name"`   | Identifies which class manages this element  |
| Refs              | `data-ref="name"`         | Marks elements the component needs to access |
| Options           | `data-option-key="value"` | Passes configuration from HTML to JavaScript |

This approach has several advantages:

- **No build step for HTML** — your server-rendered templates work as-is
- **Inspectable** — open DevTools and see exactly which components are active on which elements
- **Portable** — works with any backend (PHP, Python, Ruby, static HTML)
- **Resilient** — if JavaScript fails to load, the HTML still renders

## How it compares

### vs. React / Vue / Svelte

These frameworks own the rendering pipeline. They generate the DOM from JavaScript (or compiled templates). js-toolkit takes the opposite approach: the DOM already exists, and JavaScript adds behavior to it.

Use React/Vue/Svelte when you need a **full client-side application** with complex state, routing, and client-side rendering.

Use js-toolkit when you have **server-rendered HTML** and need to add interactive behaviors — accordions, carousels, scroll animations, form validation, modals.

### vs. Alpine.js / Stimulus

Alpine.js and Stimulus share js-toolkit's philosophy of enhancing server-rendered HTML. The key differences:

- **Class-based architecture** — js-toolkit uses ES classes with inheritance. Components are proper classes, making them easy to extend, type with TypeScript, and test.
- **Built-in services** — scroll, resize, pointer, keyboard, RAF, and more — automatically tied to component lifecycle. No need to manually add/remove event listeners.
- **Scoped resolution** — refs and child components are scoped to the nearest `data-component` boundary, preventing accidental cross-component access.
- **Tree-shakeable utilities** — a rich set of DOM, math, CSS, string, and animation helpers you can import individually.

## Design principles

1. **Convention over configuration** — naming conventions drive behavior. Name a method `onBtnClick` and it automatically listens for click events on the `btn` ref.
2. **Automatic lifecycle** — services are enabled when a component mounts and disabled when it destroys. No manual cleanup.
3. **Lazy by default** — async component imports are only fetched if a matching DOM element exists. Automatic code-splitting with zero configuration.
4. **TypeScript-first** — full type definitions for refs, options, children, and service props. Works with JSDoc too.

::: tip Further reading

- [Getting Started](/guide/) — install and create your first component
- [API Reference](/api/) — the complete `Base` class API
- [Component Tree](/guide/concepts/component-tree.html) — how components are resolved and mounted
- [Service Architecture](/guide/concepts/service-architecture.html) — the singleton service pattern

:::
