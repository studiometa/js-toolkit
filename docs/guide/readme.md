---
sidebar: auto
prev: /
next: /utils/
---

# Guide

## Installation

Install the package with your favorite package manager:

```bash
npm install @studiometa/js-toolkit
```

## Usage

In your project, import the things you need:

```js
import { debounce } from '@studiometa/js-toolkit/utils';

const debounced = debounce(() => {
  console.log('Hello 👋');
}, 500);

debounced();
// Hello 👋
```

See below or the API reference for the full list of exports.
