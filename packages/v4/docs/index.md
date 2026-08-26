---
layout: home
sidebar: false
title: One registry, one engine, one clock
description: v4 of the JS Toolkit by Studio Meta. Components are independent classes bound to the DOM with data-attributes, mounted by a single registry driven by a single MutationObserver.
hero:
  name: '@studiometa/js-toolkit'
  text: One registry, one engine, one clock
  tagline: The registry is the framework. The DOM is the component tree.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: API Reference
      link: /api/
    - theme: alt
      text: Migrating from v3
      link: /guide/migration/v3-to-v4.html
features:
  - title: The DOM drives the lifecycle
    icon: 🌿
    details: An instance exists because its element is in the document and its class is registered. One MutationObserver mounts and unmounts everything — nothing else constructs an instance.
  - title: Independent components
    icon: 🧩
    details: No $parent, no $children, no createApp. Components find each other through queries, bubbling events and provide/inject.
  - title: Live refs and options
    icon: 🔁
    details: Every $refs read hits the DOM and every option is derived from its attribute on access. There is no $update() and every option is responsive.
  - title: Mount when it matters
    icon: ⏱️
    details: data-mount picks eager, visible, in-view, idle, interaction or media. A component that waits has no instance at all.
  - title: Lazy and reference-counted services
    icon: ⚡
    details: With no subscriber there is no listener, no observer and no frame. One frame-aligned scheduler is the clock of the whole framework.
  - title: Tree-shakeable by subpath
    icon: 🌲
    details: 197 export subpaths. Import one function and the graph behind it is all you download.
---
