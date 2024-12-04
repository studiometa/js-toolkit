import type { BaseDecorator, BaseInterface } from '../Base/types.js';
import type { Base, BaseProps, BaseConfig } from '../Base/index.js';
import type { MutationServiceOptions, MutationServiceProps } from '../services/index.js';
import { useMutation } from '../services/index.js';

export type MutationDecoratorOptions = MutationServiceOptions & {
  target?: (this: Base, instance: Base) => Node;
};

export interface WithMutationInterface extends BaseInterface {
  mutated?(props: MutationServiceProps): void;
}

/**
 * Add a mutation observer to a component.
 */
export function withMutation<S extends Base>(
  BaseClass: typeof Base,
  { target = (instance) => instance.$el, ...options }: MutationDecoratorOptions = {},
): BaseDecorator<BaseInterface, S> {
  /**
   * Class.
   */
  class WithMutation<T extends BaseProps = BaseProps> extends BaseClass<T & WithMutationInterface> {
    /**
     * Config.
     */
    static config: BaseConfig = {
      ...BaseClass.config,
      emits: ['mutated'],
    };

    /**
     * Class constructor.
     */
    constructor(element: HTMLElement) {
      super(element);
      this.$on('mounted', () => {
        this.$services.register(
          'mutated',
          useMutation.bind(undefined, target.call(this, this), options),
        );
        this.$services.enable('mutated');
      });

      this.$on('destroyed', () => {
        this.$services.disable('mutated');
        this.$services.unregister('mutated');
      });
    }
  }

  // @ts-ignore
  return WithMutation;
}
