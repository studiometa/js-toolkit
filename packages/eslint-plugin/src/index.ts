import { eslintCompatPlugin } from '@oxlint/plugins';
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
  noInternalBarrelImport,
  refsNoBracketAccess,
  noRedundantWithMountWhenInView,
  preferRefOverQuerySelector,
  requireRefsDeclaredInConfig,
  noManualIntersectionObserver,
  noManualMutationObserver,
  emitsKebabCase,
  emitsMultiWord,
  componentsPascalCase,
  requireEmitDeclaredInConfig,
  requireChildrenDeclaredInConfig,
  requireOptionsDeclaredInConfig,
  preferDestructuredLookups,
  noDollarPrefix,
  requireDestroyedCleanup,
  noWriteInReadPhase,
  noOptionsAssignment,
  preferInstanceScheduler,
  optionDefaultFactory,
  noConflictingNegatedOption,
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
  'no-internal-barrel-import': noInternalBarrelImport,
  'refs-no-bracket-access': refsNoBracketAccess,
  'no-redundant-with-mount-when-in-view': noRedundantWithMountWhenInView,
  'prefer-ref-over-query-selector': preferRefOverQuerySelector,
  'require-refs-declared-in-config': requireRefsDeclaredInConfig,
  'no-manual-intersection-observer': noManualIntersectionObserver,
  'no-manual-mutation-observer': noManualMutationObserver,
  'emits-kebab-case': emitsKebabCase,
  'emits-multi-word': emitsMultiWord,
  'components-pascal-case': componentsPascalCase,
  'require-emit-declared-in-config': requireEmitDeclaredInConfig,
  'require-children-declared-in-config': requireChildrenDeclaredInConfig,
  'require-options-declared-in-config': requireOptionsDeclaredInConfig,
  'prefer-destructured-lookups': preferDestructuredLookups,
  'no-dollar-prefix': noDollarPrefix,
  'require-destroyed-cleanup': requireDestroyedCleanup,
  'no-write-in-read-phase': noWriteInReadPhase,
  'no-options-assignment': noOptionsAssignment,
  'prefer-instance-scheduler': preferInstanceScheduler,
  'option-default-factory': optionDefaultFactory,
  'no-conflicting-negated-option': noConflictingNegatedOption,
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
  [`${PLUGIN_NAME}/no-deprecated-properties`]: 'warn',
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
  [`${PLUGIN_NAME}/emits-kebab-case`]: 'error',
  [`${PLUGIN_NAME}/emits-multi-word`]: 'error',
  [`${PLUGIN_NAME}/components-pascal-case`]: 'error',
  [`${PLUGIN_NAME}/require-emit-declared-in-config`]: 'error',
  [`${PLUGIN_NAME}/require-children-declared-in-config`]: 'error',
  [`${PLUGIN_NAME}/require-options-declared-in-config`]: 'error',
  [`${PLUGIN_NAME}/prefer-destructured-lookups`]: 'warn',
  [`${PLUGIN_NAME}/no-dollar-prefix`]: 'error',
  [`${PLUGIN_NAME}/require-destroyed-cleanup`]: 'warn',
};

/**
 * v4 rules.
 *
 * v4 is not v3 with a bigger version number, so this is a separate set rather
 * than an extension of `recommended`. Rules policing something v4 removed —
 * `config.emits`, `$children`, the v3 decorator names — are absent, and
 * `async-lifecycle-methods` is absent because a v4 frame hook returns the
 * function which writes rather than a promise.
 */
const v4Rules: Record<string, unknown> = {
  [`${PLUGIN_NAME}/no-write-in-read-phase`]: 'error',
  [`${PLUGIN_NAME}/no-options-assignment`]: 'error',
  [`${PLUGIN_NAME}/prefer-instance-scheduler`]: 'warn',
  [`${PLUGIN_NAME}/option-default-factory`]: 'error',
  [`${PLUGIN_NAME}/no-conflicting-negated-option`]: 'error',
  [`${PLUGIN_NAME}/no-deprecated-properties`]: ['error', { version: 'v4' }],
  [`${PLUGIN_NAME}/no-dispatch-event`]: 'warn',
  [`${PLUGIN_NAME}/no-shadow-dom`]: 'error',
  [`${PLUGIN_NAME}/no-event-listener-methods`]: 'error',
  [`${PLUGIN_NAME}/no-manual-mutation-observer`]: 'warn',
  [`${PLUGIN_NAME}/refs-no-bracket-access`]: 'error',
  [`${PLUGIN_NAME}/prefer-ref-over-query-selector`]: 'warn',
};

const base = eslintCompatPlugin({
  meta: {
    name: '@studiometa/eslint-plugin-js-toolkit',
  },
  rules,
});

const plugin = Object.assign(base, { configs: {} as Record<string, object> });

plugin.configs['recommended'] = {
  plugins: { [PLUGIN_NAME]: plugin },
  rules: recommendedRules,
};

plugin.configs['v4'] = {
  plugins: { [PLUGIN_NAME]: plugin },
  rules: v4Rules,
};

export { plugin as jsToolkit };
export default plugin;
