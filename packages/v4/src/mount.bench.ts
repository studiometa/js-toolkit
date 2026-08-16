/** Benchmark remount and first-mount costs for representative component shapes. */
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

/** Reuse a bounded element pool so DOM growth is not measured. */
const pool = Array.from({ length: 100 }, panelElement);
let next = 0;
const nextElement = () => pool[next++ % pool.length];

/** Keep only one mounted instance to prevent listener accumulation. */
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
