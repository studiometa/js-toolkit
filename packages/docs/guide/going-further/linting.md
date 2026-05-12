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

#### `js-toolkit/require-config`

**Recommended:** error

Requires a `static config` property with a `name` on every class extending `Base`.

#### `js-toolkit/require-config-name-pascal-case`

**Recommended:** error &nbsp;·&nbsp; **Fixable** 🔧

Requires `config.name` to be PascalCase.

### Refs

#### `js-toolkit/refs-camel-case`

**Recommended:** error &nbsp;·&nbsp; **Fixable** 🔧

Requires ref names in `config.refs` to be camelCase. Supports the `[]` multiple-ref suffix.

#### `js-toolkit/refs-plural-multiple`

**Recommended:** error

Requires refs using the `[]` multiple-ref suffix to be pluralized (e.g. `links[]` not `link[]`).

#### `js-toolkit/refs-no-bracket-access`

**Recommended:** error &nbsp;·&nbsp; **Fixable** 🔧

Disallows bracket access with a `[]` suffix on `this.$refs` (e.g. `this.$refs['items[]']`). Rewrites to dot notation camelCase.

#### `js-toolkit/require-refs-declared-in-config`

**Recommended:** error

Requires all `this.$refs.<name>` accesses to be declared in `static config.refs`.

#### `js-toolkit/prefer-ref-over-query-selector`

**Recommended:** warn

Warns when `this.$el.querySelector()` or `this.$el.querySelectorAll()` is used inside a `Base` subclass. Declare a ref in `static config` and use `this.$refs` instead.

### Options

#### `js-toolkit/options-camel-case`

**Recommended:** error &nbsp;·&nbsp; **Fixable** 🔧

Requires option keys in `config.options` to be camelCase.

#### `js-toolkit/require-options-declared-in-config`

**Recommended:** error

Requires all `this.$options.<name>` accesses to be declared in `static config.options`.

### Emits

#### `js-toolkit/emits-kebab-case`

**Recommended:** error &nbsp;·&nbsp; **Fixable** 🔧

Requires emit names in `config.emits` to be kebab-case (e.g. `content-change`).

#### `js-toolkit/emits-multi-word`

**Recommended:** error

Requires emit names in `config.emits` to be multi-word to avoid collisions with native DOM events (e.g. `item-click` not `click`).

#### `js-toolkit/require-emit-declared-in-config`

**Recommended:** error

Requires all `this.$emit('name')` calls to use event names declared in `static config.emits`.

### Components

#### `js-toolkit/components-pascal-case`

**Recommended:** error &nbsp;·&nbsp; **Fixable** 🔧

Requires component keys in `config.components` to be PascalCase.

#### `js-toolkit/require-children-declared-in-config`

**Recommended:** error

Requires all `this.$children.<Name>` accesses to be declared in `static config.components`.

### Lifecycle methods

#### `js-toolkit/async-lifecycle-methods`

**Recommended:** error &nbsp;·&nbsp; **Fixable** 🔧

Requires lifecycle methods (`mounted`, `destroyed`, `updated`, `terminated`, `ticked`, `scrolled`, `resized`, `moved`, `loaded`, `keyed`) to be declared `async`.

### Event handlers

#### `js-toolkit/on-handler-naming`

**Recommended:** error

Requires event handler methods to follow the `onXxxYyy` camelCase convention.

#### `js-toolkit/on-global-handler-prefix`

**Recommended:** warn

Requires handlers for window-only events (e.g. `resize`) to use the `onWindow` or `onDocument` prefix.

### Forbidden patterns

#### `js-toolkit/no-deprecated-properties`

**Recommended:** warn

Disallows deprecated properties (`$parent`, `$root`, `$children`). Use `$closest()` or `$query()` instead.

#### `js-toolkit/no-dispatch-event`

**Recommended:** warn

Disallows `dispatchEvent()` inside `Base` subclasses. Use `this.$emit()` instead.

#### `js-toolkit/no-shadow-dom`

**Recommended:** error

Disallows `attachShadow()` inside `Base` subclasses. The framework uses Light DOM only.

#### `js-toolkit/no-create-app`

**Recommended:** warn

Disallows `createApp()` (deprecated). Use `registerComponent()` instead.

#### `js-toolkit/no-event-listener-methods`

**Recommended:** error

Disallows `addEventListener()` and `removeEventListener()` inside `Base` subclasses. Define `on*` methods instead — the framework handles binding and cleanup automatically.

#### `js-toolkit/no-deep-utils-import`

**Recommended:** error &nbsp;·&nbsp; **Fixable** 🔧

Disallows deep imports from `@studiometa/js-toolkit/utils/*`. Use the public entrypoint `@studiometa/js-toolkit/utils` instead.

#### `js-toolkit/no-redundant-with-mount-when-in-view`

**Recommended:** warn

Disallows wrapping `withMountWhenInView` inside `withScrolledInView` — the latter already includes the former internally.

#### `js-toolkit/no-manual-intersection-observer`

**Recommended:** warn

Disallows `new IntersectionObserver()` inside `Base` subclasses. Use `withIntersectionObserver` or `withMountWhenInView` decorators instead.

#### `js-toolkit/no-manual-mutation-observer`

**Recommended:** warn

Disallows `new MutationObserver()` inside `Base` subclasses. Use the `withMutation` decorator instead.
