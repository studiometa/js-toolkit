import { component, type BaseProps } from '../../src/index.js';
import { TRANSITION_OPTIONS } from '../../src/utils/transition.js';
import { ScrollTo } from '../ScrollTo/index.js';
import { withTransition, type TransitionProps } from '../Transition/index.js';

export type AnchorNavLinkProps = BaseProps & TransitionProps;

/**
 * A `ScrollTo` link that also enters/leaves a CSS transition on itself,
 * driven by `AnchorNav` as its matching `AnchorNavTarget` mounts and
 * unmounts.
 *
 * `withTransition(ScrollTo)` is v3's own declaration restored — it mixed the
 * same decorator onto `AnchorScrollTo` — and it is the case that shows why
 * the mixin has to exist rather than the utilities being called directly:
 * the transition belongs on a class that already extends something else.
 *
 * @link https://ui.studiometa.dev/reference/items/AnchorNav/
 */
@component({
  name: 'AnchorNavLink',
  options: { ...TRANSITION_OPTIONS },
})
export class AnchorNavLink<T extends BaseProps = BaseProps> extends withTransition(ScrollTo)<
  AnchorNavLinkProps & T
> {
  /** The target section id, read from the link's hash. */
  get targetId(): string {
    return this.$el.hash.replace(/^#/, '');
  }
}
