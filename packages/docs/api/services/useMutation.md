# Mutation service

The mutation service can be used to observe DOM mutations on a component with the MutationObserver API.

## Usage

```js
import { useMutation } from '@studiometa/js-toolkit';

const { add, remove } = useMutation();

// Add a callback
add('custom-id', ({ mutations }) => {
  console.log('Some attribute has changed!');
});

// Remove the callback
remove('custom-id');
```

## Parameters

### `target`

- Type: `Node`

The target element to observe, defaults to `document.documentElement`.

**Example**

Observe any attribute mutation on the `<body>` element:

```js
const service = useMutation(document.body);
```

### `options`

- Type: [`MutationObserverInit`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#options)

Options for the mutation observer, defaults to `{ attributes: true }` only.

**Example**

Observe everything on the given element:

```js
const element = document.querySelector('#element');
const service = useMutation(element, {
  attributes: true,
  childList: true,
  subtree: true,
});
```

## Props

### `mutations`

- Type: `MutationRecord[]`

The list of `MutationRecord` that triggered the callback.
