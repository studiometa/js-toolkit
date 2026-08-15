import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';

export type InViewProps = BaseProps & {
  $emits: {
    'in-view': void;
    'out-of-view': void;
  };
};

/**
 * With the default mount strategy, emits `in-view` on viewport entry and `out-of-view` on exit.
 * Use `in-view:<rootMargin>` to configure early mounting.
 */
export class InView extends Base<InViewProps> {
  static config: BaseConfig = {
    name: 'InView',
    mountStrategy: 'in-view',
  };

  mounted(): void {
    this.$emit('in-view');
  }

  destroyed(): void {
    this.$emit('out-of-view');
  }
}
