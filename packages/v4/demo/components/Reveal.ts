import { Base } from '../../src/index.js';

/**
 * Demo for the `in-view` mount strategy: each pass through the viewport is
 * one full mount/destroy cycle, so the `mounted()` returned cleanup runs
 * every time the element leaves the screen.
 *
 * The strategy is declared in the config, and any element may override it
 * with `data-mount` — no decorator, no constructor wrapping, one canonical
 * constructor registered under the name (issue #751).
 */
export class Reveal extends Base {
  static config = { name: 'Reveal', mountStrategy: 'in-view' as const };

  cycles = 0;

  mounted() {
    this.cycles += 1;
    this.$el.classList.add('is-mounted');
    this.$el.textContent = `mounted — cycle ${this.cycles}`;
    return () => {
      this.$el.classList.remove('is-mounted');
      this.$el.textContent = `destroyed — mounted ${this.cycles}× so far`;
    };
  }
}
