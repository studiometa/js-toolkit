import { afterEach, describe, expect, it } from 'vitest';
import { Base, type BaseConfig } from './Base.js';
import {
  getInstance,
  getInstances,
  getMountedInstances,
  getUnmountedInstances,
} from './instances.js';
import { INSTANCES } from './protocol-symbols.js';
import { registerComponent } from './registry.js';
import { renderTodoList, type TodoItem } from './todo.fixtures.js';
import { resetDom, settle, waitFor } from './test/index.js';

afterEach(resetDom);

const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

/**
 * A component on a reversible mount strategy.
 *
 * This is the whole reason `getInstances()` and `getMountedInstances()` are
 * two functions: `in-view` unmounts its instance when the element leaves the
 * viewport and keeps it in the element's map for the crossing back, so there
 * is a real, reachable population of built-but-unmounted instances that a
 * lookup must be able to name.
 */
class Reversible extends Base {
  static config: BaseConfig = { name: 'Reversible', mountStrategy: 'in-view' };
}

registerComponent(Reversible);

/** Mount a `Reversible`, then move it away so its strategy stands it down. */
async function renderStoodDown(): Promise<HTMLElement> {
  const el = document.createElement('div');
  el.setAttribute('data-component', 'Reversible');
  el.setAttribute('style', ONSCREEN);
  document.body.append(el);
  await waitFor(() => getMountedInstances('Reversible').length === 1);

  el.setAttribute('style', OFFSCREEN);
  await waitFor(() => getInstance(el, 'Reversible')?.$isMounted === false);
  return el;
}

describe('getInstances by name', () => {
  it('finds instances page-wide, in DOM order', async () => {
    renderTodoList({ items: ['one', 'two'] });
    renderTodoList({ items: ['three'] });
    await settle();

    const elements = [...document.querySelectorAll('[data-component~="TodoItem"]')];
    expect(elements).toHaveLength(3);
    expect(getInstances<TodoItem>('TodoItem').map((item) => item.$el)).toEqual(elements);
    expect(getInstances('TodoList')).toHaveLength(2);
  });

  it('scopes the lookup to a root', async () => {
    const first = renderTodoList({ items: ['one', 'two'] });
    const second = renderTodoList({ items: ['three'] });
    await settle();

    expect(getInstances('TodoItem', first)).toHaveLength(2);
    expect(getInstances('TodoItem', second)).toHaveLength(1);
  });

  it('searches the descendants of an element root, never the root itself', async () => {
    const root = renderTodoList({ items: ['one'] });
    await settle();

    expect(getInstances('TodoList')).toHaveLength(1);
    expect(getInstances('TodoList', root)).toEqual([]);
  });

  it('returns nothing for a name nobody declares', async () => {
    renderTodoList();
    await settle();

    expect(getInstances('Nowhere')).toEqual([]);
  });

  it('skips a matching element carrying no instance', async () => {
    const el = document.createElement('div');
    el.setAttribute('data-component', 'Unregistered');
    document.body.append(el);
    await settle();

    expect(el.matches('[data-component~="Unregistered"]')).toBe(true);
    expect(el[INSTANCES]).toBeUndefined();
    expect(getInstances('Unregistered')).toEqual([]);
  });

  it('matches one token of a multi-component declaration', async () => {
    const root = renderTodoList({ items: ['one'] });
    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    li.setAttribute('data-component', 'TodoItem TodoCount');
    await settle();

    expect(getInstances('TodoItem')).toHaveLength(1);
    expect(getInstances('TodoCount')).toHaveLength(2);
  });

  it('keeps an instance unmounted by hand', async () => {
    const root = renderTodoList({ items: ['one'] });
    await settle();

    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    const instance = getInstance<TodoItem>(li, 'TodoItem');
    instance?.$unmount();

    expect(instance?.$isMounted).toBe(false);
    expect(getInstances('TodoItem')).toEqual([instance]);
  });
});

describe('getMountedInstances by name', () => {
  it('returns the live instances, in DOM order', async () => {
    renderTodoList({ items: ['one', 'two'] });
    await settle();

    const elements = [...document.querySelectorAll('[data-component~="TodoItem"]')];
    expect(getMountedInstances<TodoItem>('TodoItem').map((item) => item.$el)).toEqual(elements);
    expect(getMountedInstances('TodoItem').every((item) => item.$isMounted)).toBe(true);
  });

  it('drops an instance unmounted by hand, which getInstances keeps', async () => {
    const root = renderTodoList({ items: ['one'] });
    await settle();

    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    getInstance<TodoItem>(li, 'TodoItem')?.$unmount();

    expect(getInstances('TodoItem')).toHaveLength(1);
    expect(getMountedInstances('TodoItem')).toEqual([]);
  });

  it('takes the same root scope as getInstances', async () => {
    const first = renderTodoList({ items: ['one', 'two'] });
    const second = renderTodoList({ items: ['three'] });
    await settle();

    expect(getMountedInstances('TodoItem', first)).toHaveLength(2);
    expect(getMountedInstances('TodoItem', second)).toHaveLength(1);
  });
});

describe('getUnmountedInstances by name', () => {
  it('is empty while every instance is live', async () => {
    renderTodoList({ items: ['one', 'two'] });
    await settle();

    expect(getMountedInstances('TodoItem')).toHaveLength(2);
    expect(getUnmountedInstances('TodoItem')).toEqual([]);
  });

  it('names the instance a reversible strategy stood down', async () => {
    const el = await renderStoodDown();
    const instance = getInstance(el, 'Reversible');

    // The strategy unmounts without deleting: the instance is kept for the
    // crossing back, which is the whole population this function is for.
    expect(instance?.$isMounted).toBe(false);
    expect(getInstances('Reversible')).toEqual([instance]);
    expect(getMountedInstances('Reversible')).toEqual([]);
    expect(getUnmountedInstances('Reversible')).toEqual([instance]);
  });

  it('gives the instance back when the strategy mounts it again', async () => {
    const el = await renderStoodDown();
    const instance = getInstance(el, 'Reversible');

    el.setAttribute('style', ONSCREEN);
    await waitFor(() => getMountedInstances('Reversible').length === 1);

    expect(getUnmountedInstances('Reversible')).toEqual([]);
    expect(getMountedInstances('Reversible')).toEqual([instance]);
  });

  it('partitions getInstances together with getMountedInstances', async () => {
    const root = renderTodoList({ items: ['one', 'two'] });
    await settle();

    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    getInstance<TodoItem>(li, 'TodoItem')?.$unmount();

    const all = getInstances('TodoItem');
    const mounted = getMountedInstances('TodoItem');
    const unmounted = getUnmountedInstances('TodoItem');

    expect(all).toHaveLength(2);
    expect(mounted).toHaveLength(1);
    expect(unmounted).toHaveLength(1);
    // Every instance is in exactly one half, and the two halves add up.
    for (const instance of all) {
      expect(mounted.includes(instance)).toBe(!unmounted.includes(instance));
    }
  });

  it('never returns a declaration that was never constructed', async () => {
    const el = document.createElement('div');
    el.setAttribute('data-component', 'Unregistered');
    document.body.append(el);
    await settle();

    // No instance is not the same as an unmounted instance, and the map read
    // — not a mount check — is what tells the two apart.
    expect(el[INSTANCES]).toBeUndefined();
    expect(getUnmountedInstances('Unregistered')).toEqual([]);
  });
});

describe('a detached element', () => {
  it('is unreachable by name from the document, but reachable from its own root', async () => {
    const root = renderTodoList({ items: ['one', 'two'] });
    await settle();

    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    const instance = getInstance<TodoItem>(li, 'TodoItem');
    expect(getMountedInstances<TodoItem>('TodoItem')).toContain(instance);

    const detached = document.createElement('div');
    detached.append(root);
    await settle();

    // Detaching unmounts the subtree but retains every instance.
    expect(instance?.$isMounted).toBe(false);
    expect(getInstance(li, 'TodoItem')).toBe(instance);
    expect(detached.querySelectorAll('[data-component~="TodoItem"]')).toHaveLength(2);

    // The asymmetry: `document` cannot see the subtree, the detached root can.
    expect(getInstances('TodoItem')).toEqual([]);
    expect(getInstances('TodoItem', detached)).toHaveLength(2);
    expect(getUnmountedInstances('TodoItem', detached)).toHaveLength(2);
    expect(getMountedInstances('TodoItem', detached)).toEqual([]);
  });

  it('answers the element overload with no DOM at all', async () => {
    const root = renderTodoList({ items: ['one'] });
    await settle();

    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    const instance = getInstance<TodoItem>(li, 'TodoItem');
    li.remove();
    await settle();

    expect(li.isConnected).toBe(false);
    expect(getInstances(li)).toEqual([instance]);
    expect(getUnmountedInstances(li)).toEqual([instance]);
    expect(getMountedInstances(li)).toEqual([]);
    expect(getInstance(li, 'TodoItem')).toBe(instance);
  });
});

describe('the element overload', () => {
  it('answers what is on one element, in mount order', async () => {
    const root = renderTodoList({ items: ['one'] });
    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    li.setAttribute('data-component', 'TodoItem TodoCount');
    await settle();

    expect(getInstances(li).map((instance) => instance.$config.name)).toEqual([
      'TodoItem',
      'TodoCount',
    ]);
    expect(getInstances(li)).toContain(getInstance(li, 'TodoItem'));
    expect(getMountedInstances(li)).toEqual(getInstances(li));
    expect(getUnmountedInstances(li)).toEqual([]);
  });

  it('never looks past the element', async () => {
    const root = renderTodoList({ items: ['one'] });
    await settle();

    // `TodoList` is on `root`; its items are on descendants.
    expect(getInstances(root).map((instance) => instance.$config.name)).toEqual(['TodoList']);
    expect(getMountedInstances(root).map((instance) => instance.$config.name)).toEqual([
      'TodoList',
    ]);
  });

  it('returns nothing for an element carrying no instance', async () => {
    const el = document.createElement('div');
    document.body.append(el);
    await settle();

    expect(getInstances(el)).toEqual([]);
    expect(getMountedInstances(el)).toEqual([]);
    expect(getUnmountedInstances(el)).toEqual([]);
  });

  it('keeps an instance that is no longer mounted, and sorts it', async () => {
    const root = renderTodoList({ items: ['one'] });
    await settle();

    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    const instance = getInstance<TodoItem>(li, 'TodoItem');
    instance?.$unmount();

    expect(getInstances(li)).toEqual([instance]);
    expect(getMountedInstances(li)).toEqual([]);
    expect(getUnmountedInstances(li)).toEqual([instance]);
  });
});

describe('getInstance', () => {
  it('reads one name off one element, mounted or not', async () => {
    const root = renderTodoList({ items: ['one'] });
    await settle();

    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    const instance = getInstance<TodoItem>(li, 'TodoItem');
    expect(instance).toBeDefined();
    expect(instance?.$el).toBe(li);
    expect(instance?.$isMounted).toBe(true);

    instance?.$unmount();
    expect(getInstance(li, 'TodoItem')).toBe(instance);
  });

  it('returns undefined for a name the element does not carry', async () => {
    const root = renderTodoList({ items: ['one'] });
    await settle();

    expect(getInstance(root, 'TodoItem')).toBeUndefined();
  });

  it('returns undefined for an element carrying no instance', async () => {
    const el = document.createElement('div');
    document.body.append(el);
    await settle();

    expect(el[INSTANCES]).toBeUndefined();
    expect(getInstance(el, 'TodoList')).toBeUndefined();
  });
});
