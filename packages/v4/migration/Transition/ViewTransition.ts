import { Base } from '../../src/index.js';
import type { Transitionable } from './Transition.js';

export interface ViewTransitionProps {
  $options: { viewTransitionName: string; enterTo: string; leaveTo: string };
  $emits: {
    enter: [];
    'enter-start': [];
    'enter-end': [];
    leave: [];
    'leave-start': [];
    'leave-end': [];
  };
}

/**
 * ViewTransition — the same interface as `Transition`, animated by the
 * native View Transitions API.
 *
 * This is the port that shrank the most, and it did so without a single
 * decision to make: @studiometa/ui ships its own batching scheduler for this
 * (`ViewTransition/scheduler.ts` — microtask-batched updates flushed into one
 * `document.startViewTransition()`, batches serialised, synchronous
 * fallback). v4 moved that into core, so the component is just
 * `this.$viewTransition(update)` and the whole scheduler file disappears.
 */
export class ViewTransition extends Base<ViewTransitionProps> implements Transitionable {
  static config = {
    name: 'ViewTransition',
    options: {
      viewTransitionName: String,
      enterTo: String,
      leaveTo: String,
    },
  };

  state: 'entering' | 'leaving' | null = null;

  get target(): HTMLElement {
    return this.$el;
  }

  mounted(): void {
    const { viewTransitionName } = this.$options;
    if (viewTransitionName) {
      this.target.style.setProperty('view-transition-name', viewTransitionName);
    }
  }

  async enter(): Promise<void> {
    const { enterTo, leaveTo } = this.$options;
    this.state = 'entering';
    this.$emit('enter');
    this.$emit('enter-start');
    await this.$viewTransition(() => {
      this.#toggleClasses(leaveTo, enterTo);
    });
    this.$emit('enter-end');
  }

  async leave(): Promise<void> {
    const { enterTo, leaveTo } = this.$options;
    this.state = 'leaving';
    this.$emit('leave');
    this.$emit('leave-start');
    await this.$viewTransition(() => {
      this.#toggleClasses(enterTo, leaveTo);
    });
    this.$emit('leave-end');
  }

  toggle(): Promise<void> {
    return this.state === 'entering' ? this.leave() : this.enter();
  }

  #toggleClasses(remove: string, add: string): void {
    const removed = remove.split(' ').filter(Boolean);
    const added = add.split(' ').filter(Boolean);
    if (removed.length > 0) {
      this.target.classList.remove(...removed);
    }
    if (added.length > 0) {
      this.target.classList.add(...added);
    }
  }
}
