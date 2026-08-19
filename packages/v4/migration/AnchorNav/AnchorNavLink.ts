import { component, type BaseProps } from '../../src/index.js';
import {
  enterTransition,
  leaveTransition,
  TRANSITION_OPTIONS,
  type TransitionOptions,
} from '../../src/utils/transition.js';
import { ScrollTo } from '../ScrollTo/index.js';

export type AnchorNavLinkProps = BaseProps & {
  $options: TransitionOptions;
  $emits: {
    'transition-enter': void;
    'transition-enter-start': void;
    'transition-enter-end': void;
    'transition-leave': void;
    'transition-leave-start': void;
    'transition-leave-end': void;
  };
};

/**
 * A `ScrollTo` link that also enters/leaves a CSS transition on itself,
 * driven by `AnchorNav` as its matching `AnchorNavTarget` mounts and
 * unmounts. v3 mixed a `withTransition` decorator onto `AnchorScrollTo`;
 * v4's `Transition` is a standalone component rather than a mixin (the
 * `Dialog` port collapsed the two), so this calls the same
 * `enterTransition`/`leaveTransition` utilities `Transition` itself calls,
 * the way `SliderDots` does for the same reason.
 *
 * @link https://ui.studiometa.dev/reference/items/AnchorNav/
 */
@component({
  name: 'AnchorNavLink',
  options: { ...TRANSITION_OPTIONS },
})
export class AnchorNavLink<T extends BaseProps = BaseProps> extends ScrollTo<
  AnchorNavLinkProps & T
> {
  state: 'entering' | 'leaving' | null = null;

  /** The target section id, read from the link's hash. */
  get targetId(): string {
    return this.$el.hash.replace(/^#/, '');
  }

  async enter(): Promise<void> {
    this.state = 'entering';
    this.$emit('transition-enter');
    this.$emit('transition-enter-start');
    await enterTransition(this.$el, this.$options);
    this.$emit('transition-enter-end');
  }

  async leave(): Promise<void> {
    this.state = 'leaving';
    this.$emit('transition-leave');
    this.$emit('transition-leave-start');
    await leaveTransition(this.$el, this.$options);
    this.$emit('transition-leave-end');
  }

  toggle(): Promise<void> {
    return this.state === 'entering' ? this.leave() : this.enter();
  }
}
