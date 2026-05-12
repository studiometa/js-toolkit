# Linting

The [`@studiometa/eslint-plugin-js-toolkit`](https://www.npmjs.com/package/@studiometa/eslint-plugin-js-toolkit) package provides an Oxlint/ESLint plugin that enforces best practices when writing components with this framework.

## Installation

```bash
npm install --save-dev @studiometa/eslint-plugin-js-toolkit
```

## Configuration

### Oxlint

Add the plugin to your `.oxlintrc.json`:

```json
{
  "jsPlugins": [
    {
      "name": "js-toolkit",
      "specifier": "@studiometa/eslint-plugin-js-toolkit"
    }
  ],
  "rules": {
    "js-toolkit/require-config": "error",
    "js-toolkit/require-config-name-pascal-case": "error",
    "js-toolkit/refs-camel-case": "error",
    "js-toolkit/refs-plural-multiple": "error",
    "js-toolkit/refs-no-bracket-access": "error",
    "js-toolkit/require-refs-declared-in-config": "error",
    "js-toolkit/options-camel-case": "error",
    "js-toolkit/require-options-declared-in-config": "error",
    "js-toolkit/async-lifecycle-methods": "error",
    "js-toolkit/on-handler-naming": "error",
    "js-toolkit/on-global-handler-prefix": "warn",
    "js-toolkit/emits-kebab-case": "error",
    "js-toolkit/emits-multi-word": "error",
    "js-toolkit/require-emit-declared-in-config": "error",
    "js-toolkit/components-pascal-case": "error",
    "js-toolkit/require-children-declared-in-config": "error",
    "js-toolkit/no-deprecated-properties": "warn",
    "js-toolkit/no-dispatch-event": "warn",
    "js-toolkit/no-shadow-dom": "error",
    "js-toolkit/no-create-app": "warn",
    "js-toolkit/no-event-listener-methods": "error",
    "js-toolkit/no-deep-utils-import": "error",
    "js-toolkit/no-redundant-with-mount-when-in-view": "warn",
    "js-toolkit/no-manual-intersection-observer": "warn",
    "js-toolkit/no-manual-mutation-observer": "warn",
    "js-toolkit/prefer-ref-over-query-selector": "warn"
  }
}
```

### ESLint

Add the recommended config to your `eslint.config.js` (ESLint v9 flat config):

```js
import jsToolkit from '@studiometa/eslint-plugin-js-toolkit';

export default [
  jsToolkit.configs.recommended,
  // ...your other config
];
```

To customise individual rule severities, add an override entry after the recommended config:

```js
import jsToolkit from '@studiometa/eslint-plugin-js-toolkit';

export default [
  jsToolkit.configs.recommended,
  {
    rules: {
      'js-toolkit/no-create-app': 'error',
    },
  },
];
```

## Rules

### Class structure

| Rule                                                                          | Description                                                                                      | Fixable |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------- |
| <span class="text-nowrap">`js-toolkit/require-config`</span>                  | Requires a `static config` property with a `name` on every class extending `Base`.               | ❌      |
| <span class="text-nowrap">`js-toolkit/require-config-name-pascal-case`</span> | Requires `config.name` to be PascalCase.                                                         | 🔧      |

### Refs

| Rule                                                                              | Description                                                                                                                                                             | Fixable |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| <span class="text-nowrap">`js-toolkit/refs-camel-case`</span>                     | Requires ref names in `config.refs` to be camelCase. Supports the `[]` multiple-ref suffix.                                                                             | 🔧      |
| <span class="text-nowrap">`js-toolkit/refs-plural-multiple`</span>                | Requires refs using the `[]` multiple-ref suffix to be pluralized (e.g. `links[]` not `link[]`).                                                                        | ❌      |
| <span class="text-nowrap">`js-toolkit/refs-no-bracket-access`</span>              | Disallows bracket access with a `[]` suffix on `this.$refs` (e.g. `this.$refs['items[]']`). Rewrites to dot notation camelCase.                                         | 🔧      |
| <span class="text-nowrap">`js-toolkit/require-refs-declared-in-config`</span>     | Requires all `this.$refs.<name>` accesses to be declared in `static config.refs`.                                                                                       | ❌      |
| <span class="text-nowrap">`js-toolkit/prefer-ref-over-query-selector`</span>      | Warns when `this.$el.querySelector()` or `this.$el.querySelectorAll()` is used inside a `Base` subclass. Declare a ref in `static config` and use `this.$refs` instead. | ❌      |

### Options

| Rule                                                                                | Description                                                                       | Fixable |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------- |
| <span class="text-nowrap">`js-toolkit/options-camel-case`</span>                    | Requires option keys in `config.options` to be camelCase.                         | 🔧      |
| <span class="text-nowrap">`js-toolkit/require-options-declared-in-config`</span>    | Requires all `this.$options.<name>` accesses to be declared in `static config.options`. | ❌ |

### Emits

| Rule                                                                                | Description                                                                                                                         | Fixable |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------- |
| <span class="text-nowrap">`js-toolkit/emits-kebab-case`</span>                      | Requires emit names in `config.emits` to be kebab-case (e.g. `content-change`).                                                     | 🔧      |
| <span class="text-nowrap">`js-toolkit/emits-multi-word`</span>                      | Requires emit names in `config.emits` to be multi-word to avoid collisions with native DOM events (e.g. `item-click` not `click`).  | ❌      |
| <span class="text-nowrap">`js-toolkit/require-emit-declared-in-config`</span>       | Requires all `this.$emit('name')` calls to use event names declared in `static config.emits`.                                       | ❌      |

### Components

| Rule                                                                                | Description                                                                                            | Fixable |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------- |
| <span class="text-nowrap">`js-toolkit/components-pascal-case`</span>                | Requires component keys in `config.components` to be PascalCase.                                       | 🔧      |
| <span class="text-nowrap">`js-toolkit/require-children-declared-in-config`</span>   | Requires all `this.$children.<Name>` accesses to be declared in `static config.components`.            | ❌      |

### Lifecycle methods

| Rule                                                                  | Description                                                                                                                                                       | Fixable |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| <span class="text-nowrap">`js-toolkit/async-lifecycle-methods`</span> | Requires lifecycle methods (`mounted`, `destroyed`, `updated`, `terminated`, `ticked`, `scrolled`, `resized`, `moved`, `loaded`, `keyed`) to be declared `async`. | 🔧      |

### Event handlers

| Rule                                                                   | Description                                                                                            | Fixable |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------- |
| <span class="text-nowrap">`js-toolkit/on-handler-naming`</span>        | Requires event handler methods to follow the `onXxxYyy` camelCase convention.                          | ❌      |
| <span class="text-nowrap">`js-toolkit/on-global-handler-prefix`</span> | Requires handlers for window-only events (e.g. `resize`) to use the `onWindow` or `onDocument` prefix. | ❌      |

### Forbidden patterns

| Rule                                                                               | Description                                                                                                                                                                  | Fixable |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| <span class="text-nowrap">`js-toolkit/no-deprecated-properties`</span>             | Disallows deprecated properties (`$parent`, `$root`, `$children`). Use `$closest()` or `$query()` instead.                                                                   | ❌      |
| <span class="text-nowrap">`js-toolkit/no-dispatch-event`</span>                    | Disallows `dispatchEvent()` inside `Base` subclasses. Use `this.$emit()` instead.                                                                                            | ❌      |
| <span class="text-nowrap">`js-toolkit/no-shadow-dom`</span>                        | Disallows `attachShadow()` inside `Base` subclasses. The framework uses Light DOM only.                                                                                      | ❌      |
| <span class="text-nowrap">`js-toolkit/no-create-app`</span>                        | Disallows `createApp()` (deprecated). Use `registerComponent()` instead.                                                                                                     | ❌      |
| <span class="text-nowrap">`js-toolkit/no-event-listener-methods`</span>            | Disallows `addEventListener()` and `removeEventListener()` inside `Base` subclasses. Define `on*` methods instead — the framework handles binding and cleanup automatically. | ❌      |
| <span class="text-nowrap">`js-toolkit/no-deep-utils-import`</span>                 | Disallows deep imports from `@studiometa/js-toolkit/utils/*`. Use the public entrypoint `@studiometa/js-toolkit/utils` instead.                                              | 🔧      |
| <span class="text-nowrap">`js-toolkit/no-redundant-with-mount-when-in-view`</span> | Disallows wrapping `withMountWhenInView` inside `withScrolledInView` — the latter already includes the former internally.                                                    | ❌      |
| <span class="text-nowrap">`js-toolkit/no-manual-intersection-observer`</span>      | Disallows `new IntersectionObserver()` inside `Base` subclasses. Use `withIntersectionObserver` or `withMountWhenInView` decorators instead.                                 | ❌      |
| <span class="text-nowrap">`js-toolkit/no-manual-mutation-observer`</span>          | Disallows `new MutationObserver()` inside `Base` subclasses. Use the `withMutation` decorator instead.                                                                       | ❌      |
