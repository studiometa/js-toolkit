---
outline: deep
---

# Load service

The load service will help you manage actions that should run on `window` load event.

## Usage

```js twoslash
import { useLoad } from '@studiometa/js-toolkit';

const { add, remove } = useLoad();

// Add a callback
add('custom-id', () => {
  console.log('loaded!');
});

// Remove the callback
remove('custom-id');
```

## Props

This service does not have any props.
