import { component } from '../../src/index.js';
import { AbstractPrefetch } from './AbstractPrefetch.js';

/**
 * Prefetches the link's URL the first time it enters the viewport.
 *
 * v3 wraps the class in `withMountWhenInView` and relies on the shared
 * `prefetchedUrls` set to make the repeated mounts harmless. The intent is
 * one-shot, so this is `visible` rather than `in-view` — the third component
 * in this exercise where v4's one-shot strategy replaces a decorator plus a
 * guard against its own repetition.
 *
 * @link https://ui.studiometa.dev/reference/items/Prefetch/
 */
@component({ name: 'PrefetchWhenVisible', mountStrategy: 'visible' })
export class PrefetchWhenVisible extends AbstractPrefetch {
  mounted(): void {
    this.prefetch();
  }
}
