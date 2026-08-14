import { type BaseConfig } from '../../src/index.js';
import { InView } from './InView.js';

/**
 * InViewOnce — the one-shot variant of {@link InView}.
 *
 * Port of `@studiometa/ui` 1.10's `InViewOnce` (10 code lines → 4 here).
 *
 * | change | forced by |
 * | --- | --- |
 * | `mounted() { $emit('in-view'); $terminate(); }` → nothing at all, the inherited `mounted()` is enough | **`config.mountStrategy = 'visible'`**. v3 had one intersection lifecycle and had to end the component's life to stop it repeating; v4 ships the one-shot strategy beside the reversible one, so the observer disconnects itself on the first crossing and the component simply stays mounted. |
 * | `config.emits: ['in-view']` → nothing | runtime `emits` removed. See below: the narrowing v3 expressed here is **not** expressible in v4. |
 * | `destroyed() {}` overriding the parent's `$emit('out-of-view')` | kept, and for a narrower reason than v3's: the strategy can no longer produce a leave, but removing the element still destroys the instance, and a one-shot must not announce a leave then either. |
 *
 * **`visible` and `in-view` are the whole difference between the two
 * components.** In v3 they are one decorator plus a `$terminate()` call in a
 * subclass; in v4 they are two values of one config key, and the subclass
 * exists only to say which. That is the cleanest single mapping in this port
 * — and it also shows what the strategy split in DESIGN.md is worth: `visible`
 * and `in-view` were separated because "re-mounting is right for a scroll
 * animation and destructive for a map", and here they turn out to be two
 * shipped components of the same family.
 *
 * ## A subclass cannot narrow `$emits`
 *
 * v3's `config.emits: ['in-view']` says, at runtime and per class, that this
 * component emits one event where its parent emits two. `$emits` is declared
 * by the type parameter of the `extends Base<…>` clause, which a subclass does
 * not restate — and restating it through `declare readonly __props` fails,
 * because a narrower `$emits` is not assignable to the parent's. So
 * `InViewOnce` inherits `'in-view' | 'out-of-view'` as its declarable set. The
 * `destroyed()` override is what guarantees the second is never sent, and it
 * is a runtime guarantee rather than a checked one.
 */
export class InViewOnce extends InView {
  static config: BaseConfig = {
    name: 'InViewOnce',
    // One-shot: the strategy disconnects its observer on the first crossing.
    mountStrategy: 'visible',
  };

  /**
   * Suppress the inherited leave announcement. A one-shot component must never
   * emit `out-of-view`, including on the destroy that removing its element
   * produces.
   */
  destroyed(): void {
    // no-op
  }
}
