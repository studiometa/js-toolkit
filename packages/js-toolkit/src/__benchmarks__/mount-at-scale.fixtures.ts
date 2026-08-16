/**
 * Component shapes, markup and the shared settle definition for the
 * cross-version mounting measurements.
 *
 * Both versions are measured through their own native path — v3 registers
 * with `registerComponents()` and is mounted by the document mutation
 * observer feeding `SmartQueue`; v4 registers with its own
 * `registerComponents()` and is mounted by its scheduler. Those two paths are
 * the thing being compared, so nothing here tries to make them look alike.
 *
 * What *is* identical is the definition of "done": the Nth `mounted()` call,
 * followed by the main thread going quiet. It is observed from the components
 * themselves, so neither framework's own settle API — v3's `$mount()` promise,
 * v4's `whenDOMSettled()` — is privileged, and neither is allowed to define
 * away work it defers.
 */
import {
  Base as BaseV3,
  registerComponents as registerComponentsV3,
  type BaseConfig as BaseConfigV3,
  type BaseConstructor as BaseConstructorV3,
} from '@studiometa/js-toolkit';
import {
  Base as BaseV4,
  registerComponents as registerComponentsV4,
  type BaseConfig as BaseConfigV4,
  type BaseConstructor as BaseConstructorV4,
  type RefEvent as RefEventV4,
} from '../../../v4/src/index.js';

// --- the version-neutral settle point ----------------------------------

interface Counter {
  count: number;
  pending: { target: number; resolve: () => void } | null;
}

function record(counter: Counter): void {
  counter.count += 1;
  if (counter.pending !== null && counter.count >= counter.pending.target) {
    const { resolve } = counter.pending;
    counter.pending = null;
    resolve();
  }
}

function arm(counter: Counter, target: number): Promise<void> {
  counter.count = 0;
  counter.pending = null;
  if (target <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    counter.pending = { target, resolve };
  });
}

const mounts: Counter = { count: 0, pending: null };
const destroys: Counter = { count: 0, pending: null };

/**
 * Called from every fixture's `mounted()`, on both sides. This — not a
 * framework promise — is what the benchmarks wait for.
 */
export function recordMount(): void {
  record(mounts);
}

/** Called from every fixture's `destroyed()`, on both sides. */
export function recordDestroy(): void {
  record(destroys);
}

/** Arm the mount counter for the next insertion. Call before touching the DOM. */
export function whenMounted(target: number): Promise<void> {
  return arm(mounts, target);
}

/** Arm the destroy counter for the next removal. Call before touching the DOM. */
export function whenDestroyed(target: number): Promise<void> {
  return arm(destroys, target);
}

/** How many `mounted()` calls have run since the last arming. */
export function mountedSoFar(): number {
  return mounts.count;
}

/**
 * How long a probe round trip may take and still count as quiet.
 *
 * An idle round trip measures 0.1-0.7 ms here, and the shortest unit of work
 * either version schedules is far above that, so 8 ms separates "nothing ran"
 * from "something did" with room to spare — including the 4 ms Chromium
 * clamps a deeply nested `setTimeout(0)` to.
 */
const QUIET_MS = 8;

/** Resolve after every timer already due — v3's `SmartQueue` yields on one. */
function timerProbe(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/**
 * Resolve after every background task already posted — v4's scheduler posts
 * one per element. Same priority means FIFO, so this cannot overtake them.
 */
function backgroundProbe(): Promise<void> {
  const { scheduler } = globalThis as {
    scheduler?: { postTask(fn: () => void, options?: object) };
  };
  if (!scheduler) {
    return timerProbe();
  }
  return new Promise((resolve) => {
    void scheduler.postTask(resolve, { priority: 'background' });
  });
}

/**
 * Resolve once the main thread has nothing left to run.
 *
 * Two probes, because the versions queue through different mechanisms and a
 * probe on one queue can overtake pending work on the other: v3 yields with
 * `setTimeout`, v4 posts background tasks. Both are awaited together, and the
 * round trip is repeated until it comes back fast, which can only happen when
 * both queues are empty.
 *
 * The idle round trip costs 0.1-0.7 ms, so the tail this adds to a
 * measurement is not material at any size worth benchmarking — and it is the
 * same tail on both sides. `mount-at-scale.profile.ts` reports the settle
 * time and the quiet time separately, so the gap between them is visible
 * rather than assumed.
 */
export async function whenMainThreadQuiet(): Promise<void> {
  for (;;) {
    const start = performance.now();
    await Promise.all([timerProbe(), backgroundProbe()]);
    if (performance.now() - start < QUIET_MS) {
      return;
    }
  }
}

// --- v3 components -----------------------------------------------------

/** Nothing declared: the floor of what mounting one component costs. */
class V3Flat extends BaseV3 {
  static config: BaseConfigV3 = { name: 'V3Flat' };

  mounted() {
    recordMount();
  }

  destroyed() {
    recordDestroy();
  }
}

/**
 * A four-deep chain. Each level declares the next so the whole family
 * registers, and no level declares a handler: the comparison against the flat
 * shape is about tree shape alone.
 */
class V3Depth4 extends BaseV3 {
  static config: BaseConfigV3 = { name: 'V3Depth4' };

  mounted() {
    recordMount();
  }
}

class V3Depth3 extends BaseV3 {
  static config: BaseConfigV3 = { name: 'V3Depth3', components: { V3Depth4 } };

  mounted() {
    recordMount();
  }
}

class V3Depth2 extends BaseV3 {
  static config: BaseConfigV3 = { name: 'V3Depth2', components: { V3Depth3 } };

  mounted() {
    recordMount();
  }
}

class V3Depth1 extends BaseV3 {
  static config: BaseConfigV3 = { name: 'V3Depth1', components: { V3Depth2 } };

  mounted() {
    recordMount();
  }
}

/** Five refs, three declared options and four handlers — an ordinary component. */
class V3Realistic extends BaseV3<{
  $refs: { trigger: HTMLElement; panel: HTMLElement; items: HTMLElement[]; label: HTMLElement };
  $options: { columns: number; label: string; open: boolean };
}> {
  static config: BaseConfigV3 = {
    name: 'V3Realistic',
    refs: ['trigger', 'panel', 'items[]', 'label', 'close'],
    options: { columns: Number, label: String, open: Boolean },
  };

  count = 0;

  mounted() {
    // Real components read their options and touch their refs on mount.
    this.count = this.$options.columns + this.$refs.items.length;
    this.$refs.panel.hidden = !this.$options.open;
    recordMount();
  }

  onTriggerClick() {
    this.count += 1;
  }

  onItemsPointerdown(event: PointerEvent, index: number) {
    this.count += index;
  }

  onLabelMouseover() {
    this.count += 1;
  }

  onCloseClick() {
    this.count -= 1;
  }
}

// --- v4 components -----------------------------------------------------

class V4Flat extends BaseV4 {
  static config: BaseConfigV4 = { name: 'V4Flat' };

  mounted(): void {
    recordMount();
  }

  destroyed(): void {
    recordDestroy();
  }
}

class V4Depth4 extends BaseV4 {
  static config: BaseConfigV4 = { name: 'V4Depth4' };

  mounted(): void {
    recordMount();
  }
}

class V4Depth3 extends BaseV4 {
  static config: BaseConfigV4 = { name: 'V4Depth3', components: { V4Depth4 } };

  mounted(): void {
    recordMount();
  }
}

class V4Depth2 extends BaseV4 {
  static config: BaseConfigV4 = { name: 'V4Depth2', components: { V4Depth3 } };

  mounted(): void {
    recordMount();
  }
}

class V4Depth1 extends BaseV4 {
  static config: BaseConfigV4 = { name: 'V4Depth1', components: { V4Depth2 } };

  mounted(): void {
    recordMount();
  }
}

class V4Realistic extends BaseV4<{
  $refs: { trigger: HTMLElement; panel: HTMLElement; items: HTMLElement[]; label: HTMLElement };
  $options: { columns: number; label: string; open: boolean };
}> {
  static config: BaseConfigV4 = {
    name: 'V4Realistic',
    refs: ['trigger', 'panel', 'items[]', 'label', 'close'],
    options: { columns: Number, label: String, open: Boolean },
  };

  count = 0;

  mounted(): void {
    this.count = this.$options.columns + this.$refs.items.length;
    this.$refs.panel.hidden = !this.$options.open;
    recordMount();
  }

  onTriggerClick(): void {
    this.count += 1;
  }

  onItemsPointerdown({ index }: RefEventV4): void {
    this.count += index;
  }

  onLabelMouseover(): void {
    this.count += 1;
  }

  onCloseClick(): void {
    this.count -= 1;
  }
}

// --- markup ------------------------------------------------------------

/** How many `data-component` elements the nested scenario packs per root. */
export const NESTING_DEPTH = 4;

function realisticMarkup(name: string): string {
  return `<div data-component="${name}" data-option-columns="3" data-option-label="panel" data-option-open="true">
  <button data-ref="trigger"></button>
  <div data-ref="panel"><span data-ref="items[]"></span><span data-ref="items[]"></span><span data-ref="items[]"></span></div>
  <span data-ref="label"></span>
  <button data-ref="close"></button>
</div>`;
}

function nestedMarkup(prefix: string): string {
  return `<div data-component="${prefix}Depth1"><div data-component="${prefix}Depth2"><div data-component="${prefix}Depth3"><div data-component="${prefix}Depth4"></div></div></div></div>`;
}

/**
 * Markup builders per scenario, parameterised by the version's component
 * prefix so both sides describe the same page. Each returns exactly `size`
 * `data-component` elements, and therefore exactly `size` `mounted()` calls,
 * so a result divides into a per-component cost.
 *
 * v4's `inView` and `responsive` scenarios have no entry here. Both are
 * declared in v4's markup — `data-mount="in-view"`, `data-option-x:s` — and
 * v3 has neither attribute: its analogues are the `withMountWhenInView` and
 * `withResponsiveOptions` decorators, which are a different unit of work
 * wrapped around the component rather than a cost the registry pays per
 * element. Comparing the two would compare a decorator against an attribute,
 * so they are left to v4's own `mount-at-scale.bench.ts`.
 */
function buildScenarios(prefix: string) {
  return {
    /**
     * A name nothing is registered under. It is the discovery floor, and the
     * one scenario where the two designs are expected to diverge by
     * construction: v4's observer still walks the inserted subtree, while v3
     * iterates its registry and never looks at an unknown name.
     *
     * No component mounts here, so the settle point is the quiet thread alone.
     */
    control: (size: number) => `<div data-component="${prefix}Unregistered"></div>`.repeat(size),
    flat: (size: number) => `<div data-component="${prefix}Flat"></div>`.repeat(size),
    nested: (size: number) => nestedMarkup(prefix).repeat(Math.ceil(size / NESTING_DEPTH)),
    realistic: (size: number) => realisticMarkup(`${prefix}Realistic`).repeat(size),
  };
}

export const scenariosV3 = buildScenarios('V3');
export const scenariosV4 = buildScenarios('V4');

export type ScenarioName = keyof ReturnType<typeof buildScenarios>;

/** The version a benchmark drives, and the markup that matches it. */
export const VERSIONS = {
  v3: scenariosV3,
  v4: scenariosV4,
} as const;

export type Version = keyof typeof VERSIONS;

/** How many `mounted()` calls a scenario's markup produces. */
export function expectedMounts(scenario: ScenarioName, size: number): number {
  if (scenario === 'control') {
    return 0;
  }
  if (scenario === 'nested') {
    return Math.ceil(size / NESTING_DEPTH) * NESTING_DEPTH;
  }
  return size;
}

const scenarioComponents = {
  // The control registers the flat component it never uses, so the observer
  // is live and the markup's name is simply unknown to it. Registering
  // nothing would measure a document neither framework is watching.
  control: { v3: [V3Flat], v4: [V4Flat] },
  flat: { v3: [V3Flat], v4: [V4Flat] },
  nested: { v3: [V3Depth1], v4: [V4Depth1] },
  realistic: { v3: [V3Realistic], v4: [V4Realistic] },
} satisfies Record<ScenarioName, { v3: BaseConstructorV3[]; v4: BaseConstructorV4[] }>;

/**
 * Register the components one scenario needs, for one version only.
 *
 * **The two versions take the document in turns.** Not because they collide:
 * v4 keys its per-element instance map with a symbol rather than the
 * `'__base__'` string v3 uses, so neither reads the other's entries, and
 * `packages/v4/src/coexistence.spec.ts` covers the case that used to throw —
 * v4's teardown finding the `'terminated'` marker v3 leaves behind. They take
 * turns to keep the measurement clean, which `releaseDocumentFromV3()` prices.
 *
 * Only the components a scenario needs are registered, so v3's per-mutation
 * document scan stays one or two selectors wide rather than the whole
 * catalogue.
 */
export async function registerScenario(version: Version, scenario: ScenarioName): Promise<void> {
  if (version === 'v4') {
    registerComponentsV4(...scenarioComponents[scenario].v4);
  } else {
    await registerComponentsV3(...scenarioComponents[scenario].v3);
  }
}

/**
 * Hand the document over from v3 to v4, so the v4 groups measure v4 alone.
 *
 * **This is measurement isolation, not a crash workaround.** v3's registry
 * callback runs on every childList mutation: it rescans the whole document
 * once per registered name, then walks every live instance checking
 * `isConnected`. Left live across the v4 groups — six v3 names registered by
 * then — it charges them for a scan that grows with the page v4 just mounted.
 *
 * Priced by running this file sixteen times in each state, released against
 * live, alternating so drift hits both. Medians across rounds, at 1 000
 * components:
 *
 * | group             | released | v3 live |  delta | rounds slower |
 * | :--               |      --: |     --: |    --: |           --: |
 * | `swap` control    |  2.30 ms | 3.10 ms |   +35% |         16/16 |
 * | `destroy` flat    |  4.30 ms | 6.10 ms |   +42% |         16/16 |
 * | `swap` realistic  | 104.2 ms | 112.4 ms |   +8% |         12/16 |
 *
 * All ten v4 benchmarks came out slower with v3 live, and the two cheap
 * groups in every single round. The same-condition contrast — one half of the
 * released rounds against the other — stays within ±13%, so the two headline
 * figures are well outside the noise the benchmark makes on its own.
 *
 * v3 must go first: v4 installs its mutation processor on the first
 * registration and offers no way to remove it, while v3's registry is a plain
 * map on `globalThis` that can be emptied. An emptied registry leaves v3's
 * observer attached but with nothing to scan for and no instances to
 * terminate, which is as close to absent as v3 can be made without reloading
 * the page.
 *
 * Safety no longer depends on any of this: v4 keys its instance map with
 * `Symbol.for('@studiometa/js-toolkit-v4/instances')`, so the two versions
 * share a document without touching each other's entries. See
 * `packages/v4/src/coexistence.spec.ts`.
 */
export function releaseDocumentFromV3(): void {
  globalThis.__JS_TOOLKIT_REGISTRY__?.clear();
  globalThis.__JS_TOOLKIT_INSTANCES__?.clear();
  globalThis.__JS_TOOLKIT_ELEMENTS__?.clear();
}

/** Empty the document and let both frameworks finish tearing everything down. */
export async function clearDocument(): Promise<void> {
  document.body.replaceChildren();
  await whenMainThreadQuiet();
}

/**
 * Clone-ready trees, built before the timer starts. Parsing markup costs more
 * than mounting it, so no measurement may include `innerHTML`.
 */
export function buildPool(html: string, count: number): HTMLElement[] {
  const template = document.createElement('div');
  template.innerHTML = html;
  return Array.from({ length: count }, () => template.cloneNode(true) as HTMLElement);
}
