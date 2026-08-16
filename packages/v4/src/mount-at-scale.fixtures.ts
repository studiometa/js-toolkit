/**
 * Component shapes and markup for the at-scale mounting measurements.
 *
 * The throughput benchmarks and the long-task guard specs must describe the
 * same page, or a guard would defend a shape nobody measured. They therefore
 * share these fixtures instead of restating them.
 */
import { Base, type BaseConfig, type RefEvent } from './Base.js';
import { whenDOMSettled } from './dom-mutations.js';
import { registerComponents } from './registry.js';

/** Nothing declared: the floor of what mounting one component costs. */
class ScaleFlat extends Base {
  static config: BaseConfig = { name: 'ScaleFlat' };
}

/**
 * A four-deep chain. Each level declares the next so the whole family
 * registers, and no level declares a handler: the comparison against
 * `ScaleFlat` is about tree shape alone.
 */
class ScaleDepth4 extends Base {
  static config: BaseConfig = { name: 'ScaleDepth4' };
}

class ScaleDepth3 extends Base {
  static config: BaseConfig = { name: 'ScaleDepth3', components: { ScaleDepth4 } };
}

class ScaleDepth2 extends Base {
  static config: BaseConfig = { name: 'ScaleDepth2', components: { ScaleDepth3 } };
}

class ScaleDepth1 extends Base {
  static config: BaseConfig = { name: 'ScaleDepth1', components: { ScaleDepth2 } };
}

/** Five refs, three declared options and four handlers — an ordinary component. */
class ScaleRealistic extends Base<{
  $refs: { trigger: HTMLElement; panel: HTMLElement; items: HTMLElement[]; label: HTMLElement };
  $options: { columns: number; label: string; open: boolean };
}> {
  static config: BaseConfig = {
    name: 'ScaleRealistic',
    refs: ['trigger', 'panel', 'items[]', 'label', 'close'],
    options: { columns: Number, label: String, open: Boolean },
  };

  count = 0;

  mounted(): void {
    // Real components read their options and touch their refs on mount.
    this.count = this.$options.columns + this.$refs.items.length;
    this.$refs.panel.hidden = !this.$options.open;
  }

  onTriggerClick(): void {
    this.count += 1;
  }

  onItemsPointerdown({ index }: RefEvent): void {
    this.count += index;
  }

  onLabelMouseover(): void {
    this.count += 1;
  }

  onCloseClick(): void {
    this.count -= 1;
  }
}

/** One responsive option, so every mount walks the breakpoint cascade. */
class ScaleResponsive extends Base<{ $options: { columns: number } }> {
  static config: BaseConfig = {
    name: 'ScaleResponsive',
    options: { columns: Number },
  };

  count = 0;

  mounted(): void {
    this.count = this.$options.columns;
  }
}

/** Register every at-scale fixture. Idempotent, like `registerComponent()`. */
export function registerScaleComponents(): void {
  registerComponents(ScaleFlat, ScaleDepth1, ScaleRealistic, ScaleResponsive);
}

/** How many `data-component` elements each scenario's markup holds. */
export const NESTING_DEPTH = 4;

const REALISTIC_MARKUP = `<div data-component="ScaleRealistic" data-option-columns="3" data-option-label="panel" data-option-open="true">
  <button data-ref="trigger"></button>
  <div data-ref="panel"><span data-ref="items[]"></span><span data-ref="items[]"></span><span data-ref="items[]"></span></div>
  <span data-ref="label"></span>
  <button data-ref="close"></button>
</div>`;

/**
 * Markup builders, keyed by scenario. Each returns exactly `size`
 * `data-component` elements, so results divide into a per-component cost that
 * is comparable across scenarios.
 */
export const scenarios = {
  /**
   * Nothing registered under this name: the mutation observer still delivers
   * the records and the registry still walks the subtree, so this is the
   * discovery floor every other scenario is built on.
   */
  control: (size: number) => `<div data-component="ScaleUnregistered"></div>`.repeat(size),
  flat: (size: number) => `<div data-component="ScaleFlat"></div>`.repeat(size),
  nested: (size: number) =>
    `<div data-component="ScaleDepth1"><div data-component="ScaleDepth2"><div data-component="ScaleDepth3"><div data-component="ScaleDepth4"></div></div></div></div>`.repeat(
      Math.ceil(size / NESTING_DEPTH),
    ),
  realistic: (size: number) => REALISTIC_MARKUP.repeat(size),
  inView: (size: number) =>
    `<div data-component="ScaleFlat" data-mount="in-view"></div>`.repeat(size),
  responsive: (size: number) =>
    `<div data-component="ScaleResponsive" data-option-columns="1" data-option-columns:s="4"></div>`.repeat(
      size,
    ),
} satisfies Record<string, (size: number) => string>;

export type ScenarioName = keyof typeof scenarios;

/**
 * Clone-ready trees, built before the timer starts. Parsing markup costs more
 * than mounting it, so no measurement may include `innerHTML`.
 */
export function buildPool(html: string, count: number): HTMLElement[] {
  const template = document.createElement('div');
  template.innerHTML = html;
  return Array.from({ length: count }, () => template.cloneNode(true) as HTMLElement);
}

/** Empty the document and let the registry finish tearing everything down. */
export async function clearDocument(): Promise<void> {
  document.body.replaceChildren();
  await whenDOMSettled();
}
