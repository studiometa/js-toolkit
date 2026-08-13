import type { BaseConfig } from '../../src/index.js';
import { DataBind, type DataBindOptions, type DataBindProps } from './DataBind.js';
import { getCallback, type DataExpression } from './expression.js';
import type { DataValue } from './registry.js';

export type DataComputedProps = DataBindProps & {
  $options: DataBindOptions & { compute: string };
};

/**
 * DataComputed — a read-only binding whose value is an expression of the
 * group's value and data.
 *
 * Port of `@studiometa/ui` 1.10's `DataComputed` (45 lines → 43 here).
 *
 * **Ported unchanged.** `__supportsMutations` → `supportsMutations` is the
 * whole diff. Worth noting what it did *not* need: `DataComputed` is the one
 * place a real signal library would offer a derived value, and it does not
 * use one. Its recomputation is driven by the group channel, and the
 * dependency it actually reads (`$data`) is a snapshot the registry rebuilds
 * on every write. So **core needs no `computed()`** for this family — a
 * plain subscriber plus an immutable snapshot covers it.
 */
export class DataComputed extends DataBind {
  // Narrow the inherited view rather than re-parameterising the class: v4's
  // `$options` is built from `config.options`, which merges along the
  // prototype chain, so the runtime already has `compute` here and only the
  // type needs saying. `declare` emits nothing.
  declare $options: DataComputedProps['$options'];

  static config: BaseConfig = {
    name: 'DataComputed',
    options: {
      compute: String,
    },
  };

  /** @protected */
  override get supportsMutations(): boolean {
    return false;
  }

  get compute(): DataExpression {
    const { group, compute } = this.$options;
    return getCallback(group, `return ${compute};`);
  }

  override set(value: DataValue): void {
    let newValue = value;

    try {
      newValue = this.compute(value, this.target, this.$data) as DataValue;
    } catch (error) {
      console.error('[data] Compute expression failed:', error);
    }

    super.set(newValue, false);
  }
}
