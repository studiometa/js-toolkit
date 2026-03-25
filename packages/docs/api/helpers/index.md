---
sidebar: true
---

# Helpers

The following helper functions can be used to achieve advanced setup of your application.

## App helper

The following helpers can help you bootstrap the root class of your application:

- [createApp](./createApp.html)

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
