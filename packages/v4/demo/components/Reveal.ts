import { Base } from '../../src/index.js';
import { withMountWhenInView } from '../decorators/withMountWhenInView.js';

/**
 * Demo component for the `withMountWhenInView` decorator: each pass through
 * the viewport is one full mount/destroy cycle, so the `mounted()` returned
 * cleanup runs every time the element leaves the screen.
 */
class RevealBase extends Base {
  static config = { name: 'Reveal' };

  cycles = 0;

  mounted() {
    this.cycles += 1;
    // Direct DOM writes: the cleanup below runs during `$destroy()`, after
    // which the instance's pending `$write` tasks would be canceled.
    this.$el.classList.add('is-mounted');
    this.$el.textContent = `mounted — cycle ${this.cycles}`;
    return () => {
      this.$el.classList.remove('is-mounted');
      this.$el.textContent = `destroyed — mounted ${this.cycles}× so far`;
    };
  }
}

export const Reveal = withMountWhenInView(RevealBase, { threshold: 0.4 });
