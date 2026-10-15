---
name: studiometa-eslint-plugin-js-toolkit
description: Configure and fix the rules of @studiometa/eslint-plugin-js-toolkit, the ESLint and Oxlint plugin for @studiometa/js-toolkit components. Use when a project installs @studiometa/eslint-plugin-js-toolkit, when a lint report shows a js-toolkit/* rule, or when you add the plugin to eslint.config.js or .oxlintrc.json.
---

# @studiometa/eslint-plugin-js-toolkit

The plugin checks that `@studiometa/js-toolkit` components follow the framework conventions: config, refs, options, event handlers, lifecycle and scheduling.

This skill matches the installed package version. Every rule, with its description and severity, is in [references/README.md](references/README.md).

## Choose the rule set

The plugin has two rule sets. Use the one that matches the installed `@studiometa/js-toolkit` major version:

- js-toolkit v4: `jsToolkit.configs.v4`. It replaces `recommended`, it does not extend it.
- js-toolkit v3: `jsToolkit.configs.recommended`.

```js
// eslint.config.js
import { jsToolkit } from '@studiometa/eslint-plugin-js-toolkit';

export default [jsToolkit.configs.v4];
```

With Oxlint, add the plugin under the name `js-toolkit` in `jsPlugins` and copy the rules of the set from `references/README.md`:

```json
{
  "jsPlugins": [{ "name": "js-toolkit", "specifier": "@studiometa/eslint-plugin-js-toolkit" }]
}
```

## Fix a warning

- Read the rule description in `references/README.md` before the change.
- Fix the code. Do not disable the rule to make the warning go away.
- Some rules are fixable: run the linter with `--fix` for them.
- For the correct v4 API, read the `studiometa-js-toolkit` skill.
