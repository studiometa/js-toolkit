import type { BaseConfig } from '../../src/index.js';
import { DataBind, type DataBindProps } from './DataBind.js';
import { serializeControlValue } from './formControl.js';

export type DataModelProps = DataBindProps;

/** A `DataBind` that publishes user input. */
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
