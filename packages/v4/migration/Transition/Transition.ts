import { Base } from '../../src/index.js';
import {
  enterTransition,
  leaveTransition,
  TRANSITION_OPTIONS,
  type TransitionOptions,
} from '../../src/utils/transition.js';

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

/** Runs configured enter and leave CSS transitions on its element. */
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
