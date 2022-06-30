import type { ServiceInterface } from '../services/index.js';
import type { Base, BaseConstructor } from '../Base/index.js';

export type WithServicesOptions = Record<
  string,
  (instance: Base) => <T>(...args: unknown[]) => ServiceInterface<T>
>;

/**
 * Add dragging capabilities to a component.
 *
 * @template {BaseConstructor} T
 * @param {T} BaseClass
 * @param {Array<any>} services
 * @returns {T}
 */
export function withServices(BaseClass: BaseConstructor, services: WithServicesOptions = {}) {
  const __services = Object.entries(services);
  // @ts-ignore
  return class extends BaseClass {
    static config = {
      name: `${BaseClass.config.name}WithServices`,
      emits: __services.map(([name]) => name),
    };

    /**
     * Class constructor.
     *
     * @param {HTMLElement} el
     */
    constructor(el) {
      super(el);

      this.$on('mounted', () => {
        for (const [name, getInstance] of __services) {
          this.$services.register(name, getInstance(this));
          this.$services.enable(name);
        }
      });

      this.$on('destroyed', () => {
        for (const [name] of __services) {
          this.$services.disable(name);
          this.$services.unregister(name);
        }
      });
    }
  };
}
