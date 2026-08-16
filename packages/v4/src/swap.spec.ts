import { afterEach, describe, expect, it } from 'vitest';
import { Base } from './Base.js';
import { INSTANCES } from './protocol-symbols.js';
import { registerComponent } from './registry.js';
import { SWAP_MODES, swap } from './swap.js';
import { resetDom } from './test-utils.js';

let counter = 0;

function uniqueName(prefix: string): string {
  counter += 1;
  return `${prefix}${counter}`;
}

function target(html = ''): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = html;
  document.body.append(el);
  return el;
}

function runCounter(): { key: string; get: () => number; markup: string } {
  counter += 1;
  const key = `__swapRuns${counter}__`;
  const scope = globalThis as unknown as Record<string, number>;
  scope[key] = 0;
  return {
    key,
    get: () => scope[key],
    markup: `<script>globalThis.${key} += 1;</script>`,
  };
}

afterEach(resetDom);

describe('swap — modes', () => {
  it('replaces the content while keeping the target element itself', async () => {
    const el = target('<p>old</p>');
    const before = el.firstElementChild;

    await swap(el, '<p>new</p><span>more</span>');

    expect(el.innerHTML).toBe('<p>new</p><span>more</span>');
    expect(el.isConnected).toBe(true);
    expect(before?.isConnected).toBe(false);
  });

  it('appends and prepends around the existing content', async () => {
    const appended = target('<p>a</p>');
    await swap(appended, '<p>b</p>', { mode: SWAP_MODES.APPEND });
    expect(appended.innerHTML).toBe('<p>a</p><p>b</p>');

    const prepended = target('<p>a</p>');
    await swap(prepended, '<p>b</p>', { mode: SWAP_MODES.PREPEND });
    expect(prepended.innerHTML).toBe('<p>b</p><p>a</p>');
  });

  it('parses markup in the target own parsing context', async () => {
    const table = document.createElement('table');
    const body = document.createElement('tbody');
    table.append(body);
    document.body.append(table);

    await swap(body, '<tr><td>cell</td></tr>');

    expect(body.querySelectorAll('tr')).toHaveLength(1);
    expect(body.textContent).toBe('cell');
  });

  it('takes the children of an element as the incoming content', async () => {
    const el = target('<p>old</p>');
    const incoming = document.createElement('div');
    incoming.innerHTML = '<p>new</p>';

    await swap(el, incoming);

    expect(el.innerHTML).toBe('<p>new</p>');
  });

  it('morphs in place, preserving the identity of matching elements', async () => {
    const el = target('<ul><li id="one">one <input id="field"></li><li id="two">two</li></ul>');
    const list = el.querySelector('ul');
    const one = el.querySelector('#one');
    const two = el.querySelector('#two');
    const field = el.querySelector<HTMLInputElement>('#field');
    field?.focus();

    await swap(
      el,
      '<ul><li id="one">ONE <input id="field"></li><li id="two">two</li><li id="three">three</li></ul>',
      { mode: SWAP_MODES.MORPH },
    );

    expect(el.querySelector('ul')).toBe(list);
    expect(el.querySelector('#one')).toBe(one);
    expect(el.querySelector('#two')).toBe(two);
    expect(el.querySelector('#field')).toBe(field);
    expect(document.activeElement).toBe(field);
    expect(one?.textContent).toContain('ONE');
    expect(el.querySelectorAll('li')).toHaveLength(3);
  });

  it('morphs the children too, so what the incoming markup omits is discarded', async () => {
    const el = target('<div id="host"></div>');
    const host = el.querySelector('#host');

    const extra = document.createElement('input');
    host?.append(extra);
    extra.value = 'typed';

    await swap(el, '<div id="host"><input></div>', { mode: SWAP_MODES.MORPH });

    expect(el.querySelector('#host')).toBe(host);
    expect(extra.isConnected).toBe(true);
    expect(extra.value).toBe('');

    await swap(el, '<div id="host"></div>', { mode: SWAP_MODES.MORPH });

    expect(el.querySelector('#host')).toBe(host);
    expect(extra.isConnected).toBe(false);
  });

  it('leaves the target own attributes alone when morphing', async () => {
    const el = target('<p>old</p>');
    el.setAttribute('id', 'kept');
    el.setAttribute('data-component', 'NotRegistered');

    const incoming = document.createElement('div');
    incoming.setAttribute('id', 'other');
    incoming.innerHTML = '<p>new</p>';

    await swap(el, incoming, { mode: SWAP_MODES.MORPH });

    expect(el.getAttribute('id')).toBe('kept');
    expect(el.getAttribute('data-component')).toBe('NotRegistered');
    expect(el.innerHTML).toBe('<p>new</p>');
  });
});

describe('swap — script adoption', () => {
  it('executes a script from the incoming markup exactly once', async () => {
    const runs = runCounter();
    const el = target();

    await swap(el, `<p>content</p>${runs.markup}`);

    expect(runs.get()).toBe(1);
  });

  it('does not execute a script left inert by the parser without adoption', () => {
    const runs = runCounter();
    const el = target();

    el.innerHTML = runs.markup;

    expect(runs.get()).toBe(0);
  });

  it('does not re-execute a script already present when appending', async () => {
    const kept = runCounter();
    const el = target();

    await swap(el, kept.markup);
    expect(kept.get()).toBe(1);
    const script = el.querySelector('script');

    const added = runCounter();
    await swap(el, added.markup, { mode: SWAP_MODES.APPEND });

    expect(kept.get()).toBe(1);
    expect(added.get()).toBe(1);
    expect(el.querySelector('script')).toBe(script);
  });

  it('does not re-execute a script morphdom preserves', async () => {
    const kept = runCounter();
    const el = target();

    await swap(el, `<div id="keep">${kept.markup}</div>`);
    expect(kept.get()).toBe(1);

    await swap(el, `<div id="keep">${kept.markup}</div><p>added</p>`, {
      mode: SWAP_MODES.MORPH,
    });

    expect(kept.get()).toBe(1);
    expect(el.querySelector('p')?.textContent).toBe('added');
  });

  it('runs a script once per replace, since replaced content is new content', async () => {
    const runs = runCounter();
    const el = target();

    await swap(el, runs.markup);
    await swap(el, runs.markup);

    expect(runs.get()).toBe(2);
  });

  it('copies the attributes of the adopted script', async () => {
    const el = target();

    await swap(el, '<script type="application/json" id="payload">{"a":1}</script>');

    const script = el.querySelector('script');
    expect(script?.getAttribute('type')).toBe('application/json');
    expect(script?.id).toBe('payload');
    expect(script?.textContent).toBe('{"a":1}');
  });
});

describe('swap — component lifecycle', () => {
  it('mounts components swapped in and destroys components swapped out', async () => {
    const name = uniqueName('SwapLifecycle');
    const log: string[] = [];

    class Swapped extends Base {
      static config = { name };

      mounted() {
        log.push(`mounted:${this.$el.id}`);
        return () => log.push(`destroyed:${this.$el.id}`);
      }
    }
    registerComponent(Swapped);

    const el = target();
    await swap(el, `<div id="first" data-component="${name}"></div>`);
    expect(log).toEqual(['mounted:first']);

    await swap(el, `<div id="second" data-component="${name}"></div>`, {
      mode: SWAP_MODES.APPEND,
    });

    expect(log).toEqual(['mounted:first', 'mounted:second']);
    expect(el.querySelector('#second')?.[INSTANCES]?.get(name)?.$isMounted).toBe(true);

    await swap(el, '<p>gone</p>');

    expect(el.innerHTML).toBe('<p>gone</p>');
    expect(log.slice(2).toSorted()).toEqual(['destroyed:first', 'destroyed:second']);
  });

  it('does not remount a component morphdom preserves', async () => {
    const name = uniqueName('SwapMorphKeep');
    const log: string[] = [];

    class Kept extends Base {
      static config = { name };

      mounted() {
        log.push('mounted');
        return () => log.push('destroyed');
      }
    }
    registerComponent(Kept);

    const el = target();
    await swap(el, `<div id="kept" data-component="${name}">before</div>`);
    const inner = el.querySelector('#kept');
    const instance = inner?.[INSTANCES]?.get(name);
    expect(log).toEqual(['mounted']);

    await swap(el, `<div id="kept" data-component="${name}">after</div>`, {
      mode: SWAP_MODES.MORPH,
    });

    expect(el.querySelector('#kept')).toBe(inner);
    expect(inner?.[INSTANCES]?.get(name)).toBe(instance);
    expect(inner?.textContent).toBe('after');
    expect(log).toEqual(['mounted']);
  });
});

describe('swap — the wrap seam', () => {
  it('hands the single mutation to the wrapper and waits for it', async () => {
    const el = target('<p>old</p>');
    const order: string[] = [];

    await swap(el, '<p>new</p>', {
      wrap: async (mutate) => {
        order.push('before');
        expect(el.innerHTML).toBe('<p>old</p>');
        await Promise.resolve();
        mutate();
        order.push('after');
      },
    });

    expect(order).toEqual(['before', 'after']);
    expect(el.innerHTML).toBe('<p>new</p>');
  });

  it('settles the framework after the wrapper released the mutation', async () => {
    const name = uniqueName('SwapWrapped');
    class Wrapped extends Base {
      static config = { name };
    }
    registerComponent(Wrapped);

    const el = target();
    let mountedDuringWrap: boolean | undefined;

    await swap(el, `<div data-component="${name}"></div>`, {
      wrap: (mutate) => {
        mutate();
        mountedDuringWrap = el.firstElementChild?.[INSTANCES]?.get(name)?.$isMounted;
      },
    });

    expect(mountedDuringWrap).toBeFalsy();
    expect(el.firstElementChild?.[INSTANCES]?.get(name)?.$isMounted).toBe(true);
  });
});
