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
 * ## Parameterized viewport timing
 *
 * The registry owns the observer before an instance exists, so viewport mount
 * options belong to the strategy. `in-view:<rootMargin>` passes its suffix as
 * `IntersectionObserverInit.rootMargin`; for example, `in-view:400px` mounts
 * before the element reaches the viewport. The same form works in component
 * config, `data-mount` and lazy manifest entries without a second options
 * attribute. See the root-margin regression in `InView.spec.ts`.
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
