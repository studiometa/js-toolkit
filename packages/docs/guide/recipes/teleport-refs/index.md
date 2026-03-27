# Teleport refs

## What is ref teleporting?

Ref teleporting is the technique of moving a DOM element — such as a modal overlay — outside of its component's scope (e.g., appending it directly to `<body>`) while still maintaining ref access to it from within the component.

## Why is it needed?

CSS stacking contexts can make it hard to position elements like modals, tooltips, and dropdowns above the rest of the page. Common culprits include:

- **z-index conflicts** — a parent element creates a new stacking context, capping how high child elements can stack.
- **`overflow: hidden` on parents** — clips absolutely positioned children, causing modals to be cut off.
- **CSS `transform`, `filter`, or `opacity` on ancestors** — these also create new stacking contexts.

The solution is to move the element to `<body>` (or another top-level container) so it escapes these constraints entirely.

## How the pattern works

When an element is moved outside the component's root element (`$el`), js-toolkit's `$refs` getter can no longer find it. The fix is to:

1. **Save the refs** before teleporting them (while they are still inside `$el`).
2. **Override the `$refs` getter** on the component instance to merge the saved refs with the currently found ones.

This way, the component continues to have full access to all refs regardless of where they are in the DOM.

## When to use this

Only reach for this pattern when you genuinely need to move DOM elements outside the component tree. For most cases, CSS `position: fixed` combined with a high `z-index` is sufficient and far simpler. Reserve teleporting for situations where stacking context or overflow constraints cannot be resolved with CSS alone.

### Modal component example

We can make sure that the moved refs are still accessible by saving the original ones before teleporting them and overwriting the `$refs` getter in the component.

### Modal component example

<script setup>
  const tabs = [
    {
      label: 'Modal.js',
    },
    {
      label: 'Modal.html',
    },
  ];
</script>

::: code-group

<<< ./Modal.js

<<< ./Modal.html

:::
