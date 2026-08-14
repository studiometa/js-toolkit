/**
 * What a mount costs, and how much of it `#bindHandlers()` was redoing.
 *
 * Run with `npx vitest bench --config vitest.bench.config.js` from
 * `packages/v4`. Like the other files here, this answers a design question
 * rather than guarding against a regression.
 *
 * `$mount()` is not a once-per-instance path. Under a `data-mount` strategy —
 * `visible`, `media`, `interaction` — the same instance mounts and unmounts
 * as the page scrolls, so every allocation and every prototype walk inside
 * `#bindHandlers()` is paid again each time. The shapes below are the ones a
 * real component has:
 *
 * - **`Panel`** — five handlers across all four resolution rules (own
 *   element, a delegated child, a plain ref, a list ref, a global target),
 *   two declared children, three declared refs. What a slider or a dialog
 *   looks like.
 * - **`Bare`** — one own-element handler and nothing declared. The floor: it
 *   measures what a mount costs when there is almost nothing to resolve, so
 *   the share of the saving that is `$mount()` itself rather than handler
 *   resolution is visible.
 * - **`DeepPanel`** — `Panel` under three intermediate subclasses, each
 *   adding a handler. The prototype walk is the part that grows with the
 *   class hierarchy, and mixins (`withScroll`, `withDrag`) are how a real
 *   component gets deep.
 *
 * Each benchmark is a **remount**: construct once, then `$mount()`/
 * `$destroy()` in a loop, which is the repeat path. Construction is measured
 * separately so the two are not read as one number.
 */
import { bench, describe } from 'vitest';
import { Base, type BaseConfig, type DelegatedEvent, type RefEvent } from './Base.js';

/** Keeps each result observable so no benchmark is optimised away. */
declare global {
  // eslint-disable-next-line no-var
  var __benchSink: unknown;
}

class Slide extends Base {
  static config: BaseConfig = { name: 'BenchSlide' };
}

class Dot extends Base {
  static config: BaseConfig = { name: 'BenchDot' };
}

class Panel extends Base {
  static config: BaseConfig = {
    name: 'BenchPanel',
    refs: ['container', 'items[]', 'label'],
    components: { BenchSlide: Slide, BenchDot: Dot },
  };

  count = 0;

  onClick(): void {
    this.count += 1;
  }

  onItemsClick({ index }: RefEvent): void {
    this.count += index;
  }

  onLabelMouseover(): void {
    this.count += 1;
  }

  onBenchSlideChange({ target }: DelegatedEvent): void {
    this.count += target ? 1 : 0;
  }

  onWindowResize(): void {
    this.count += 1;
  }
}

class Bare extends Base {
  static config: BaseConfig = { name: 'BenchBare' };

  count = 0;

  onClick(): void {
    this.count += 1;
  }
}

class PanelA extends Panel {
  static config: BaseConfig = { name: 'BenchPanelA' };

  onContainerScroll(): void {
    this.count += 1;
  }
}

class PanelB extends PanelA {
  static config: BaseConfig = { name: 'BenchPanelB' };

  onDocumentKeydown(): void {
    this.count += 1;
  }
}

class DeepPanel extends PanelB {
  static config: BaseConfig = { name: 'BenchDeepPanel', refs: ['handle'] };

  onHandlePointerdown(): void {
    this.count += 1;
  }
}

/** The markup a `Panel` and everything extending it reads. */
function panelElement(): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = `
    <div data-ref="container">
      <button data-ref="items[]">1</button>
      <button data-ref="items[]">2</button>
      <button data-ref="items[]">3</button>
      <span data-ref="label">label</span>
      <div data-ref="handle"></div>
      <div data-component="BenchSlide"></div>
      <div data-component="BenchDot"></div>
    </div>
  `;
  document.body.append(el);
  return el;
}

function bareElement(): HTMLElement {
  const el = document.createElement('div');
  document.body.append(el);
  return el;
}

/** One instance per shape, mounted and destroyed over and over. */
const panel = new Panel(panelElement());
const bare = new Bare(bareElement());
const deep = new DeepPanel(panelElement());

describe('remount: $mount() + $destroy() on one instance', () => {
  bench('Panel — 5 handlers, 2 children, 3 refs', () => {
    globalThis.__benchSink = panel.$mount().$destroy();
  });

  bench('Bare — 1 handler, nothing declared', () => {
    globalThis.__benchSink = bare.$mount().$destroy();
  });

  bench('DeepPanel — 8 handlers, 4 classes deep', () => {
    globalThis.__benchSink = deep.$mount().$destroy();
  });
});

/**
 * A fixed pool, cycled: a fresh element per iteration would grow the document
 * without bound over a few thousand samples, and the append would end up being
 * what is measured.
 */
const pool = Array.from({ length: 100 }, panelElement);
let next = 0;
const nextElement = () => pool[next++ % pool.length];

/**
 * The previous instance is destroyed before the next is built, so exactly one
 * is ever mounted.
 *
 * Leaving them mounted would leak a `window` resize listener per iteration —
 * a few thousand of them over a run — and what the later samples measure is
 * then the listener list, not the mount. Its `$destroy()` is inside the
 * measured region as a result, which is the smaller distortion of the two and
 * an equal one on both sides of a comparison.
 */
let live: Base | null = null;

describe('construction + first mount, one instance alive at a time', () => {
  bench('Panel', () => {
    live?.$destroy();
    live = new Panel(nextElement()).$mount();
    globalThis.__benchSink = live;
  });

  bench('DeepPanel', () => {
    live?.$destroy();
    live = new DeepPanel(nextElement()).$mount();
    globalThis.__benchSink = live;
  });
});
