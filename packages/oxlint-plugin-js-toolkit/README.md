# @studiometa/oxlint-plugin-js-toolkit

[![NPM Version](https://img.shields.io/npm/v/@studiometa/oxlint-plugin-js-toolkit.svg?style=flat&colorB=3e63dd&colorA=414853)](https://www.npmjs.com/package/@studiometa/oxlint-plugin-js-toolkit/)
[![Downloads](https://img.shields.io/npm/dm/@studiometa/oxlint-plugin-js-toolkit?style=flat&colorB=3e63dd&colorA=414853)](https://www.npmjs.com/package/@studiometa/oxlint-plugin-js-toolkit/)
[![Size](https://img.shields.io/bundlephobia/minzip/@studiometa/oxlint-plugin-js-toolkit?style=flat&colorB=3e63dd&colorA=414853&label=size)](https://bundlephobia.com/package/@studiometa/js-toolkit)
[![Dependency Status](https://img.shields.io/librariesio/release/npm/oxlint-plugin-js-toolkit?style=flat&colorB=3e63dd&colorA=414853)](https://david-dm.org/studiometa/js-toolkit)
![Codecov](https://img.shields.io/codecov/c/github/studiometa/js-toolkit?style=flat&colorB=3e63dd&colorA=414853)

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
    "js-toolkit/no-deprecated-properties": "warn",
    "js-toolkit/no-dispatch-event": "warn",
    "js-toolkit/no-shadow-dom": "error",
    "js-toolkit/no-create-app": "warn",
    "js-toolkit/no-event-listener-methods": "error",
    "js-toolkit/no-deep-utils-import": "error",
    "js-toolkit/refs-no-bracket-access": "error",
    "js-toolkit/no-redundant-with-mount-when-in-view": "warn",
    "js-toolkit/prefer-ref-over-query-selector": "warn",
    "js-toolkit/require-refs-declared-in-config": "error",
    "js-toolkit/no-manual-intersection-observer": "warn",
    "js-toolkit/no-manual-mutation-observer": "warn"
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
      'js-toolkit/no-create-app': 'error', // override the default 'warn'
    },
  },
];
```

## Rules

### Class structure

| Rule | Description | Recommended | Fixable |
|------|-------------|-------------|---------|
| `js-toolkit/require-config` | Requires a `static config` property with a `name` on every class extending `Base`. | error | |
| `js-toolkit/require-config-name-pascal-case` | Requires `config.name` to be PascalCase. | error | 🔧 |
| `js-toolkit/refs-camel-case` | Requires ref names in `config.refs` to be camelCase. Supports the `[]` multiple-ref suffix. | error | 🔧 |
| `js-toolkit/refs-plural-multiple` | Requires refs using the `[]` multiple-ref suffix to be pluralized (e.g. `links[]` not `link[]`). | error | |
| `js-toolkit/options-camel-case` | Requires option keys in `config.options` to be camelCase. | error | 🔧 |

### Lifecycle methods

| Rule | Description | Recommended | Fixable |
|------|-------------|-------------|---------|
| `js-toolkit/async-lifecycle-methods` | Requires lifecycle methods (`mounted`, `destroyed`, `updated`, `terminated`, `ticked`, `scrolled`, `resized`, `moved`, `loaded`, `keyed`) to be declared `async`. | error | 🔧 |

### Event handlers

| Rule | Description | Recommended | Fixable |
|------|-------------|-------------|---------|
| `js-toolkit/on-handler-naming` | Requires event handler methods to follow the `onXxxYyy` camelCase convention. | error | |
| `js-toolkit/on-global-handler-prefix` | Requires handlers for window-only events (e.g. `resize`) to use the `onWindow` or `onDocument` prefix. | warn | |

### Forbidden patterns

| Rule | Description | Recommended | Fixable |
|------|-------------|-------------|---------|
| `js-toolkit/no-deprecated-properties` | Disallows deprecated properties (`$parent`, `$root`, `$children`). Use `$closest()` or `$query()` instead. | warn | |
| `js-toolkit/no-dispatch-event` | Disallows `dispatchEvent()` inside `Base` subclasses. Use `this.$emit()` instead. | warn | |
| `js-toolkit/no-shadow-dom` | Disallows `attachShadow()` inside `Base` subclasses. The framework uses Light DOM only. | error | |
| `js-toolkit/no-create-app` | Disallows `createApp()` (deprecated). Use `registerComponent()` instead. | warn | |
| `js-toolkit/no-event-listener-methods` | Disallows `addEventListener()` and `removeEventListener()` inside `Base` subclasses. Define `on*` methods instead — the framework handles binding and cleanup automatically. | error | |
| `js-toolkit/no-deep-utils-import` | Disallows deep imports from `@studiometa/js-toolkit/utils/*`. Use the public entrypoint `@studiometa/js-toolkit/utils` instead. | error | 🔧 |
| `js-toolkit/no-redundant-with-mount-when-in-view` | Disallows wrapping `withMountWhenInView` inside `withScrolledInView` — the latter already includes the former internally. | warn | |
| `js-toolkit/no-manual-intersection-observer` | Disallows `new IntersectionObserver()` inside `Base` subclasses. Use `withIntersectionObserver` or `withMountWhenInView` decorators instead. | warn | |
| `js-toolkit/no-manual-mutation-observer` | Disallows `new MutationObserver()` inside `Base` subclasses. Use the `withMutation` decorator instead. | warn | |

### Refs

| Rule | Description | Recommended | Fixable |
|------|-------------|-------------|---------|
| `js-toolkit/refs-no-bracket-access` | Disallows bracket access with a `[]` suffix on `this.$refs` (e.g. `this.$refs['items[]']`). Rewrites to dot notation camelCase. | error | 🔧 |
| `js-toolkit/prefer-ref-over-query-selector` | Warns when `this.$el.querySelector()` or `this.$el.querySelectorAll()` is used inside a `Base` subclass. Declare a ref in `static config` and use `this.$refs` instead. | warn | |
| `js-toolkit/require-refs-declared-in-config` | Requires all `this.$refs.<name>` accesses to be declared in `static config.refs`. | error | |
