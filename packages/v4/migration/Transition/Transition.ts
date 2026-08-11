import { Base, nextFrame } from '../../src/index.js';
import { transition } from '../utils/transition.js';

export interface TransitionProps {
  $options: {
    enterFrom: string;
    enterActive: string;
    enterTo: string;
    enterKeep: boolean;
    leaveFrom: string;
    leaveActive: string;
    leaveTo: string;
    leaveKeep: boolean;
  };
  $emits: {
    'transition-enter': [];
    'transition-enter-start': [];
    'transition-enter-end': [];
    'transition-leave': [];
    'transition-leave-start': [];
    'transition-leave-end': [];
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
 * `withTransition` decorator behind it, collapsed into one class: v3 split
 * them so that `SliderDots` could reuse the behaviour through a mixin, which
 * `$watchChildren` makes unnecessary.
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
    options: {
      enterFrom: String,
      enterActive: String,
      enterTo: String,
      enterKeep: Boolean,
      leaveFrom: String,
      leaveActive: String,
      leaveTo: String,
      leaveKeep: Boolean,
    },
  };

  state: 'entering' | 'leaving' | null = null;

  get target(): HTMLElement {
    return this.$el;
  }

  async enter(): Promise<void> {
    const { enterFrom, enterActive, enterTo, enterKeep, leaveTo } = this.$options;
    this.state = 'entering';
    this.$emit('transition-enter');
    this.$emit('transition-enter-start');
    if (leaveTo) {
      this.target.classList.remove(...leaveTo.split(' ').filter(Boolean));
    }
    await nextFrame();
    await transition(
      this.target,
      { from: enterFrom, active: enterActive, to: enterTo },
      enterKeep ? 'keep' : 'remove',
    );
    this.$emit('transition-enter-end');
  }

  async leave(): Promise<void> {
    const { leaveFrom, leaveActive, leaveTo, leaveKeep, enterTo } = this.$options;
    this.state = 'leaving';
    this.$emit('transition-leave');
    this.$emit('transition-leave-start');
    if (enterTo) {
      this.target.classList.remove(...enterTo.split(' ').filter(Boolean));
    }
    await nextFrame();
    await transition(
      this.target,
      { from: leaveFrom, active: leaveActive, to: leaveTo },
      leaveKeep ? 'keep' : 'remove',
    );
    this.$emit('transition-leave-end');
  }

  toggle(): Promise<void> {
    return this.state === 'entering' ? this.leave() : this.enter();
  }
}
