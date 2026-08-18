import { afterEach, describe, expect, it, vi } from 'vitest';
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
import { DIAGNOSTICS, type ToolkitDiagnosticDetail } from './diagnostic-contract.js';
import { EVENTS } from './events.js';
import { registerComponent } from './registry.js';
import { getInstance, renderTodoList, resetDom, settle } from './test-utils.js';

afterEach(resetDom);

describe('Signal', () => {
  it('notifies subscribers on change only', () => {
    const count = signal(1);
    const seen: number[] = [];
    count.subscribe((value) => seen.push(value), { immediate: true });

    count.value = 1;
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

  it('returns a usable unsubscribe after an immediate subscriber failure', () => {
    const cell = signal(0);
    const failure = new Error('immediate signal failure');
    const diagnostics: ToolkitDiagnosticDetail[] = [];
    document.addEventListener(
      EVENTS.diagnostic,
      (event) => {
        event.preventDefault();
        diagnostics.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
      },
      { once: true },
    );

    const unsubscribe = cell.subscribe(
      () => {
        throw failure;
      },
      { immediate: true },
    );
    unsubscribe();
    const seen: number[] = [];
    cell.subscribe((value) => seen.push(value));
    cell.value = 1;

    expect(seen).toEqual([1]);
    expect(diagnostics).toEqual([
      {
        severity: 'error',
        code: DIAGNOSTICS.callback.signalFailed,
        message: 'An immediate signal subscriber failed.',
        error: failure,
      },
    ]);
  });

  it('isolates update failures without staling a reentrant delivery round', () => {
    const cell = signal(0);
    const failure = new Error('signal update failure');
    const diagnostics: ToolkitDiagnosticDetail[] = [];
    const listener = (event: Event) => {
      event.preventDefault();
      diagnostics.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
    };
    document.addEventListener(EVENTS.diagnostic, listener);
    const broken: number[] = [];
    const later: number[] = [];
    cell.subscribe((value) => {
      broken.push(value);
      throw failure;
    });
    cell.subscribe((value) => {
      if (value === 1) cell.value = 2;
    });
    cell.subscribe((value) => later.push(value));

    cell.value = 1;
    document.removeEventListener(EVENTS.diagnostic, listener);

    expect(cell.value).toBe(2);
    expect(broken).toEqual([1, 2]);
    expect(later).toEqual([2]);
    expect(diagnostics).toHaveLength(2);
    expect(diagnostics.every(({ code }) => code === DIAGNOSTICS.callback.signalFailed)).toBe(true);
    expect(
      diagnostics.every((detail) => detail.severity === 'error' && detail.error === failure),
    ).toBe(true);
  });

  describe('settling', () => {
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

      for (const prefix of ['first', 'writer', 'last']) {
        const last = seen.filter((entry) => entry.startsWith(`${prefix}:`)).at(-1);
        expect(last).toBe(`${prefix}:inner`);
      }
      expect(seen).not.toContain('last:outer');
      expect(cell.value).toBe('inner');
    });

    it('delivers each subscriber once per surviving value', () => {
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
      expect(seen).toEqual([]);

      cell.value = 2;
      expect(seen).toEqual([2]);
    });
  });
});

describe('provide/inject', () => {
  it('uses the private namespaced context transport', () => {
    const key = createContext<string>('transport');
    const host = document.createElement('div');
    const consumer = document.createElement('span');
    host.append(consumer);
    document.body.append(host);
    provideContext(host, key, 'provided');

    const namespaced: Event[] = [];
    const legacy: Event[] = [];
    const onNamespaced = (event: Event) => namespaced.push(event);
    const onLegacy = (event: Event) => legacy.push(event);
    document.addEventListener('js-toolkit:context:request', onNamespaced, { capture: true });
    document.addEventListener('context-request', onLegacy, { capture: true });
    try {
      expect(injectContextSync(consumer, key)).toBe('provided');
    } finally {
      document.removeEventListener('js-toolkit:context:request', onNamespaced, { capture: true });
      document.removeEventListener('context-request', onLegacy, { capture: true });
    }

    expect(namespaced).toHaveLength(1);
    expect(namespaced[0]).toMatchObject({ bubbles: true, cancelable: false });
    expect(legacy).toHaveLength(0);
  });

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

  it('cancels a one-shot request before its first answer', async () => {
    const Key = createContext<string>('cancel-before-answer');
    const host = document.createElement('div');
    const consumer = document.createElement('span');
    host.append(consumer);
    document.body.append(host);

    let resolved = false;
    const { promise, cancel } = injectContext(consumer, Key);
    promise.then(() => {
      resolved = true;
    });
    cancel();
    provideContext(host, Key, 'late');
    await settle();

    expect(resolved).toBe(false);
  });

  it('keeps injectContext and Base.$inject one-shot without an options path', async () => {
    const Key = createContext<string>('one-shot-api');
    const host = document.createElement('div');
    const el = document.createElement('span');
    host.append(el);
    document.body.append(host);
    provideContext(host, Key, 'provided');

    class Consumer extends Base {
      static config = { name: 'OneShotApiConsumer' };
    }
    const consumer = new Consumer(el).$mount();
    const onProvide = vi.fn();
    const runtimeInject = consumer.$inject as unknown as (
      key: typeof Key,
      options: { subscribe: boolean; onProvide: (value: string) => void },
    ) => Promise<string>;

    expect(consumer.$inject).toHaveLength(1);
    await expect(runtimeInject.call(consumer, Key, { subscribe: true, onProvide })).resolves.toBe(
      'provided',
    );
    expect(onProvide).not.toHaveBeenCalled();

    const removedOptionsTypeAssertions = () => {
      // @ts-expect-error injectContext has no subscription options.
      injectContext(el, Key, { subscribe: true, onProvide: (_value: string) => {} });
      // @ts-expect-error Base.$inject has no subscription options.
      consumer.$inject(Key, { subscribe: true, onProvide: (_value: string) => {} });
    };
    void removedOptionsTypeAssertions;
    consumer.$destroy();
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
    const { dispose } = provideContext(host, Key, 'late');
    await settle();
    expect(received).toEqual([]);

    consumer.$mount();
    await settle();
    expect(received).toEqual(['late']);

    consumer.$destroy();
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

    expect(injectContextSync(el, key)).toBe('page');
  });

  it('is still beaten by a nearer provider', () => {
    const key = createContext<string>('root');
    provideRootContext(key, () => 'page');
    const scope = render('<span></span>');
    provideContext(scope, key, 'scoped');
    const el = scope.querySelector('span') as Element;

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

    const { promise } = injectContext(el, key);
    provideRootContext(key, () => 'late');

    await expect(promise).resolves.toBe('late');
  });

  it('binds peers by name with or without a scope — the DataBind shape', () => {
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

    expect(channelFor(at('bare-a'), 'email')).toBe(channelFor(at('bare-b'), 'email'));
    expect(channelFor(at('scoped-a'), 'email')).toBe(channelFor(at('scoped-b'), 'email'));
    expect(channelFor(at('scoped-a'), 'email')).not.toBe(channelFor(at('bare-a'), 'email'));
    expect(channelFor(at('bare-a'), 'name')).not.toBe(channelFor(at('bare-a'), 'email'));

    const seen: string[] = [];
    channelFor(at('bare-b'), 'email').subscribe((value) => seen.push(value));
    channelFor(at('bare-a'), 'email').value = 'a@b.c';
    expect(seen).toEqual(['a@b.c']);
  });
});
