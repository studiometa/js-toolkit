import { afterEach, describe, expect, it } from 'vitest';
import { Base } from './Base.js';
import {
  createContext,
  injectContext,
  injectContextSync,
  provideContext,
  provideRootContext,
  signal,
  type Signal,
} from './context.js';
import { registerComponent } from './registry.js';
import { getInstance, renderTodoList, resetDom, settle } from './test-utils.js';

afterEach(resetDom);

describe('Signal', () => {
  it('notifies subscribers on change only', () => {
    const count = signal(1);
    const seen: number[] = [];
    count.subscribe((value) => seen.push(value), { immediate: true });

    count.value = 1; // same value, no notification
    count.value = 2;
    expect(seen).toEqual([1, 2]);
  });

  it('stops notifying after unsubscribe', () => {
    const letter = signal('a');
    const seen: string[] = [];
    const unsubscribe = letter.subscribe((value) => seen.push(value));

    letter.value = 'b';
    unsubscribe();
    letter.value = 'c';
    expect(seen).toEqual(['b']);
  });

  it('gives each holder of one callback its own delivery and unsubscribe', () => {
    // A `Set` keyed by the callback collapsed these into a single entry: the
    // second holder was never called, and the first unsubscribe tore the
    // subscription out from under it.
    const cell = signal(0);
    let calls = 0;
    const callback = () => {
      calls += 1;
    };
    const first = cell.subscribe(callback);
    cell.subscribe(callback);

    cell.value = 1;
    expect(calls).toBe(2);

    first();
    cell.value = 2;
    expect(calls).toBe(3);
  });

  describe('settling', () => {
    // The oracle is the hazard behind @studiometa/ui's
    // `DataBind.spec.ts` — "should preserve the latest value during reentrant
    // group updates". A member republishes from inside its own delivery, and
    // every peer must end up having last seen the newest frame. The naive
    // fan-out resumed its walk on the frame it started on, so the peer sitting
    // after the writer was handed a stale value *after* the newer one, and
    // last-write-wins silently became last-listener-wins.
    it('leaves every subscriber having last seen the newest value', () => {
      const cell = signal('initial');
      const seen: string[] = [];
      let hasWritten = false;

      cell.subscribe((value) => seen.push(`first:${value}`));
      cell.subscribe((value) => {
        seen.push(`writer:${value}`);
        if (value === 'outer' && !hasWritten) {
          hasWritten = true;
          cell.value = 'inner';
        }
      });
      cell.subscribe((value) => seen.push(`last:${value}`));

      cell.value = 'outer';

      // Nobody is left on the superseded frame.
      for (const prefix of ['first', 'writer', 'last']) {
        const last = seen.filter((entry) => entry.startsWith(`${prefix}:`)).at(-1);
        expect(last).toBe(`${prefix}:inner`);
      }
      // `last` never sees the superseded frame at all: it had not been reached
      // when the write landed, so the round was abandoned instead of finished.
      expect(seen).not.toContain('last:outer');
      // And the value a reader sees is the newest one.
      expect(cell.value).toBe('inner');
    });

    it('delivers each subscriber once per surviving value', () => {
      // Five deliveries, not six: `first` and `writer` are reached on the
      // abandoned `outer` round and again on `inner` because each genuinely has
      // a newer value to see, while `last` is reached only once. The eager
      // fan-out ran six times and ended on the stale frame.
      const cell = signal('initial');
      const seen: string[] = [];
      let hasWritten = false;

      cell.subscribe((value) => seen.push(`first:${value}`));
      cell.subscribe((value) => {
        seen.push(`writer:${value}`);
        if (value === 'outer' && !hasWritten) {
          hasWritten = true;
          cell.value = 'inner';
        }
      });
      cell.subscribe((value) => seen.push(`last:${value}`));

      cell.value = 'outer';

      expect(seen).toEqual([
        'first:outer',
        'writer:outer',
        'first:inner',
        'writer:inner',
        'last:inner',
      ]);
    });

    it('settles synchronously, before the setter returns', () => {
      const cell = signal(0);
      const seen: number[] = [];
      cell.subscribe((value) => seen.push(value));

      cell.value = 1;
      // No microtask hop: a form-control echo must land in the same task.
      expect(seen).toEqual([1]);
    });

    it('collapses a run of writes into the value that survives', () => {
      const cell = signal(0);
      const seen: number[] = [];
      let hasWritten = false;

      cell.subscribe((value) => {
        seen.push(value);
        if (!hasWritten) {
          hasWritten = true;
          cell.value = 2;
          cell.value = 3;
        }
      });

      cell.value = 1;
      expect(seen).toEqual([1, 3]);
      expect(cell.value).toBe(3);
    });

    it('skips a subscriber removed during delivery', () => {
      const cell = signal(0);
      const seen: string[] = [];
      let unsubscribeLater = () => {};

      cell.subscribe(() => unsubscribeLater());
      unsubscribeLater = cell.subscribe((value) => seen.push(`later:${value}`));

      cell.value = 1;
      expect(seen).toEqual([]);
    });

    it('does not deliver a value that predates a subscriber added during delivery', () => {
      const cell = signal(0);
      const seen: number[] = [];
      let hasSubscribed = false;

      cell.subscribe(() => {
        if (!hasSubscribed) {
          hasSubscribed = true;
          cell.subscribe((value) => seen.push(value));
        }
      });

      cell.value = 1;
      // The newcomer is not handed the frame that was in flight before it
      // existed, and no later value has been written.
      expect(seen).toEqual([]);

      cell.value = 2;
      expect(seen).toEqual([2]);
    });
  });
});

describe('provide/inject', () => {
  it('resolves for a consumer that mounts before its provider', async () => {
    const Key = createContext<Signal<string>>('late-provider');
    const received: string[] = [];

    class LateConsumer extends Base {
      static config = { name: 'LateConsumer' };
      async mounted() {
        const greeting = await this.$inject(Key);
        received.push(greeting.value);
      }
    }
    registerComponent(LateConsumer);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<span data-component="LateConsumer"></span>';
    document.body.append(wrapper);
    await settle();
    expect(received).toEqual([]);

    // The provider appears later, higher in the tree.
    provideContext(wrapper, Key, signal('hello'));
    await settle();
    expect(received).toEqual(['hello']);
  });

  it('lets the nearest provider shadow an outer one', async () => {
    const Key = createContext<string>('shadowing');
    const outer = document.createElement('div');
    const inner = document.createElement('div');
    const consumer = document.createElement('span');
    inner.append(consumer);
    outer.append(inner);
    document.body.append(outer);

    provideContext(outer, Key, 'outer');
    provideContext(inner, Key, 'inner');

    const { promise } = await import('./context.js').then(({ injectContext }) =>
      injectContext(consumer, Key),
    );
    await expect(promise).resolves.toBe('inner');
  });

  it('ignores requests for another key', async () => {
    const Wanted = createContext<string>('wanted');
    const Other = createContext<string>('other');
    const host = document.createElement('div');
    const consumer = document.createElement('span');
    host.append(consumer);
    document.body.append(host);

    provideContext(host, Other, 'nope');

    const { injectContext } = await import('./context.js');
    let resolved: unknown;
    injectContext(consumer, Wanted).promise.then((value) => {
      resolved = value;
    });
    await settle();
    expect(resolved).toBeUndefined();

    provideContext(host, Wanted, 'yes');
    await settle();
    expect(resolved).toBe('yes');
  });

  it('provides the value verbatim, wrapping nothing', async () => {
    const Key = createContext<{ label: string }>('verbatim');
    const host = document.createElement('div');
    const consumer = document.createElement('span');
    host.append(consumer);
    document.body.append(host);

    const provided = { label: 'exposed' };
    const { value } = provideContext(host, Key, provided);
    expect(value).toBe(provided);

    const { injectContext } = await import('./context.js');
    await expect(injectContext(consumer, Key).promise).resolves.toBe(provided);
  });

  it('exposes an owner surface a consumer calls without $closest', async () => {
    interface CounterApi {
      state: Signal<number>;
      increment(): void;
    }
    const Key = createContext<CounterApi>('counter-api');

    class Counter extends Base {
      static config = { name: 'Counter' };

      value = 0;

      api = this.$provide<CounterApi>(Key, {
        state: signal(0),
        increment: () => {
          this.value += 1;
          this.api.state.value = this.value;
        },
      });
    }

    class CounterBtn extends Base {
      static config = { name: 'CounterBtn' };

      seen: number[] = [];

      async mounted() {
        const { state } = await this.$inject(Key);
        return state.subscribe((value) => this.seen.push(value));
      }

      // No `$closest('Counter')`, no reach-back into the coordinator: the
      // command is part of the surface it exposed.
      onClick(): void {
        this.$injectSync(Key)?.increment();
      }
    }

    registerComponent(Counter);
    registerComponent(CounterBtn);

    const root = document.createElement('div');
    root.setAttribute('data-component', 'Counter');
    root.innerHTML = '<button data-component="CounterBtn">+</button>';
    document.body.append(root);
    await settle();

    const counter = getInstance<Counter>(root, 'Counter');
    const button = root.querySelector('button');
    const control = getInstance<CounterBtn>(button, 'CounterBtn');

    button?.click();
    button?.click();
    await settle();

    expect(counter.value).toBe(2);
    expect(control.seen).toEqual([1, 2]);
  });

  it('answers $injectSync now, or not at all', async () => {
    const Key = createContext<string>('sync');

    class Consumer extends Base {
      static config = { name: 'SyncConsumer' };
    }

    const host = document.createElement('div');
    const el = document.createElement('span');
    host.append(el);
    document.body.append(host);
    const consumer = new Consumer(el).$mount();

    // No provider: the control is told so instead of waiting forever.
    expect(consumer.$injectSync(Key)).toBeUndefined();

    provideContext(host, Key, 'ready');
    expect(consumer.$injectSync(Key)).toBe('ready');
  });

  it('leaves no pending request behind when the consumer is destroyed', async () => {
    const Key = createContext<string>('destroyed-consumer');
    const received: string[] = [];

    class Waiting extends Base {
      static config = { name: 'Waiting' };

      async mounted() {
        received.push(await this.$inject(Key));
      }
    }

    const host = document.createElement('div');
    const el = document.createElement('span');
    host.append(el);
    document.body.append(host);

    const consumer = new Waiting(el).$mount();
    await settle();
    expect(received).toEqual([]);

    consumer.$destroy();
    // The provider appears after the destroy: a request left in the module's
    // pending set would be replayed here and resolve.
    const { dispose } = provideContext(host, Key, 'late');
    await settle();
    expect(received).toEqual([]);

    // And the scope is right: `mounted()` runs again on remount, so the
    // injection happens again with nothing to re-declare.
    consumer.$mount();
    await settle();
    expect(received).toEqual(['late']);

    consumer.$terminate();
    dispose();
  });

  it('feeds a component through the provided signal', async () => {
    const root = renderTodoList();
    await settle();

    const countEl = root.querySelector('[data-component="TodoCount"]');
    expect(countEl?.textContent).toBe('2');

    root.querySelector<HTMLElement>('[data-ref="remove"]')?.click();
    await settle();
    expect(countEl?.textContent).toBe('1');
  });
});

describe('provideRootContext', () => {
  function render(html: string): HTMLElement {
    const el = document.createElement('div');
    el.innerHTML = html;
    document.body.append(el);
    return el;
  }

  it('reaches a consumer with no provider above it', () => {
    const key = createContext<string>('root');
    provideRootContext(key, () => 'page');
    const el = render('<span></span>').querySelector('span') as Element;

    // The case provide/inject could not express: nothing to name as an
    // ancestor, so v3 answered it with a separate global registry.
    expect(injectContextSync(el, key)).toBe('page');
  });

  it('is still beaten by a nearer provider', () => {
    const key = createContext<string>('root');
    provideRootContext(key, () => 'page');
    const scope = render('<span></span>');
    provideContext(scope, key, 'scoped');
    const el = scope.querySelector('span') as Element;

    // The whole point of option 2: page-wide is the outermost scope of the
    // mechanism that already exists, not a second one with its own rules.
    expect(injectContextSync(el, key)).toBe('scoped');
  });

  it('creates the value once, so peers join rather than compete', () => {
    const key = createContext<{ id: number }>('root');
    let created = 0;
    const first = provideRootContext(key, () => ({ id: (created += 1) }));
    const second = provideRootContext(key, () => ({ id: (created += 1) }));

    expect(created).toBe(1);
    expect(second).toBe(first);
  });

  it('answers a consumer that asked before it existed', async () => {
    const key = createContext<string>('root');
    const el = render('<span></span>').querySelector('span') as Element;

    // Order independence has to hold for the root provider too: the consumer
    // is already waiting when the value is created.
    const { promise } = injectContext(el, key);
    provideRootContext(key, () => 'late');

    await expect(promise).resolves.toBe('late');
  });

  it('binds peers by name with or without a scope — the DataBind shape', () => {
    // The spike this was built for. A control publishes and reads a value on a
    // channel named by an option, sharing it with peers on the same name.
    // v3 resolved that through `withGroup`: a scoped registry when a `DataScope`
    // ancestor existed, a `globalThis` one when it did not.
    type Channels = Map<string, Signal<string>>;
    const DataChannels = createContext<Channels>('data-channels');

    const channelFor = (el: Element, name: string): Signal<string> => {
      const channels =
        injectContextSync(el, DataChannels) ??
        provideRootContext(DataChannels, () => new Map() as Channels);
      let channel = channels.get(name);
      if (!channel) {
        channel = signal('');
        channels.set(name, channel);
      }
      return channel;
    };

    const tree = render(`
      <p id="bare-a"></p>
      <p id="bare-b"></p>
      <div id="scope">
        <p id="scoped-a"></p>
        <p id="scoped-b"></p>
      </div>
    `);
    const at = (id: string) => tree.querySelector(`#${id}`) as Element;
    provideContext(at('scope'), DataChannels, new Map() as Channels);

    // Two bare peers, no ancestor anywhere: same name, same channel.
    expect(channelFor(at('bare-a'), 'email')).toBe(channelFor(at('bare-b'), 'email'));
    // Two scoped peers: same name, same channel, and *not* the page one.
    expect(channelFor(at('scoped-a'), 'email')).toBe(channelFor(at('scoped-b'), 'email'));
    expect(channelFor(at('scoped-a'), 'email')).not.toBe(channelFor(at('bare-a'), 'email'));
    // Different names never collide.
    expect(channelFor(at('bare-a'), 'name')).not.toBe(channelFor(at('bare-a'), 'email'));

    // And the value is live, which is what `withGroup`'s member set never was.
    const seen: string[] = [];
    channelFor(at('bare-b'), 'email').subscribe((value) => seen.push(value));
    channelFor(at('bare-a'), 'email').value = 'a@b.c';
    expect(seen).toEqual(['a@b.c']);
  });
});
