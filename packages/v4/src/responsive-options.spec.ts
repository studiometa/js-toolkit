import { afterEach, describe, expect, it, vi } from 'vitest';
import { Base, type OptionChange } from './Base.js';
import { EVENTS } from './events.js';
import { registerComponent, registerManifest } from './registry.js';
import { BREAKPOINTS, setBreakpoints } from './services/breakpoint.js';
import { getInstance, resetDom, settle } from './test-utils.js';

/** Select test breakpoints without changing the viewport. */
function atSmall(): void {
  setBreakpoints({ small: '0rem', large: '9999rem' });
}

function atLarge(): void {
  setBreakpoints({ small: '0rem', large: '0rem' });
}

/** Count `MediaQueryList` listeners added while `during` runs. */
async function countMediaListeners(during: () => Promise<void>): Promise<number> {
  const proto = MediaQueryList.prototype;
  const original = proto.addEventListener;
  let added = 0;
  proto.addEventListener = function patched(
    this: MediaQueryList,
    ...args: Parameters<typeof original>
  ) {
    added += 1;
    return original.apply(this, args);
  };
  try {
    await during();
  } finally {
    proto.addEventListener = original;
  }
  return added;
}

class Label extends Base<{ $options: { label: string } }> {
  static config = {
    name: 'Label',
    options: { label: { type: String, default: 'base' } },
  };
}

class Grid extends Base<{ $options: { columns: number; gap: number } }> {
  static config = {
    name: 'Grid',
    options: {
      columns: { type: Number, default: 1 },
      gap: { type: Number, default: 0 },
    },
  };

  changes: OptionChange[] = [];

  cleanups = 0;

  optionColumnsChanged(change: OptionChange): () => void {
    this.changes.push(change);
    return () => {
      this.cleanups += 1;
    };
  }
}

class Banner extends Base<{ $options: { theme: string } }> {
  static config = {
    name: 'Banner',
    options: { theme: String },
  };

  changes: OptionChange[] = [];

  optionThemeChanged(change: OptionChange): void {
    this.changes.push(change);
  }
}

registerComponent(Label);
registerComponent(Grid);
registerComponent(Banner);

function render(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  return root;
}

afterEach(async () => {
  await resetDom();
  setBreakpoints(BREAKPOINTS);
});

describe('responsive options', () => {
  it('cascades upwards from the widest matching suffix, then to the base', async () => {
    atSmall();
    const root = render(
      `<p data-component="Label"
          data-option-label="base"
          data-option-label:large="wide"></p>`,
    );
    await settle();
    const label = getInstance<Label>(root.firstElementChild, 'Label');

    expect(label.$options.label).toBe('base');

    atLarge();
    expect(label.$options.label).toBe('wide');
  });

  it('falls back to the declared default when no attribute matches at all', async () => {
    atLarge();
    const root = render('<p data-component="Label"></p>');
    await settle();

    expect(getInstance<Label>(root.firstElementChild, 'Label').$options.label).toBe('base');
  });

  it('is derived on read, so a component that never subscribes still sees the crossing', async () => {
    atSmall();
    const root = render(
      `<p data-component="Label"
          data-option-label:small="narrow"
          data-option-label:large="wide"></p>`,
    );
    await settle();
    const label = getInstance<Label>(root.firstElementChild, 'Label');
    expect(label.$options.label).toBe('narrow');

    const added = await countMediaListeners(async () => {
      atLarge();
      await settle();
    });
    expect(label.$options.label).toBe('wide');
    expect(added).toBe(0);
  });

  it('does not serve a stale breakpoint after a crossing, subscribed to nothing', async () => {
    atSmall();
    const root = render(
      `<p data-component="Label"
          data-option-label:small="narrow"
          data-option-label:large="wide"></p>`,
    );
    await settle();
    const label = getInstance<Label>(root.firstElementChild, 'Label');

    const added = await countMediaListeners(async () => {
      for (let index = 0; index < 5; index += 1) {
        expect(label.$options.label).toBe('narrow');
      }

      atLarge();
      expect(label.$options.label).toBe('wide');

      await settle();
      expect(label.$options.label).toBe('wide');
      atSmall();
      expect(label.$options.label).toBe('narrow');
    });

    expect(added).toBe(0);
  });

  it('announces a crossing through `option<Name>Changed()`', async () => {
    atSmall();
    const root = render(
      `<div data-component="Grid"
            data-option-columns="1"
            data-option-columns:large="4"></div>`,
    );
    await settle();
    const grid = getInstance<Grid>(root.firstElementChild, 'Grid');

    expect(grid.changes).toHaveLength(1);
    expect(grid.changes[0]).toMatchObject({ value: 1, initial: true });

    atLarge();

    expect(grid.changes).toHaveLength(2);
    expect(grid.changes[1]).toMatchObject({
      name: 'columns',
      value: 4,
      previousValue: 1,
      rawValue: '4',
      previousRawValue: '1',
      initial: false,
    });
    expect(grid.cleanups).toBe(1);
    expect(grid.$options.columns).toBe(4);
  });

  it('says nothing when a crossing leaves the resolved value alone', async () => {
    atSmall();
    const root = render('<div data-component="Grid" data-option-columns="2"></div>');
    await settle();
    const grid = getInstance<Grid>(root.firstElementChild, 'Grid');
    expect(grid.changes).toHaveLength(1);

    atLarge();
    atSmall();

    expect(grid.changes).toHaveLength(1);
    expect(grid.cleanups).toBe(0);
  });

  it('reports a breakpoint-scoped attribute rewritten at runtime', async () => {
    atLarge();
    const root = render(
      `<div data-component="Grid"
            data-option-columns="1"
            data-option-columns:large="4"></div>`,
    );
    await settle();
    const grid = getInstance<Grid>(root.firstElementChild, 'Grid');
    grid.changes = [];

    grid.$el.setAttribute('data-option-columns:large', '6');
    await settle();
    expect(grid.changes).toHaveLength(1);
    expect(grid.changes[0]).toMatchObject({ value: 6, previousValue: 4 });

    grid.$el.setAttribute('data-option-columns:small', '3');
    await settle();
    expect(grid.changes).toHaveLength(1);

    grid.$el.removeAttribute('data-option-columns:large');
    await settle();
    expect(grid.changes).toHaveLength(2);
    expect(grid.changes[1]).toMatchObject({ value: 3, previousValue: 6 });
  });

  it('leaves an option written unsuffixed alone across a crossing', async () => {
    atSmall();
    const root = render(
      `<div data-component="Grid" data-option-columns:large="4" data-option-gap="8"></div>`,
    );
    await settle();
    const grid = getInstance<Grid>(root.firstElementChild, 'Grid');

    expect(grid.$options.gap).toBe(8);
    atLarge();
    expect(grid.$options.gap).toBe(8);
    expect(grid.$options.columns).toBe(4);
  });

  it('needs nothing declared: every option is responsive, including the shorthand form', async () => {
    atSmall();
    const root = render(
      `<p data-component="Banner"
          data-option-theme="light"
          data-option-theme:large="dark"></p>`,
    );
    await settle();
    const banner = getInstance<Banner>(root.firstElementChild, 'Banner');

    expect(banner.$options.theme).toBe('light');
    atLarge();
    expect(banner.$options.theme).toBe('dark');
  });

  it('observes the scoped spellings of an option no markup ever scoped', async () => {
    atSmall();
    const root = render('<p data-component="Banner" data-option-theme="light"></p>');
    await settle();
    const banner = getInstance<Banner>(root.firstElementChild, 'Banner');
    banner.changes = [];

    banner.$el.setAttribute('data-option-theme:small', 'dark');
    await settle();
    expect(banner.changes).toHaveLength(1);
    expect(banner.changes[0]).toMatchObject({ value: 'dark', previousValue: 'light' });
  });

  /** `package.json` lists this module in `sideEffects` because it observes breakpoint replacement at import time. */
  it('observes a scoped spelling named by a breakpoint set installed later', async () => {
    atSmall();
    const root = render('<div data-component="Grid" data-option-columns="1"></div>');
    await settle();
    const grid = getInstance<Grid>(root.firstElementChild, 'Grid');
    grid.changes = [];

    setBreakpoints({ small: '0rem', wide: '0rem' });
    await settle();
    grid.changes = [];

    grid.$el.setAttribute('data-option-columns:wide', '6');
    await settle();
    expect(grid.changes).toHaveLength(1);
    expect(grid.changes[0]).toMatchObject({ value: 6, previousValue: 1 });
  });

  it('holds its `matchMedia` listener for the mount cycle, and no longer', async () => {
    atSmall();
    const root = render(
      `<div data-component="Grid"
            data-option-columns="1"
            data-option-columns:large="4"></div>`,
    );

    const added = await countMediaListeners(async () => {
      await settle();
    });
    expect(added).toBeGreaterThan(0);

    const grid = getInstance<Grid>(root.firstElementChild, 'Grid');
    atLarge();
    expect(grid.changes).toHaveLength(2);

    root.firstElementChild?.remove();
    await settle();
    expect(grid.$isMounted).toBe(false);

    atSmall();
    atLarge();
    expect(grid.changes).toHaveLength(2);

    root.append(grid.$el);
    await settle();
    expect(grid.$isMounted).toBe(true);
    grid.changes = [];
    atSmall();
    expect(grid.changes).toHaveLength(1);
  });

  it('registers the scoped spellings of a component that arrives lazily', async () => {
    atSmall();

    class LazyGrid extends Base<{ $options: { columns: number } }> {
      static config = {
        name: 'LazyGrid',
        options: { columns: { type: Number, default: 1 } },
      };

      changes: OptionChange[] = [];

      optionColumnsChanged(change: OptionChange): void {
        this.changes.push(change);
      }
    }

    registerManifest({ LazyGrid: async () => LazyGrid });

    const root = render(
      `<div data-component="LazyGrid"
            data-option-columns="1"
            data-option-columns:large="4"></div>`,
    );
    await settle();
    const grid = getInstance<LazyGrid>(root.firstElementChild, 'LazyGrid');

    expect(grid.$options.columns).toBe(1);
    grid.changes = [];

    grid.$el.setAttribute('data-option-columns:small', '3');
    await settle();
    expect(grid.changes).toHaveLength(1);
    expect(grid.changes[0]).toMatchObject({ value: 3, previousValue: 1 });
  });

  it('stops option mount work when an initial effect destroys its cycle', async () => {
    atSmall();
    const calls: string[] = [];
    let destroyOnMount = true;
    let mountedEvents = 0;

    class SelfDestroyingOption extends Base<{
      $options: { stop: number; later: number };
    }> {
      static config = {
        name: 'SelfDestroyingInitialOption',
        options: { stop: Number, later: Number },
      };

      optionStopChanged(): void {
        calls.push('stop');
        if (destroyOnMount) {
          destroyOnMount = false;
          this.$destroy();
        }
      }

      optionLaterChanged(): void {
        calls.push('later');
      }

      mounted(): void {
        calls.push('mounted');
      }
    }

    registerComponent(SelfDestroyingOption);
    const el = document.createElement('div');
    el.setAttribute('data-component', 'SelfDestroyingInitialOption');
    el.addEventListener(EVENTS.component.mounted, () => {
      mountedEvents += 1;
    });
    const addedMediaListeners = await countMediaListeners(async () => {
      document.body.append(el);
      await settle();
    });
    const instance = getInstance<SelfDestroyingOption>(el, 'SelfDestroyingInitialOption');

    try {
      expect(calls).toEqual(['stop']);
      expect(instance.$isMounted).toBe(false);
      expect(mountedEvents).toBe(0);
      expect(addedMediaListeners).toBe(0);
    } finally {
      // Release any leaked test subscription.
      instance.$mount().$destroy();
    }
  });

  it('reports a suffix that names no breakpoint, which is what v3 markup is', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    atSmall();
    render(
      // A combined suffix is one unknown breakpoint name.
      `<p data-component="Label" data-option-label:small:large="both"></p>`,
    );
    await settle();

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('`data-option-label:small:large` names no breakpoint'),
    );
    warn.mockRestore();
  });
});
