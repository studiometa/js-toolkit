import type { BaseConfig } from '../../src/index.js';
import { DataBind, type DataBindProps } from './DataBind.js';
import { serializeControlValue } from './formControl.js';

export type DataModelProps = DataBindProps;

/**
 * DataModel — a `DataBind` that publishes what the user types.
 *
 * Port of `@studiometa/ui` 1.10's `DataModel` (29 lines → 29 here).
 *
 * **Ported unchanged.** The only edits are the two renamed protected members
 * (`__controlContext` → `controlContext`, `__publishValue` → `publishValue`)
 * and the `isCurrent` call moving onto the registry. `onInput` is already the
 * v4 spelling — v3's magic handler names survived into v4 unchanged, which is
 * why the whole input half of this family costs nothing to move.
 */
export class DataModel extends DataBind {
  static config: BaseConfig = {
    name: 'DataModel',
  };

  override get isDataSource(): boolean {
    return true;
  }

  dispatch(): void {
    const value = serializeControlValue(this.controlContext);
    const publication = this.publishValue(value, true);

    if (this.dataRegistry.isCurrent(publication.group, publication.frame)) {
      this.set(value, false);
    }
  }

  onInput(): void {
    this.dispatch();
  }
}
