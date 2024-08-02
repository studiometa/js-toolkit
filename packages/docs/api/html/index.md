# HTML API

The following attributes can be used:

- [data-component](./data-component.md)
- [data-ref](./data-ref.md)
- [data-option](./data-option.md)

These attributes can be configured with the [`createApp` helper](/api/helpers/createApp.html):

```js
createApp(App, {
  attributes: {
    component: 'tk-is',
    option: 'tk-opt',
    ref: 'tk-ref',
  },
});
```

You will then be able to update your HTML templates:

```diff
  <div
-   data-component="Component"
-   data-option-data="Hello world"
+   tk-is="Component"
+   tk-opt-data="Hello world">
    ...
-   <button data-ref="btn">
+   <button tk-ref="btn">
      Click me
    </button>
  </div>
```
