# @studiometa/oxlint-plugin-js-toolkit

Oxlint/ESLint plugin enforcing best practices for [@studiometa/js-toolkit](https://js-toolkit.studiometa.dev).

## Installation

```bash
npm install --save-dev @studiometa/oxlint-plugin-js-toolkit
```

## Configuration

### Oxlint

Add the plugin to your `.oxlintrc.json`:

```json
{
  "jsPlugins": ["@studiometa/oxlint-plugin-js-toolkit"],
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
import jsToolkit from '@studiometa/oxlint-plugin-js-toolkit';

export default [
  jsToolkit.configs.recommended,
  // ...your other config
];
```

To customise individual rule severities, add an override entry after the recommended config:

```js
import jsToolkit from '@studiometa/oxlint-plugin-js-toolkit';

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

| Rule | Description | Recommended |
|------|-------------|-------------|
| `js-toolkit/require-config` | Requires a `static config` property with a `name` on every class extending `Base`. | error |
| `js-toolkit/require-config-name-pascal-case` | Requires `config.name` to be PascalCase. | error |
| `js-toolkit/refs-camel-case` | Requires ref names in `config.refs` to be camelCase. Supports the `[]` multiple-ref suffix. | error |
| `js-toolkit/refs-plural-multiple` | Requires refs using the `[]` multiple-ref suffix to be pluralized (e.g. `links[]` not `link[]`). | error |
| `js-toolkit/options-camel-case` | Requires option keys in `config.options` to be camelCase. | error |

### Lifecycle methods

| Rule | Description | Recommended |
|------|-------------|-------------|
| `js-toolkit/async-lifecycle-methods` | Requires lifecycle methods (`mounted`, `destroyed`, `updated`, `terminated`, `ticked`, `scrolled`, `resized`, `moved`, `loaded`, `keyed`) to be declared `async`. | error |

### Event handlers

| Rule | Description | Recommended |
|------|-------------|-------------|
| `js-toolkit/on-handler-naming` | Requires event handler methods to follow the `onXxxYyy` camelCase convention. | error |
| `js-toolkit/on-global-handler-prefix` | Requires handlers for window-only events (e.g. `resize`) to use the `onWindow` or `onDocument` prefix. | warn |

### Forbidden patterns

| Rule | Description | Recommended |
|------|-------------|-------------|
| `js-toolkit/no-deprecated-properties` | Disallows removed (`$parent`, `$root`) and deprecated (`$children`) properties. Use `$closest()` and `$query()`/`$queryAll()` instead. | error |
| `js-toolkit/no-dispatch-event` | Disallows `dispatchEvent()` inside `Base` subclasses. Use `this.$emit()` instead. | warn |
| `js-toolkit/no-shadow-dom` | Disallows `attachShadow()` inside `Base` subclasses. The framework uses Light DOM only. | error |
| `js-toolkit/no-create-app` | Disallows `createApp()` (deprecated). Use `registerComponent()` instead. | warn |
| `js-toolkit/no-event-listener-methods` | Disallows `addEventListener()` and `removeEventListener()` inside `Base` subclasses. Define `on*` methods instead — the framework handles binding and cleanup automatically. | error |
