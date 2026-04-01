# Configuration

::: tip See also
For a practical introduction, see the [Components guide](/guide/introduction/managing-components.html). For refs and options, see [Refs](/guide/introduction/managing-refs.html) and [Options](/guide/introduction/managing-options.html).
:::

The static `config` property is required on each class extending the `Base` class. It should be used to configure the class.

## `config.name`

- Type: `String`

The **required** name of the component.

```js {3} twoslash
// @twoslash-cache: {"v":1,"hash":"29b5c9774086ecf81b53c698327ffd82c582fbc606811b54b79af6a9c7626513","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACAYQgFssEMDDAMqcNK1INEANirMRAczT4kATiqTSSmDJC8BQkWJDMAlsKQAGKo3xTWjGuTkBfCumy5EBYmUpqOn0AClYLdgBKThZ2LgAhdhgAHgAVTmCRKASkgAVSCCwuAF5ORLgYfMK4AD4AHTBzI2kypMCoCEYEX3KYGLYOADpAySVu5GQzSwBrQPw0NCLEAHplgCs4AFo0CAhmafM0QYkAVyhzfj1WQdgiZdYsc2WQAF0X8W0ZACYAFgVlVRIP7UKS6fS9QIWKyIWwgeyOZwBRC/DxeHB4QgkchaYJ4EJYAo4aQYaKGQTCUSDRhCABm5iUiE4wAanFZnDArD4MEZElIliUAG4Gm52p1ugZafThlpWGMkBMpmBZlR5os4Ct1lsdnsDkdTudLpIbjA7g8ntSwHSlCdSKw0BcwIN5nxmK93iAJFIZD9YYowCo1HIZTo9ExJUpIZYfABGOwOW2I1zqVHUbwY/zYoL0PEEwpkTDRDlcnloPn+wKe6RIACs1f+/sBiGB2jBeCLuAUUaQXzjCJcQLc7upsCYAy4ZOMogy9CyOQqTJZnE99sYMXDnFKzLAbPZnO5nAA5BOKWgDxRF24hWARVQuZIkKBMmA4A68BsQG43EA="}
import { Base } from '@studiometa/js-toolkit';
// ---cut---
class Component extends Base {
  static config = {
    name: 'Component',
  };
}
```

## `config.options`

- Type: `Object`
- Default: `{}`

Define values configurable with `data-option-...` attributes for the component.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"0cf5abc3e0b2d431bdddbca6bae779ba5dcc99a1ca06bb519ea8d92f761d6e48","data":"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"}
import { Base } from '@studiometa/js-toolkit';
// ---cut---
class Component extends Base {
  static config = {
    name: 'Component',
    options: {
      stringOption: String, // default to ''
      stringWithDefault: { type: String, default: 'Default value' },
      stringWithDefaultAsAFunction: {
        type: String,
        default: (component) => component.$el.id,
      },
      numberOption: Number, // default to 0
      numberWithDefault: { type: Number, default: 10 },
      numberWithDefaultAsAFunction: {
        type: Number,
        default: (component) => component.$el.childElementCount,
      },
      booleanOption: Boolean, // default to false
      // default to true, can be negated with the `data-option-no-boolean-with-default` attribute
      booleanWithDefault: {
        type: Boolean,
        default: true,
      },
      booleanWithDefaultAsAFunction: {
        type: Boolean,
        default: (component) => component.$el.classList.has('bool'),
      },
      arrayOption: Array, // default to []
      arrayWithDefault: { type: Array, default: () => [1, 2] },
      objectOption: Object, // default to {}
      objectWithDefault: {
        type: Object,
        default: () => ({ foo: 'foo' }),
        merge: true, // Optional, whether to merge values or not
      },
    },
  };

  mounted() {
    this.$options.stringOption; // ''
    this.$options.stringWithDefault; // 'Default value'
    this.$options.numberOption; // 0
    this.$options.numberWithDefault; // 10
    this.$options.booleanOption; // false
    this.$options.booleanWithDefault; // true
    this.$options.arrayOption; // []
    this.$options.arrayWithDefault; // [1,2]
    this.$options.objectOption; // {}
    this.$options.objectWithDefault; // { foo: 'foo' }

    this.$el.hasAttribute('data-option-boolean-option'); // false
    this.$options.booleanOption = true;
    this.$el.hasAttribute('data-option-boolean-option'); // true
  }
}
```

## `config.components`

- Type: `Object`
- Default: `{}`

The children components of the current one that will automatically be mounted and destroyed accordion to the state of the current component. Children components can be defined like the following:

::: code-group

```js twoslash [app.js]
// @twoslash-cache: {"v":1,"hash":"fb897260465f5aecae26fd3ccbe085056ae05c161822f893d7232778ee114de3","data":"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"}
import { Base } from '@studiometa/js-toolkit';
import { Figure, PrefetchWhenOver } from '@studiometa/ui';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      // Direct reference, Figure instances will be mounted
      // on every `[data-component="Figure"]` elements.
      Figure,
      // Async loading, the Slider component will be loaded only if there
      // is one or more `[data-component="Slider"]` element in the DOM.
      Slider: () => import('@studiometa/ui').then(({ Slider }) => Slider),
      // Custom selector, ComponentThree instances will be mounted
      // on every `a[href]` elements.
      'a[href]': PrefetchWhenOver,
      // Custom selector with async loading, the Component component will be loaded
      // only if there is one or more `.other-custom-selector` element in the DOM.
      '.other-custom-selector': () => import('./Component.js'),
    },
  };
}
```

```js twoslash [Component.js]
// @twoslash-cache: {"v":1,"hash":"bb4cbb4fc3398dcf8167d6bc92672ea4b5802320374e1ccaaeeb04faa26e05be","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8niCwrwAwtU2YCMM3bMMiABsg1EjMYTQ4zXrzb4gZ7WCBvMAfKLsN5IABMm22pF2+xRAEYTmccHhCCRyDNbh4WBwuHx7n4HFJZPIRko6YZtLw9F5WSZzFYbHY6U4XG5FhIfMJAqCwkgIgjYvFEsk0pkcnkCkUSuVKtVasx6jBGs1Wh0uiAen1EAAOADsQ0B4ymoLmCw8SyGiNWqJAWx2e2uiAAzMdTtRzoSriTqGSQIwsJocHYMHwoa93v5+DCAGbsEKIXjAcy8Qu8MDMGq50qkREhADc5iOgtc7khmezEuooXCkWicSoCSScFSGWyuXyhWKpQqVRqdQaTRaKXTYCzITKGLQVTA/gSllYxs+vW+2LW/tto3tv0d4LuLZCy3dSBPXvRmL9QfxFyJ11J9CYsa0ZEwPgSzLXgKyrJwzUPbELVPIEHXbJ0IWA3A3SRRBpifH0sXQo4TXTWA8F5Wx7GAOleCOXgM00SxeAAcgAAQnLVp2YIcVVHIpaNrMBzDoPl7FgDNmDKVh7BpERkxhd45HoJllFFfMwELHp134AQb3ZPMCyLZDc1oyTYTQWiKG0o5uPrKgWKQUBGTAOANzwTIQCOI4gA="}
import { Base } from '@studiometa/js-toolkit';

export default class Component extends Base {
  static config = {
    name: 'Component',
  };
}
```

::: tip
The [lazy import helpers](/api/helpers/#lazy-import-helpers) can be used for more fine-grained imports.
:::

## `config.refs`

- Type : `Array<String>`
- Default : `[]`

Define the refs of the components by specifying their name in the configuration. Multiple refs should be suffixed with `[]`. Refs names can be configured and used in HTML following the `dash-case` pattern, and will be available in the `this.$refs` object following the `camelCase` pattern.

```html
<div data-component="Component">
  <button data-ref="btn">Click me</button>
  <ul>
    <li data-ref="items[]">#1</li>
  </ul>
  <ul>
    <li data-ref="other-items[]">#1</li>
    <li data-ref="other-items[]">#2</li>
  </ul>
  <!-- Refs can be prefixed by the name of their component (in HTML only)  -->
  <input data-ref="Component.input" type="text" />
</div>
```

```js twoslash
// @twoslash-cache: {"v":1,"hash":"db1d387c6b9c9afd339eb6f75ffe043916779d80eb9689cab828c4f20618a705","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACAYQgFssEMDDAMqcNK1INEANirMRAczT4kATiqTSSmDJC8BQkWJDMAlsKQAGKo3xTWjGuTkBfCumy5EBYmUpqOn0AClYLdgBKThZ2LgAhdhgAHgAVTmCRKASkgAVSCCwuAF5ORLgYfMK4AD4AHTBzI2kypMCoCEYEX3KYGLYOADpAySVu5GQzSwBrQPw0NCLEAHplgCs4AFo0CAhmafM0QYkAVyhzfj1WQdgiZdYsc2WQAF0X8W0ZACYAFgVlVRIP7UKS6fS9QIWKyIWwgeyOZwBRC/DxeHB4QgkchaYJ4EJYAo4aQYaKGQTCUSDRhCABm5iUiE4wAanFZnDArD4MEZElIliUAG4WWzSDAaXAeWg+WAlMgXkKwG52p1ugZafThlpWGMkBMpmBZlR5osJasNttdvtDsc0GcLlzJDcYHcHk9qWA6UoTqRWGgLmBBvM+MxXu8QBIpDIfrDFDLAXItTo9Ex1UpIZYfABGOwOH2I1zqVHUbwY/zYoL0PEEwpkTDRDlcyXStMfSNIACs7f+cbUiGB2jBeAbuAUGaQXxzCJcQKLmHRvkxARxld8+MJtZJnFF4qb/LlgQj0iQAHYABzdlS9/ug5O+bcIUfQgDMk7z077s5LC7LI1xq4dhBQKS/DkiYgx8BAJyiDAUAhJEjJEBA5hQAenxIJmXyaGYAK9seiaDr4EFQTQKGPj48hwrmTjvl8n7zn4WK/iuIBrjWxLRL0yS9FURQ1IMAAk96Mr0ABKYoPiAHRdHgYnipqII6igkxQoaBALEsZpbDsewHEcpznJcjq3PcjzLJYEZgIwMCbNWRJ+vAgZoMGADE96hq2R6IJm7YxjhHb4beICCeJ6bQnhlFTkihaeMW9GLuWNDMSEliwLQHFJLJcDILy/IvIyAASqQALIADIAKKKFyoicAAPpwhWlRVMBVWg+4eTI3kUbGl5IC+IJJvoABGaBgKFPjhfCb5It5dE+AxS4VqEtkbulFRcXkhK1AJQmtBUmXKtJviZfJozjMpMxzOpprrFplq6TadqGdcxmumZYAWVZNnrtI5gOUGzCuSFbzteOmbAt18Zdv1BFBW5ZFIOeEVTQWs2loxy6hCldCrTAmXZVKuUFcV5WVSYtX1cTTUtW14ZociXy+T2/nQ4FhzNRJUI+Ijk3UdN7ao9+6OLVW311rtKTcZtfHBTu4v7VQUmqsdIzamd+qqcaGk3RaOnWvp9pXE6LqmeZkiWdZy0/X9TkA25wO022yLHhO2FM4gUMDoFMsc2OiBYTz+YaAL80JX+LFY2lcvifjzZ5RTjWk9VdUNSTzUmDTh7fGeF7xpmsKe/oECqGQACSNB8D70L+1RgdefzYbUrATADFwZLGNVmRgNk4tMsKEZ+owMSppwpTMmAbLspy3KcAA5G3FJoDPFDCqyO3IDPw1gEvs9sxXcrbzPRf4GQmy71lLwz+8wpuAqwpEdBsHRGPE+qOYcDbeJgybwKnCrJwySDROAsIQnAoC+lYJsbcxQ6ggE3jAmo3ALCMGmJwLkyRliAOAWAeo482Sv3ft7QYZ8f5/2QMkCwoDwGQLFNAkAZ85TwOcpmdBFgagvBXpwfBH85JH1LuXOAJDlicDIRQsBkhqE0lobw0gp9+EMJADUJhLDzA1AoP/URVCoEwOkbI9m8jFFfGUWw6+DQlRUAdKwJAoBO5wH9HgDYIA3BuCAA==="}
import { Base } from '@studiometa/js-toolkit';
// ---cut---
class Component extends Base {
  static config = {
    name: 'Component',
    refs: ['btn', 'items[]', 'other-items[]'],
  };

  mounted() {
    this.$refs.btn; // <button data-ref="btn">Click me</button>
    this.$refs.items; // [<li data-ref="items[]">#1</li>]
    this.$refs.otherItems; // [<li data-ref="other-items[]">#1</li>, <li data-ref="other-items[]">#2</li>]
  }
}
```

## `config.emits`

- Type: `string[]`
- Default: `undefined`

Define the events emitted by the component by specifying their name.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"6e424d5df6232e7f352e42a771fd2946c4a755a00ee245d7c416735405abee41","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACAYQgFssEMDDAMqcNK1INEANirMRAczT4kATiqTSSmDJC8BQkWJDMAlsKQAGKo3xTWjGuTkBfCumy5EBYmUpqOn0AClYLdgBKThZ2LgAhdhgAHgAVTmCRKASkgAVSCCwuAF5ORLgYfMK4AD4AHTBzI2kypMCoCEYEX3KYGLYOADpAySVu5GQzSwBrQPw0NCLEAHplgCs4AFo0CAhmafM0QYkAVyhzfj1WQdgiZdYsc2WQAF0X8W0ZACYAFgVlVRIP7UKS6fS9QIWKyIWwgeyOZwBRC/DxeHB4QgkchaYJ4EJYAo4aQYaKGQTCUSDRhCABm5iUiE4wAanFZnDArD4MEZElIliUAG4WWyYHxDnAeWg+WAlMgXkKwG52p1ugZafThlpWGMkBMpmBZlR5osJasNttdvtDsc0GcLlzJDcYHcHk9qWA6UoTqRWGgLmBBvM+MxXu8QBIpDIfrDFDLAXItTo9Ex1UpIZYfABGOwOH2I1zqVHUbwY/zYoL0PEEwpkTDRDlcyXStMfSNIACs7f+cbUiGB2jBeAbuAUGaQXxzCJcQKLmHRvkxARxld8+MJtZJGTFaAlnF5/LlgQj0iQAHYABzdlS9rsgpP6UXi9PQgDMk7z077s5LC7LI1xq4OoQUCkvw5ImIMNZgCEkSMkQEDmFAR6fEgmaZhOZgAr2/agsmvhQc+PjyHCuZOJ+XzfvOfhYv+K4gCEQHQNEvTJL0VRFDUgwACSPmgITOiYTb8pwAA+nAAKIkKIFCcIMcmgruJwGpAADuYByrBnDwYhypdHg4nblwrBgBkUlHCM2rjJMWCOHwgQCaInAAHKcn0EA0pwqh9A55nvNZtmBApnCpPgfSgicXKiFwOycA8WDMBgnkQJ5oWcDSSnOP6XAAEYQEpUBJSl5hcD5wx+SApB6N6YCUGAJzMMw5VQoaBALEsZpbDsewHEcpznJcjq3PcjzLJYEZgIwMCbIx2SBmgwYAMS8ZsPmbApoatieiCZi+MZYR2iaDr4PHboRZ7vmRSKFp4xZUYu5Y0HRDF6MBoFGBSRwsBAFQwXBCFIZtMiZu2GGxteB13kdcLMN9I76lmsLwh+SIUTdc4+NRS4VqEM3MUkrF5IStTcbx/FmUJMqiRJZkyXJgwKYySnTKp6kvJp2kAyAHR6b4BnirFJmlRZOooP5Pp2VQPnOa5nDuSl3lmWVFBi5ygU6FwIVhToEUmNFyVxQlhVeWlGV+kIOV5WABUxaoxWmRBrzKxVVWkDVFB1Q1TUzHMbWmusnWWj1Np2gN1xDa6o1gONk3TS90BwHNi3Lat61vIDqGntmmE9hDA54SAJ2HGd21Z0jl0FpRGP3bRONxyBPBgcYlI7EoSiKL9Wn/chbbbeowJg/GxF5/oLdt3DUJZsCZf5uOleljRy616oTGtBUBMVOxxOF3xPkU0oVOSSYtPyerjPKRAakaX9OlUNzqp8zuAv25SwtWSANni/ZZnS1yssecbQtyof1VlQIKmtYra0io/GKBtEo21SulCaZso6cFyvlI2+A7aAKdpVW0rtar1Uak7ZqPsTQrH9habq1o+r2iuE6F0I0xqSAmlNGaCcgzMCWtuFaZk1rqw2uGFCyJMz932ogW8w88Db2LsDC6M9ECFjDNSWATABhcDJE3NAGR6BZByBUJkwoIx+kYDEVMnBSjMhMmyYcjIADkGiPq2IoMKVkvFdzIFsVBJxnBbFfQqLY94wo3AKmFFBGCBirGsltgnbeIRPE4DALYyICpWRuAaMKPxMBwmWLZEVGJpNfEw38ckoJ6SrGj3btEHJbJokk23HEipMAkkCk4KsTgKlzANXZBALR2VvLbhoAVYyBUOldKlPSXQpBYrtKkI0GUpTFSBAdKwJAoBMhR39HgDYIA3BuCAA=="}
import { Base } from '@studiometa/js-toolkit';
// ---cut---
class Component extends Base {
  static config = {
    name: 'Component',
    emits: ['open', 'close'],
  };

  open() {
    this.$emit('open');
  }

  close() {
    this.$emit('close');
  }

  toggle() {
    this.$emit('toggle'); // will not be emitted and will trigger a warning
  }
}
```

## `config.log`

- Type: `Boolean`
- Default: `false`

Enable the `this.$log(...args)` method when `true`.

## `config.debug`

- Type: `Boolean`
- Default: `false`

When `true`, the lifecycle hooks and services hooks will be logged to the console.

:::tip
The debug logs are conditionally rendered based on a `__DEV__` global variable which will default to `false`. To enable it in dev mode, you can use the [`DefinePlugin`](https://webpack.js.org/plugins/define-plugin/) with Webpack or the [`@rollup/plugin-replace`](https://github.com/rollup/plugins/tree/master/packages/replace) with Rollup.

**Example Vite configuration**

```js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
});
```

**Example Webpack configuration**

```js twoslash
// @twoslash-cache: {"v":1,"hash":"641939dbaa5a0f1601ad2b42babf70a79136e704efdb7a0d33cadc3686128916","data":"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="}
import webpack from 'webpack';

export default {
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    }),
  ],
};
```

:::
