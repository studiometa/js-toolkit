---
layout: home
sidebar: false
title: A data-attributes driven micro-framework
description: The JS Toolkit by Studio Meta is a JavaScript data-attributes driven micro-framework shipped with plenty of useful utility functions to boost your project.
hero:
  name: '@studiometa/js-toolkit'
  text: A data-attributes driven micro framework
  tagline: Write JavaScript components as classes and bind them to the DOM with data-attributes
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: View on GitHub
      link: https://github.com/studiometa/js-toolkit
features:
  - title: A micro-framework
    icon: 🔧
    details: An abstract class to help you write small and efficient JavaScript classes as well as orchestrate them.
  - title: Useful services
    icon: ⚡
    details: Services will help you implement common tasks by abstracting their tedious parts.
  - title: Plenty of utilities
    icon: 📦
    details: Functions to help you manipulate the DOM, use math calculations, use the history API and more.
  - title: Tree-shakeable
    icon: 🌲
    details: Import only what you need. Every utility and service is individually exported so your bundle stays lean.
---

## See it in action

Build interactive components by connecting HTML to JavaScript with data-attributes — no virtual DOM, no build step required for templating.

**HTML**

```html
<div data-component="Counter">
  <p data-ref="count">0</p>
  <button data-ref="add">+1</button>
  <button data-ref="reset">Reset</button>
</div>
```

**JavaScript**

```js
import { Base, registerComponent } from '@studiometa/js-toolkit';

class Counter extends Base {
  static config = {
    name: 'Counter',
    refs: ['count', 'add', 'reset'],
  };

  get count() {
    return Number(this.$refs.count.textContent);
  }

  onAddClick() {
    this.$refs.count.textContent = this.count + 1;
  }

  onResetClick() {
    this.$refs.count.textContent = 0;
  }
}

registerComponent(Counter);
```

That's all it takes — define refs in HTML, handle events with naming conventions, and let js-toolkit wire everything together.

<div class="mt-4">

**[Get Started →](/guide/)** · **[Examples](/examples/)** · **[API Reference](/api/)**

</div>

## Install

```bash
npm install @studiometa/js-toolkit
```
