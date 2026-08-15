import type { BaseConfig } from '../../src/index.js';
import { DataBind, type DataBindOptions, type DataBindProps } from './DataBind.js';
import { getCallback, type DataExpression } from './expression.js';
import type { DataValue } from './registry.js';

export type DataEffectProps = DataBindProps & {
  $options: DataBindOptions & { effect: string };
};

/** Run an expression on each group update without writing a value back. */
export class DataEffect extends DataBind {
  declare $options: DataEffectProps['$options'];

  static config: BaseConfig = {
    name: 'DataEffect',
    options: {
      effect: String,
    },
  };

  /** @protected */
  override get supportsMutations(): boolean {
    return false;
  }

  get effect(): DataExpression {
    const { group, effect } = this.$options;
    return getCallback(group, effect);
  }

  override set(value: DataValue): void {
    try {
      this.effect(value, this.target, this.$data);
    } catch (error) {
      console.error('[data] Effect expression failed:', error);
    }
  }
}
