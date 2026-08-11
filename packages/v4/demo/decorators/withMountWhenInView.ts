import { Base, type BaseConfig } from '../../src/index';

/**
 * The classic mixin constraint: TypeScript only allows extending a generic
 * constructor typed with a single rest parameter.
 */
type Constructor<T = Base> = (new (...args: any[]) => T) & { config: BaseConfig };

/**
 * Reimplementation of the v3 `withMountWhenInView` decorator on the v4 model.
 *
 * v3 had to manage a parallel lifecycle. In v4 the decorator only *defers*:
 * the registry calls `$mount()` when the element enters the DOM; the
 * decorated class starts observing instead of mounting, and lets the
 * IntersectionObserver drive the reversible mount/destroy cycle:
 *
 * - in view → `super.$mount()` (announces, `mounted()` runs, cleanups arm)
 * - out of view → `super.$destroy()` (cleanups run — one cycle per pass)
 *
 * Everything composes for free: an unmounted instance is invisible to
 * `$query`/`$closest`/`$watchChildren`, announces nothing, and its pending
 * scheduler tasks are canceled. This is issue #751's `data-mount="in-view"`
 * strategy, expressed as a class-level decorator.
 */
export function withMountWhenInView<T extends Constructor>(
  BaseClass: T,
  options: IntersectionObserverInit = { threshold: [0, 1] },
): T {
  return class extends BaseClass {
    #observer: IntersectionObserver | null = null;

    $mount(): this {
      // The registry may call this repeatedly (insertions, moves): keep one
      // observer for the instance's lifetime. `observe()` on an already
      // observed element is a no-op.
      this.#observer ??= new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            super.$mount();
          } else {
            super.$destroy();
          }
        }
      }, options);
      this.#observer.observe(this.$el);
      return this;
    }

    $terminate(): this {
      this.#observer?.disconnect();
      this.#observer = null;
      return super.$terminate();
    }
  };
}
