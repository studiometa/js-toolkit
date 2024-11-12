# HTML API

The following attributes can be used:

- [data-component](./data-component.md)
- [data-ref](./data-ref.md)
- [data-option](./data-option.md)

## Customizing the attributes

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

## Using prefixed HTML element names

Components can also be defined by using a prefixed and dash-case formatted element name in HTML.

```diff
- <div data-component="Component">
+ <tk-component>
    ...
- </div>
+ </tk-component>
```

The attribute and element name API can be combined to attach multiple components to a single element:

```html
<tk-component data-component="Figure">...</tk-component>
```

The prefix is set to `tk` by default and can be configured with the [`createApp` helper](/api/helpers/createApp.html):

```js
createApp(App, {
  prefix: 'w',
});
```

```diff
- <tk-component>
+ <w-component>
    ...
- </tk-component>
+ </w-component>
```
