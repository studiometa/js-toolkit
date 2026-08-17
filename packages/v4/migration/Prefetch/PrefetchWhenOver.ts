import { type BaseConfig, type BaseProps } from '../../src/index.js';
import { AbstractPrefetch } from './AbstractPrefetch.js';

/**
 * Prefetches the link's URL when the pointer enters the anchor.
 *
 * @link https://ui.studiometa.dev/reference/items/Prefetch/
 */
export class PrefetchWhenOver<T extends BaseProps = BaseProps> extends AbstractPrefetch<T> {
  static config: BaseConfig = {
    name: 'PrefetchWhenOver',
  };

  onMouseenter(): void {
    this.prefetch();
  }
}
