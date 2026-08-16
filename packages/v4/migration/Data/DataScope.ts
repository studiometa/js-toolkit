import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';
import {
  DataRegistry,
  DataRegistryContext,
  type DataScopeMember,
  type DataValue,
} from './registry.js';

export type DataScopeProps = BaseProps & {
  $options: {
    group: string;
  };
};

/** A local data boundary and default group for descendant components. */
export class DataScope extends Base<DataScopeProps> {
  static config: BaseConfig = {
    name: 'DataScope',
    options: {
      group: {
        type: String,
        default: 'default',
      },
    },
  };

  /** Provided during construction so descendants can resolve it before mount. */
  registry = this.$provide(
    DataRegistryContext,
    new DataRegistry({
      scoped: true,
      defaultGroup: () => this.$options.group,
      isReady: () => this.$isMounted,
    }),
  );

  /**
   * The live peer set for a group inside this scope.
   */
  getGroup(group: string): Set<DataScopeMember> {
    return this.registry.members(group);
  }

  getData(group: string): Readonly<Record<string, DataValue>> {
    return this.registry.getData(group);
  }

  setValue(group: string, key: string, value: DataValue, source?: DataScopeMember): void {
    this.registry.setValue(group, key, value, source);
  }

  deleteValue(group: string, key: string, source: DataScopeMember): void {
    this.registry.deleteValue(group, key, source);
  }

  hydrate(group: string, member: DataScopeMember): void {
    this.registry.hydrate(group, member);
  }
}
