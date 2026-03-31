---
sidebar: true
---

# Helpers

The following helper functions can be used to achieve advanced setup of your application. For practical usage, see the [Getting Started guide](/guide/) and [Child Components](/guide/going-further/lazy-imports.html) for lazy import helpers.

## Setup helpers

The recommended way to register and mount components:

- [registerComponent](./registerComponent.html) — register and mount components independently (recommended)
- [defineFeatures](./defineFeatures.html) — configure global features (breakpoints, attributes, prefix)
- [createApp](./createApp.html) — bootstrap a root App class (when you need a central app instance)

## Instance helpers

Some helpers can be used to work with instances.

- [getClosestParent](./getClosestParent.html)
- [getDirectChildren](./getDirectChildren.html)
- [getInstanceFromElement](./getInstanceFromElement.html)
- [getInstances](./getInstances.html)
- [isDirectChild](./isDirectChild.html)

## Query helpers

The following helpers let you find component instances by name, CSS selector, and state — without relying on parent/children relationships.

- [queryComponent / queryComponentAll](./queryComponent.html)
- [closestComponent](./closestComponent.html)

## Lazy import helpers

Some components might not need to be imported and instantiated immediately on page load. The following functions will help you define custom scenarios for when to import these components.

- [importOnInteraction](./importOnInteraction.html)
- [importWhenIdle](./importWhenIdle.html)
- [importWhenVisible](./importWhenVisible.html)
- [importOnMediaQuery](./importOnMediaQuery.html)
- [importWhenPrefersMotion](./importWhenPrefersMotion.html)

## Debug helpers

- [logTree](./logTree.html) — log the component tree to the console
