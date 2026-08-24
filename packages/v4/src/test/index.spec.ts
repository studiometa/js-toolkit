import { afterEach, describe, expect, it, vi } from 'vitest';
import * as subpath from '@studiometa/js-toolkit-v4/test';
import { Base } from '../Base.js';
import { warn } from '../diagnostics.js';
import { getInstances } from '../instances.js';
import { registerComponent, registerComponents, registerManifest } from '../registry.js';
import { defaultScheduler } from '../scheduler.js';
import {
  captureDiagnostics,
  frames,
  mount,
  recordEvents,
  resetDom,
  resetRegistry,
  settle,
  waitFor,
} from './index.js';

/**
 * The subject writes from a scheduled task rather than from `mounted()`
 * directly: what `mount()` has to guarantee is not "the hook ran" but "the
 * writes the hook queued have landed".
 */
class Subject extends Base {
  static config = { name: 'TestHelpersSubject' };

  mountedCalls = 0;

  mounted(): void {
    this.mountedCalls += 1;
    defaultScheduler.write(() => {
      this.$el.textContent = 'written';
    });
  }
}

/** Emits on demand and on a scheduled write, to cover both delivery timings. */
class Emitter extends Base<{ $emits: { ping: { count: number }; pong: void } }> {
  static config = { name: 'TestHelpersEmitter' };

  ping(count: number): void {
    this.$emit('ping', { count });
  }

  pingLater(count: number): void {
    defaultScheduler.write(() => {
      this.$emit('ping', { count });
      this.$emit('pong');
    });
  }
}

registerComponents(Subject, Emitter);

afterEach(resetDom);
// Restored here rather than inline: `mockRestore()` also clears the call
// history, so a spy restored before its own assertion always looks unused.
afterEach(() => {
  vi.restoreAllMocks();
});

/** Silence the default console sink, to prove the channel replaces it. */
function silenceSink() {
  return vi.spyOn(console, 'warn').mockImplementation(() => {});
}

describe('the /test subpath', () => {
  it('serves these eight helpers under the package name, and nothing else', () => {
    expect(Object.keys(subpath).sort()).toEqual([
      'captureDiagnostics',
      'frames',
      'mount',
      'recordEvents',
      'resetDom',
      'resetRegistry',
      'settle',
      'waitFor',
    ]);
    expect(subpath.mount).toBe(mount);
    expect(subpath.settle).toBe(settle);
    expect(subpath.frames).toBe(frames);
    expect(subpath.waitFor).toBe(waitFor);
    expect(subpath.resetDom).toBe(resetDom);
    expect(subpath.captureDiagnostics).toBe(captureDiagnostics);
    expect(subpath.recordEvents).toBe(recordEvents);
    expect(subpath.resetRegistry).toBe(resetRegistry);
  });
});

describe('mount()', () => {
  it('returns a wrapper whose components are mounted and done writing', async () => {
    const root = await mount('<div data-component="TestHelpersSubject"></div>');

    expect(root.parentElement).toBe(document.body);
    expect(root.tagName).toBe('DIV');

    const [subject] = getInstances<Subject>('TestHelpersSubject', root);
    expect(subject.mountedCalls).toBe(1);
    expect(subject.$el).toBe(root.firstElementChild);
    expect(subject.$el.textContent).toBe('written');
  });

  it('keeps several siblings under the one wrapper', async () => {
    const root = await mount(
      '<div data-component="TestHelpersSubject"></div><div data-component="TestHelpersSubject"></div>',
    );

    expect(root.children).toHaveLength(2);
    expect(getInstances('TestHelpersSubject', root)).toHaveLength(2);
  });
});

describe('settle()', () => {
  it('drains work queued after the DOM was touched', async () => {
    const el = document.createElement('div');
    document.body.append(el);
    defaultScheduler.write(() => {
      el.textContent = 'late';
    });

    await settle();

    expect(el.textContent).toBe('late');
    expect(defaultScheduler.phase).toBe('idle');
  });
});

describe('frames()', () => {
  it('awaits the requested number of animation frames', async () => {
    let seen = 0;
    let running = true;
    const count = () => {
      if (!running) return;
      seen += 1;
      requestAnimationFrame(count);
    };
    requestAnimationFrame(count);

    await frames(3);
    running = false;

    expect(seen).toBeGreaterThanOrEqual(3);
  });
});

describe('waitFor()', () => {
  it('returns the truthy value the predicate produced', async () => {
    const root = await mount('<div id="host"></div>');
    const host = root.querySelector('#host') as HTMLElement;
    setTimeout(() => {
      host.innerHTML = '<p class="panel">late</p>';
    }, 30);

    const panel = await waitFor(() => root.querySelector('.panel'));

    expect(panel).toBeInstanceOf(HTMLParagraphElement);
    expect(panel.textContent).toBe('late');
  });

  it('resolves immediately when the predicate is already true', async () => {
    const el = document.createElement('div');
    el.classList.add('is-open');

    await expect(waitFor(() => el.classList.contains('is-open'))).resolves.toBe(true);
  });

  it('waits for a class added a few frames later', async () => {
    const el = document.createElement('div');
    document.body.append(el);
    void frames(3).then(() => el.classList.add('is-open'));

    await expect(waitFor(() => el.classList.contains('is-open'))).resolves.toBe(true);
  });

  it('throws a message naming the timeout when the predicate never turns true', async () => {
    await expect(waitFor(() => false, { timeout: 50 })).rejects.toThrow(
      'waitFor: the predicate never returned a truthy value within 50ms.',
    );
  });

  it('throws the given message instead of the default', async () => {
    await expect(
      waitFor(() => null, { timeout: 50, message: '"is-open" never landed on the panel' }),
    ).rejects.toThrow('"is-open" never landed on the panel');
  });

  it('polls for at least the whole timeout before giving up', async () => {
    const start = Date.now();
    await expect(waitFor(() => undefined, { timeout: 100 })).rejects.toThrow();

    expect(Date.now() - start).toBeGreaterThanOrEqual(100);
  });

  it('treats every falsy value as "not yet"', async () => {
    const values: Array<string | number | false | null | undefined> = [
      false,
      null,
      undefined,
      0,
      '',
      'done',
    ];
    let index = 0;

    await expect(waitFor(() => values[index++])).resolves.toBe('done');
    expect(index).toBe(values.length);
  });
});

describe('resetDom()', () => {
  it('empties the body and unmounts what was in it', async () => {
    const root = await mount('<div data-component="TestHelpersSubject"></div>');
    expect(getInstances('TestHelpersSubject', root)).toHaveLength(1);

    await resetDom();

    expect(document.body.innerHTML).toBe('');
    expect(getInstances('TestHelpersSubject')).toEqual([]);
  });
});

describe('captureDiagnostics()', () => {
  it('collects what the framework reported, and keeps the console quiet', () => {
    // Spied only to prove the sink never ran; the assertion is on the channel.
    const sink = silenceSink();
    const log = captureDiagnostics();

    // A second class under a name already taken is a reported conflict.
    registerComponent(
      class extends Base {
        static config = { name: 'TestHelpersSubject' };
      },
    );

    log.stop();

    expect(log.codes).toEqual(['registry.conflict']);
    expect(log.entries[0]).toMatchObject({
      severity: 'warning',
      code: 'registry.conflict',
      component: 'TestHelpersSubject',
    });
    expect(log.entries[0].message).toContain('TestHelpersSubject');
    expect(sink).not.toHaveBeenCalled();
  });

  it('scopes to the target it was given', async () => {
    const sink = silenceSink();
    const root = await mount('<div id="inside"></div><div id="outside"></div>');
    const inside = root.querySelector('#inside') as HTMLElement;
    const outside = root.querySelector('#outside') as HTMLElement;
    const log = captureDiagnostics(inside);

    warn('ref.mismatch', 'reported on the watched element', { target: inside });
    warn('ref.mismatch', 'reported elsewhere', { target: outside });

    log.stop();

    expect(log.entries.map((entry) => entry.message)).toEqual(['reported on the watched element']);
    // The one it did not watch reached its own default sink.
    expect(sink).toHaveBeenCalledTimes(1);
  });

  it('stops collecting, and lets the sink run again, once stopped', () => {
    const sink = silenceSink();
    const log = captureDiagnostics();
    log.stop();

    warn('ref.mismatch', 'after stop');

    expect(log.codes).toEqual([]);
    expect(sink).toHaveBeenCalledTimes(1);
  });
});

describe('recordEvents()', () => {
  it("captures a component's emit, with its detail", async () => {
    const root = await mount('<div data-component="TestHelpersEmitter"></div>');
    const [emitter] = getInstances<Emitter>('TestHelpersEmitter', root);
    const log = recordEvents(root, 'ping');

    emitter.ping(2);
    emitter.ping(3);
    log.stop();

    expect(log.events).toEqual([
      { type: 'ping', detail: { count: 2 } },
      { type: 'ping', detail: { count: 3 } },
    ]);
  });

  it('keeps several types in one array, in delivery order', async () => {
    const root = await mount('<div data-component="TestHelpersEmitter"></div>');
    const [emitter] = getInstances<Emitter>('TestHelpersEmitter', root);
    const log = recordEvents(root, 'ping', 'pong');

    emitter.pingLater(1);
    await waitFor(() => log.events.length === 2);
    log.stop();

    expect(log.events).toEqual([
      { type: 'ping', detail: { count: 1 } },
      { type: 'pong', detail: null },
    ]);
  });

  it('ignores a type it was not asked for, and stops when stopped', async () => {
    const root = await mount('<div data-component="TestHelpersEmitter"></div>');
    const [emitter] = getInstances<Emitter>('TestHelpersEmitter', root);
    const log = recordEvents(root, 'ping');

    emitter.$emit('pong');
    emitter.ping(1);
    log.stop();
    emitter.ping(2);

    expect(log.events).toEqual([{ type: 'ping', detail: { count: 1 } }]);
  });
});

describe('resetRegistry()', () => {
  /**
   * These cases empty the page-wide registry, which the two components at the
   * top of this file live in. Restoring them is the documented pattern: the
   * reset, then the registrations still needed — never a bare reset in an
   * `afterEach`, which would unregister them for every later test.
   */
  afterEach(async () => {
    await resetDom();
    resetRegistry();
    registerComponents(Subject, Emitter);
  });

  it('frees a name that would otherwise report a conflict', async () => {
    const first = class extends Base {
      static config = { name: 'TestHelpersRecycled' };
    };
    const second = class extends Base {
      static config = { name: 'TestHelpersRecycled' };
    };
    const log = captureDiagnostics();

    registerComponent(first);
    await resetDom();
    resetRegistry();
    registerComponent(second);

    log.stop();
    expect(log.codes).toEqual([]);

    const root = await mount('<div data-component="TestHelpersRecycled"></div>');
    const [instance] = getInstances('TestHelpersRecycled', root);
    expect(instance).toBeInstanceOf(second);
  });

  it('is what avoids that conflict — without it the second name is taken', async () => {
    silenceSink();
    const log = captureDiagnostics();

    registerComponent(
      class extends Base {
        static config = { name: 'TestHelpersContested' };
      },
    );
    await resetDom();
    registerComponent(
      class extends Base {
        static config = { name: 'TestHelpersContested' };
      },
    );

    log.stop();

    expect(log.codes).toEqual(['registry.conflict']);
  });

  it('stops a component registered earlier from mounting again', async () => {
    registerComponent(
      class extends Base {
        static config = { name: 'TestHelpersRetired' };
      },
    );
    const before = await mount('<div data-component="TestHelpersRetired"></div>');
    expect(getInstances('TestHelpersRetired', before)).toHaveLength(1);

    await resetDom();
    resetRegistry();

    const after = await mount('<div data-component="TestHelpersRetired"></div>');
    expect(getInstances('TestHelpersRetired', after)).toEqual([]);
  });

  it('drops a lazy manifest entry too, without importing it', async () => {
    const load = vi.fn(() => Promise.resolve(Subject));
    registerManifest({ TestHelpersLazy: load });

    resetRegistry();
    await mount('<div data-component="TestHelpersLazy"></div>');

    expect(load).not.toHaveBeenCalled();
  });
});
