import { afterEach, describe, expect, it, vi } from 'vitest';
import { Base, type OptionChange } from './Base.js';
import { registerComponent } from './registry.js';
import { BREAKPOINTS, setBreakpoints } from './services/breakpoint.js';
import { getInstance, resetDom, settle } from './test-utils.js';

/**
 * Two named widths, both `0rem`, so the *set* decides the active name and the
 * real viewport does not: every query matches, and the widest declared name
 * wins. Replacing the set is a real crossing — it goes through the same
 * `matchMedia` lists and the same emission a resize produces — which is what
 * makes a breakpoint testable at all without driving the browser's viewport.
 */
function atSmall(): void {
  setBreakpoints({ small: '0rem', large: '9999rem' });
}

function atLarge(): void {
  setBreakpoints({ small: '0rem', large: '0rem' });
}

/**
 * Count `matchMedia` listener registrations opened while `during` runs.
 *
 * The prototype is patched rather than `window.matchMedia`, so the count covers
 * the `MediaQueryList` objects the service built earlier and kept — and a
 * service that was already listening added its listeners before the window, so
 * it is not counted. What this measures is precisely "did something start the
 * breakpoint service here".
 */
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

/**
 * Reads its option, and asks to hear nothing.
 *
 * Nothing here declares an option responsive, because nothing can: every
 * declared option is, and the markup is the only opt-in there is.
 */
class Label extends Base<{ $options: { label: string } }> {
  static config = {
    name: 'Label',
    options: { label: { type: String, default: 'base' } },
  };
}

/** Declares the effect, so it is told when the resolved value changes. */
class Grid extends Base<{ $options: { columns: number; gap: number } }> {
  static config = {
    name: 'Grid',
    options: {
      columns: { type: Number, default: 1 },
      // Written unsuffixed only: the same batch must leave it alone.
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

/** The shorthand declaration — the one that cannot carry a flag at all. */
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

    // Nothing is scoped to `small`, so the base answers — the cascade only ever
    // looks *down* from the active name.
    expect(label.$options.label).toBe('base');

    atLarge();
    expect(label.$options.label).toBe('wide');
  });

  it('falls back to the declared default when no attribute matches at all', async () => {
    atLarge();
    const root = render('<p data-component="Label"></p>');
    await settle();

    // Absent everywhere is absent: the option's own default, not an empty
    // string, exactly as a plain option behaves.
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

    // No attribute is written and no value is stored: the getter consults the
    // viewport, so `$options` stays the read-only view it is everywhere else.
    const added = await countMediaListeners(async () => {
      atLarge();
      await settle();
    });
    expect(label.$options.label).toBe('wide');
    // `Label` declares no `optionLabelChanged()`, so it asked to be told
    // nothing and holds no listener. The value still followed the viewport.
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
      // Warm the memoised breakpoint name hard: within one task these must be
      // one `matches` sweep, and the answer must still be the true one.
      for (let index = 0; index < 5; index += 1) {
        expect(label.$options.label).toBe('narrow');
      }

      // The crossing happens in the same task as the reads that primed the
      // cache. A boundary invalidation alone would not have covered this, which
      // is why `setBreakpoints()` drops the resolved name itself.
      atLarge();
      expect(label.$options.label).toBe('wide');

      // And again after the boundary the memo does use, from a fresh task.
      await settle();
      expect(label.$options.label).toBe('wide');
      atSmall();
      expect(label.$options.label).toBe('narrow');
    });

    // Memoising a read must not have turned a read into a subscription.
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

    // The same channel a rewritten attribute uses, with the same payload — the
    // component never learns which of the two moved.
    expect(grid.changes).toHaveLength(2);
    expect(grid.changes[1]).toMatchObject({
      name: 'columns',
      value: 4,
      previousValue: 1,
      rawValue: '4',
      previousRawValue: '1',
      initial: false,
    });
    // The previous effect's cleanup ran before the new value was applied.
    expect(grid.cleanups).toBe(1);
    expect(grid.$options.columns).toBe(4);
  });

  it('says nothing when a crossing leaves the resolved value alone', async () => {
    atSmall();
    // Only a base value, so every breakpoint resolves to it.
    const root = render('<div data-component="Grid" data-option-columns="2"></div>');
    await settle();
    const grid = getInstance<Grid>(root.firstElementChild, 'Grid');
    expect(grid.changes).toHaveLength(1);

    atLarge();
    atSmall();

    // A crossing is not a change; a change of the *resolved* value is.
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

    // The one page-wide observer filters on exact names, so this only arrives
    // because the breakpoint-scoped spellings were registered with it.
    grid.$el.setAttribute('data-option-columns:large', '6');
    await settle();
    expect(grid.changes).toHaveLength(1);
    expect(grid.changes[0]).toMatchObject({ value: 6, previousValue: 4 });

    // A spelling the cascade is not currently selecting is not a change to the
    // option: the resolved value never moved.
    grid.$el.setAttribute('data-option-columns:small', '3');
    await settle();
    expect(grid.changes).toHaveLength(1);

    // Removing the winner falls back down the cascade, and that *is* a change.
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
    // `gap` is as responsive as `columns` — it simply has nothing scoped, so
    // the cascade falls to its base attribute at every breakpoint.
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

    // `options: { theme: String }` — a declaration with nowhere to put a flag.
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

    // The scoped names entered the one observer's filter because the option
    // exists, not because anything declared or wrote them — so a scoped
    // attribute added at runtime is reported, which no opt-in could have
    // arranged after the fact.
    banner.$el.setAttribute('data-option-theme:small', 'dark');
    await settle();
    expect(banner.changes).toHaveLength(1);
    expect(banner.changes[0]).toMatchObject({ value: 'dark', previousValue: 'light' });
  });

  it('holds its `matchMedia` listener for the mount cycle, and no longer', async () => {
    atSmall();
    const root = render(
      `<div data-component="Grid"
            data-option-columns="1"
            data-option-columns:large="4"></div>`,
    );

    // Mounting the component is what starts the service: the listeners are
    // opened here, not by the module, and not by reading an option.
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
    // Destroy released the subscription, so the service is free to stop with
    // its last subscriber — reference counting does the rest.
    expect(grid.changes).toHaveLength(2);

    // And a remount subscribes again, like every other per-cycle subscription.
    root.append(grid.$el);
    await settle();
    expect(grid.$isMounted).toBe(true);
    grid.changes = [];
    atSmall();
    expect(grid.changes).toHaveLength(1);
  });

  it('reports a suffix that names no breakpoint, which is what v3 markup is', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    atSmall();
    render(
      // v3 spelled a *set* of breakpoints here. It parses as one name, which is
      // in no set, so the attribute would silently never be read.
      `<p data-component="Label" data-option-label:small:large="both"></p>`,
    );
    await settle();

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('`data-option-label:small:large` names no breakpoint'),
    );
    warn.mockRestore();
  });
});
