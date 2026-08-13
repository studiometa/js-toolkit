import type { BaseConfig } from '../../src/index.js';
import { DataBind, type DataBindOptions, type DataBindProps } from './DataBind.js';
import { getCallback, type DataExpression } from './expression.js';
import type { DataValue } from './registry.js';

export type DataEffectProps = DataBindProps & {
  $options: DataBindOptions & { effect: string };
};

/**
 * DataEffect — run an expression on every group update, write nothing back.
 *
 * Port of `@studiometa/ui` 1.10's `DataEffect` (41 lines → 41 here).
 *
 * **Ported unchanged**, and it is the component that pins down what "deduped
 * delivery" has to mean for core: an effect is *observable*, so how many
 * times the channel delivers is not an implementation detail here — it is
 * the component's contract. Its spec counts calls.
 */
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
