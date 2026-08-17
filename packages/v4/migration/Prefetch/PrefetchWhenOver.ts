import { component, on, type BaseProps } from '../../src/index.js';
import { AbstractPrefetch } from './AbstractPrefetch.js';

/**
 * Prefetches the link's URL when the pointer enters the anchor.
 *
 * @link https://ui.studiometa.dev/reference/items/Prefetch/
 */
@component({ name: 'PrefetchWhenOver' })
export class PrefetchWhenOver<T extends BaseProps = BaseProps> extends AbstractPrefetch<T> {
  @on('mouseenter')
  prefetchOnHover(): void {
    this.prefetch();
  }
}
