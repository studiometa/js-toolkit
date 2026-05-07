import {
  requireConfig,
  requireConfigNamePascalCase,
  refsCamelCase,
  optionsCamelCase,
  asyncLifecycleMethods,
  onHandlerNaming,
  onGlobalHandlerPrefix,
  noDeprecatedProperties,
  noDispatchEvent,
  noShadowDom,
  noCreateApp,
  noEventListenerMethods,
  refsPluralMultiple,
  noDeepUtilsImport,
  refsNoBracketAccess,
  noRedundantWithMountWhenInView,
  preferRefOverQuerySelector,
  requireRefsDeclaredInConfig,
  noManualIntersectionObserver,
  noManualMutationObserver,
} from './rules/index.ts';

const PLUGIN_NAME = 'js-toolkit';

const rules = {
  'require-config': requireConfig,
  'require-config-name-pascal-case': requireConfigNamePascalCase,
  'refs-camel-case': refsCamelCase,
  'refs-plural-multiple': refsPluralMultiple,
  'options-camel-case': optionsCamelCase,
  'async-lifecycle-methods': asyncLifecycleMethods,
  'on-handler-naming': onHandlerNaming,
  'on-global-handler-prefix': onGlobalHandlerPrefix,
  'no-deprecated-properties': noDeprecatedProperties,
  'no-dispatch-event': noDispatchEvent,
  'no-shadow-dom': noShadowDom,
  'no-create-app': noCreateApp,
  'no-event-listener-methods': noEventListenerMethods,
  'no-deep-utils-import': noDeepUtilsImport,
  'refs-no-bracket-access': refsNoBracketAccess,
  'no-redundant-with-mount-when-in-view': noRedundantWithMountWhenInView,
  'prefer-ref-over-query-selector': preferRefOverQuerySelector,
  'require-refs-declared-in-config': requireRefsDeclaredInConfig,
  'no-manual-intersection-observer': noManualIntersectionObserver,
  'no-manual-mutation-observer': noManualMutationObserver,
};

const recommendedRules: Record<string, string> = {
  [`${PLUGIN_NAME}/require-config`]: 'error',
  [`${PLUGIN_NAME}/require-config-name-pascal-case`]: 'error',
  [`${PLUGIN_NAME}/refs-camel-case`]: 'error',
  [`${PLUGIN_NAME}/refs-plural-multiple`]: 'error',
  [`${PLUGIN_NAME}/options-camel-case`]: 'error',
  [`${PLUGIN_NAME}/async-lifecycle-methods`]: 'error',
  [`${PLUGIN_NAME}/on-handler-naming`]: 'error',
  [`${PLUGIN_NAME}/on-global-handler-prefix`]: 'warn',
  [`${PLUGIN_NAME}/no-deprecated-properties`]: 'error',
  [`${PLUGIN_NAME}/no-dispatch-event`]: 'warn',
  [`${PLUGIN_NAME}/no-shadow-dom`]: 'error',
  [`${PLUGIN_NAME}/no-create-app`]: 'warn',
  [`${PLUGIN_NAME}/no-event-listener-methods`]: 'error',
  [`${PLUGIN_NAME}/no-deep-utils-import`]: 'error',
  [`${PLUGIN_NAME}/refs-no-bracket-access`]: 'error',
  [`${PLUGIN_NAME}/no-redundant-with-mount-when-in-view`]: 'warn',
  [`${PLUGIN_NAME}/prefer-ref-over-query-selector`]: 'warn',
  [`${PLUGIN_NAME}/require-refs-declared-in-config`]: 'error',
  [`${PLUGIN_NAME}/no-manual-intersection-observer`]: 'warn',
  [`${PLUGIN_NAME}/no-manual-mutation-observer`]: 'warn',
};

const plugin: { meta: object; rules: typeof rules; configs: Record<string, object> } = {
  meta: {
    name: '@studiometa/oxlint-plugin-js-toolkit',
  },
  rules,
  configs: {},
};

plugin.configs['recommended'] = {
  plugins: { [PLUGIN_NAME]: plugin },
  rules: recommendedRules,
};

export default plugin;
