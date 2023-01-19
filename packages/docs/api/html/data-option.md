# data-option-<​name>

Use `data-option-<name>` attributes to configure the options of components from your HTML.

:::tip READ MORE

- [Configuration: `config.options`](/api/configuration.html#config-options)
- [Guide: managing options](/guide/introduction/managing-options.html)

:::

## data-option-no-<​name>

When using a boolean option, you can negate its value by prefixing its name with `no-`.

```js
class Component extends Base {
  static config = {
    name: 'Component',
    options: {
      open: {
        type: Boolean,
        default: true,
      },
    },
  };

  mounted() {
    console.log(this.$options.open); // false
  }
}
```

```html
<div data-component="Component" data-option-no-open></div>
```
