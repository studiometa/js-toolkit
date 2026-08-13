/**
 * The `Data*` family of @studiometa/ui, ported onto the v4 prototype.
 *
 * Registering is the consumer's call and **order does not matter** — a member
 * asks with `subscribe: true`, so a `DataScope` registered last still takes
 * back the members that fell through to the page-wide registry:
 *
 *     registerComponents(DataScope, DataBind, DataModel, DataComputed, DataEffect);
 */

export { DataBind, type DataBindOptions, type DataBindProps } from './DataBind.js';
export { DataComputed, type DataComputedProps } from './DataComputed.js';
export { DataEffect, type DataEffectProps } from './DataEffect.js';
export { DataModel, type DataModelProps } from './DataModel.js';
export { DataScope, type DataScopeProps } from './DataScope.js';
export {
  DataRegistry,
  DataRegistryContext,
  resolveDataRegistry,
  type DataRegistryOptions,
  type DataScopeMember,
  type DataUpdate,
  type DataValue,
} from './registry.js';
export {
  emitDomUpdate,
  runWrapped,
  warn,
  type DomUpdateRunner,
  type DomUpdateTransitioner,
  type NormalizedRunner,
} from './dom-update.js';
export { getCallback, type DataExpression } from './expression.js';
export {
  isCheckbox,
  isInput,
  isSelect,
  readControlValue,
  resolvePropertyName,
  serializeControlValue,
  setProperty,
  valuesEqual,
  writeControlValue,
  type DataControlContext,
  type DataControlMember,
} from './formControl.js';
