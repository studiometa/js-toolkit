import { Base } from '../../src/index.js';
import type { Transitionable } from './Transition.js';

async function updateWithViewTransition(update: () => void): Promise<void> {
  if (typeof document.startViewTransition === 'function') {
    await document.startViewTransition(update).finished;
  } else {
    update();
  }
}

export interface ViewTransitionProps {
  $options: { viewTransitionName: string; enterTo: string; leaveTo: string };
  $emits: {
    enter: void;
    'enter-start': void;
    'enter-end': void;
    leave: void;
    'leave-start': void;
    'leave-end': void;
  };
}

/**
 * ViewTransition — the same interface as `Transition`, animated by the
 * native View Transitions API.
 *
 * The migration calls `document.startViewTransition()` directly and applies
 * the update immediately when the platform API is absent. Its former batching
 * and serialization scheduler is UI choreography and does not move into core.
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
    await updateWithViewTransition(() => {
      this.#toggleClasses(leaveTo, enterTo);
    });
    this.$emit('enter-end');
  }

  async leave(): Promise<void> {
    const { enterTo, leaveTo } = this.$options;
    this.state = 'leaving';
    this.$emit('leave');
    this.$emit('leave-start');
    await updateWithViewTransition(() => {
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
