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
  "jsPlugins": [{ "name": "js-toolkit", "specifier": "@studiometa/eslint-plugin-js-toolkit" }],
  "rules": {
    "js-toolkit/require-config": "error",
    "js-toolkit/require-config-name-pascal-case": "error",
    "js-toolkit/refs-camel-case": "error",
    "js-toolkit/refs-plural-multiple": "error",
    "js-toolkit/options-camel-case": "error",
    "js-toolkit/async-lifecycle-methods": "error",
    "js-toolkit/on-handler-naming": "error",
    "js-toolkit/on-global-handler-prefix": "warn",
    "js-toolkit/no-deprecated-properties": "error",
    "js-toolkit/no-dispatch-event": "warn",
    "js-toolkit/no-shadow-dom": "error",
    "js-toolkit/no-create-app": "warn",
    "js-toolkit/no-event-listener-methods": "error"
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
| <span class="text-nowrap">`js-toolkit/refs-camel-case`</span>                 | Requires ref names in `config.refs` to be camelCase. Supports the `[]` multiple-ref suffix.      | 🔧      |
| <span class="text-nowrap">`js-toolkit/refs-plural-multiple`</span>            | Requires refs using the `[]` multiple-ref suffix to be pluralized (e.g. `links[]` not `link[]`). | ❌      |
| <span class="text-nowrap">`js-toolkit/options-camel-case`</span>              | Requires option keys in `config.options` to be camelCase.                                        | 🔧      |

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

| Rule                                                                    | Description                                                                                                                                                                  | Fixable |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| <span class="text-nowrap">`js-toolkit/no-deprecated-properties`</span>  | Disallows deprecated properties (`$parent`, `$root`, `$children`). Use `$closest()` or `$query()` instead.                                                                   | ❌      |
| <span class="text-nowrap">`js-toolkit/no-dispatch-event`</span>         | Disallows `dispatchEvent()` inside `Base` subclasses. Use `this.$emit()` instead.                                                                                            | ❌      |
| <span class="text-nowrap">`js-toolkit/no-shadow-dom`</span>             | Disallows `attachShadow()` inside `Base` subclasses. The framework uses Light DOM only.                                                                                      | ❌      |
| <span class="text-nowrap">`js-toolkit/no-create-app`</span>             | Disallows `createApp()` (deprecated). Use `registerComponent()` instead.                                                                                                     | ❌      |
| <span class="text-nowrap">`js-toolkit/no-event-listener-methods`</span> | Disallows `addEventListener()` and `removeEventListener()` inside `Base` subclasses. Define `on*` methods instead — the framework handles binding and cleanup automatically. | ❌      |
