import { afterEach, describe, expect, it } from 'vitest';
import { Base } from './Base.js';
import { Signal, createContext, provideContext } from './context.js';
import { registerComponent } from './registry.js';
import { renderTodoList, resetDom, settle } from './test-utils.js';

afterEach(resetDom);

describe('Signal', () => {
  it('notifies subscribers on change only', () => {
    const signal = new Signal(1);
    const seen: number[] = [];
    signal.subscribe((value) => seen.push(value), { immediate: true });

    signal.value = 1; // same value, no notification
    signal.value = 2;
    expect(seen).toEqual([1, 2]);
  });

  it('stops notifying after unsubscribe', () => {
    const signal = new Signal('a');
    const seen: string[] = [];
    const unsubscribe = signal.subscribe((value) => seen.push(value));

    signal.value = 'b';
    unsubscribe();
    signal.value = 'c';
    expect(seen).toEqual(['b']);
  });
});

describe('provide/inject', () => {
  it('resolves for a consumer that mounts before its provider', async () => {
    const Key = createContext<string>('late-provider');
    const received: string[] = [];

    class LateConsumer extends Base {
      static config = { name: 'LateConsumer' };
      async mounted() {
        const signal = await this.$inject(Key);
        received.push(signal.value);
      }
    }
    registerComponent(LateConsumer);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<span data-component="LateConsumer"></span>';
    document.body.append(wrapper);
    await settle();
    expect(received).toEqual([]);

    // The provider appears later, higher in the tree.
    provideContext(wrapper, Key, new Signal('hello'));
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
    await expect(promise).resolves.toHaveProperty('value', 'inner');
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
    injectContext(consumer, Wanted).promise.then((signal) => {
      resolved = signal.value;
    });
    await settle();
    expect(resolved).toBeUndefined();

    provideContext(host, Wanted, 'yes');
    await settle();
    expect(resolved).toBe('yes');
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
