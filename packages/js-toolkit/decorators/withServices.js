/**
 * @typedef {import('../Base').default} Base
 * @typedef {import('../Base').BaseConstructor} BaseConstructor
 * @typedef {import('../services/drag').DragServiceOptions} DragServiceOptions
 */

/**
 * @typedef {DragServiceOptions & { target?: (this:Base, Base) => HTMLElement }} DragDecoratorOptions
 */

/**
 * Add dragging capabilities to a component.
 *
 * @template {BaseConstructor} T
 * @param {T} BaseClass
 * @param {Array<any>} services
 * @returns {T}
 */
export default function withServices(BaseClass, services = []) {
  // @ts-ignore
  return class extends BaseClass {
    static config = {
      name: `${BaseClass.config.name}WithServices`,
      emits: services.map(([name]) => name),
    };

    /**
     * Class constructor.
     * @param {HTMLElement} el
     */
    constructor(el) {
      super(el);

      this.$on('mounted', () => {
        services.forEach(([name, getInstance]) => {
          this.$services.register(name, getInstance(this));
          this.$services.enable(name);
        });
      });

      this.$on('destroyed', () => {
        services.forEach(([name]) => {
          this.$services.disable(name);
          this.$services.unregister(name);
        });
      });
    }
  };
}
