import type { BaseConfig } from '../../src/index.js';
import { DataBind, type DataBindOptions, type DataBindProps } from './DataBind.js';
import { getCallback, type DataExpression } from './expression.js';
import type { DataValue } from './registry.js';

export type DataComputedProps = DataBindProps & {
  $options: DataBindOptions & { compute: string };
};

/** A read-only binding computed from its group's value and data. */
export class DataComputed extends DataBind<DataComputedProps> {
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
    return getCallback(`return ${this.$options.compute};`);
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
