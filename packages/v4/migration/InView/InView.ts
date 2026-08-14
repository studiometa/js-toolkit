import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';

export type InViewProps = BaseProps & {
  $emits: {
    'in-view': void;
    'out-of-view': void;
  };
};

/**
 * InView — a primitive emitting directional viewport events.
 *
 * Port of `@studiometa/ui` 1.10's `InView` (17 code lines → 5 here).
 *
 * v3 is `class InView extends withMountWhenInView(Base)`: a 109-line
 * decorator that wraps the constructor, builds an `IntersectionObserver`,
 * calls `$mount()` on entry and `setTimeout(() => $destroy())` on exit, and
 * overrides `$mount()` so nothing else can mount the component. The component
 * itself then does nothing but map that lifecycle onto two events.
 *
 * v4 declares the same lifecycle in one config key:
 *
 * | change | forced by |
 * | --- | --- |
 * | `withMountWhenInView(Base)` → `config.mountStrategy = 'in-view'` | mount strategies moved into the registry (#751). The decorator, its `__isVisible` latch, its `$mount()` override and its `terminated` teardown are all gone, and `data-mount` overrides the strategy per element for free. |
 * | `config.emits: ['in-view', 'out-of-view']` → `$emits` in the props type | runtime `emits` removed. Zero bytes, and the names are checked. |
 *
 * **The `in-view` strategy is `withMountWhenInView` with the latch fixed.**
 * v3 kept `__isVisible` because it ORs every entry of a batch and would
 * otherwise mount twice; v4's strategy acts on each entry, and `$mount()` /
 * `$destroy()` are both idempotent — the second call returns early. What was a
 * field and a comparison is now nothing at all.
 *
 * ## What the port loses, and it has no workaround
 *
 * v3's decorator takes an `IntersectionObserverInit`, both as a decorator
 * argument (`{ threshold: [0, 1] }` by default) and as the documented
 * `data-option-intersection-observer` attribute. `applyMountStrategy()`
 * constructs `new IntersectionObserver(callback)` with **no init at all**, and
 * it does so from the registry — before, and independently of, the instance.
 * A component therefore cannot influence its own mount strategy's observer.
 *
 * There is no component-side workaround. Observing the element a second time
 * with the right `rootMargin` would not help: the thing that needs the margin
 * is the mount, which has already been decided by the observer the strategy
 * owns. See `InView.spec.ts`, where the spec for it is `it.fails()`.
 */
export class InView extends Base<InViewProps> {
  static config: BaseConfig = {
    name: 'InView',
    // The reversible strategy: mount on entry, destroy on exit, mount again on
    // re-entry — which is exactly the enter/leave pair this component maps.
    mountStrategy: 'in-view',
  };

  mounted(): void {
    this.$emit('in-view');
  }

  destroyed(): void {
    this.$emit('out-of-view');
  }
}
