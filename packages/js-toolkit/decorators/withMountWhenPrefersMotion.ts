import { withMountOnMediaQuery } from './withMountOnMediaQuery.js';
import type { Base } from '../Base/index.js';
import { BaseDecorator, BaseInterface } from '../Base/types.js';

/**
 * @link https://js-toolkit.studiometa.dev/api/decorators/withMountWhenPrefersMotion.html
 */
export function withMountWhenPrefersMotion<S extends Base = Base>(
  BaseClass: typeof Base,
): BaseDecorator<BaseInterface, S> {
  return withMountOnMediaQuery(BaseClass, 'not (prefers-reduced-motion)');
}
