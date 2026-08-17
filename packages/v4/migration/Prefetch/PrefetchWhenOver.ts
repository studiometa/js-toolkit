import { component, type BaseProps } from '../../src/index.js';
import { AbstractPrefetch } from './AbstractPrefetch.js';

/**
 * Prefetches the link's URL when a pointer, a touch or the keyboard reaches it.
 *
 * v3 binds `onMouseenter` on an instance that already exists. v4 has a mount
 * strategy for the same intent, so the variant is a config key and the
 * component is one call: `interaction` mounts on `pointerenter`,
 * `pointerdown` or `focusin`, whichever comes first, and never before. That
 * makes this class the same shape as its sibling — the strategy decides
 * **when**, the base decides **what** — and it is the second variant of one
 * family whose whole difference is now a string.
 *
 * It is also wider than v3 rather than narrower: a mouse-only `mouseenter`
 * never fires for a touch or for a keyboard, so the two inputs ui cannot
 * prefetch for are exactly the ones this strategy adds.
 *
 * @link https://ui.studiometa.dev/reference/items/Prefetch/
 */
@component({ name: 'PrefetchWhenOver', mountStrategy: 'interaction' })
export class PrefetchWhenOver<T extends BaseProps = BaseProps> extends AbstractPrefetch<T> {
  mounted(): void {
    this.prefetch();
  }
}
