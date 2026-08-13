import { Base } from '../../src/index.js';
import {
  enterTransition,
  leaveTransition,
  TRANSITION_OPTIONS,
  type TransitionOptions,
} from '../utils/transition.js';

export interface TransitionProps {
  $options: TransitionOptions;
  $emits: {
    'transition-enter': void;
    'transition-enter-start': void;
    'transition-enter-end': void;
    'transition-leave': void;
    'transition-leave-start': void;
    'transition-leave-end': void;
  };
}

/**
 * A component that can be entered and left — what `Dialog` fans its
 * open/close out to.
 */
export interface Transitionable {
  enter(): Promise<void>;
  leave(): Promise<void>;
  toggle(): Promise<void>;
}

/**
 * Transition — enter/leave CSS transitions on an element.
 *
 * Port of @studiometa/ui 1.10's `Transition` component and the
 * `withTransition` decorator behind it. v3 split them so that `SliderDots`
 * could mix the behaviour in; here the shared half is two functions in
 * `utils/transition.ts` — a component cannot be mixed into another one, and
 * the decorator only ever needed the element and the options.
 *
 * One v3 feature is **not** ported: the `group` option, which collects the
 * other `Transition` instances sharing a group name through
 * `getInstances(Transition)`. v4 has no per-class instance registry — the
 * registry maps a name to a constructor, not to its live instances — so a
 * group would have to be resolved by DOM query instead.
 */
export class Transition extends Base<TransitionProps> implements Transitionable {
  static config = {
    name: 'Transition',
    options: { ...TRANSITION_OPTIONS },
  };

  state: 'entering' | 'leaving' | null = null;

  get target(): HTMLElement {
    return this.$el;
  }

  async enter(): Promise<void> {
    this.state = 'entering';
    this.$emit('transition-enter');
    this.$emit('transition-enter-start');
    await enterTransition(this.target, this.$options);
    this.$emit('transition-enter-end');
  }

  async leave(): Promise<void> {
    this.state = 'leaving';
    this.$emit('transition-leave');
    this.$emit('transition-leave-start');
    await leaveTransition(this.target, this.$options);
    this.$emit('transition-leave-end');
  }

  toggle(): Promise<void> {
    return this.state === 'entering' ? this.leave() : this.enter();
  }
}
