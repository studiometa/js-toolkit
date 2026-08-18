import { afterEach, describe, expect, it } from 'vitest';
import { getInstances } from './instances.js';
import { INSTANCES } from './protocol-symbols.js';
import { getInstance, renderTodoList, resetDom, settle, type TodoItem } from './test-utils.js';

afterEach(resetDom);

describe('getInstances', () => {
  it('finds mounted instances page-wide, in DOM order', async () => {
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

  it('drops an instance destroyed with its subtree', async () => {
    const root = renderTodoList({ items: ['one', 'two'] });
    await settle();

    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    const instance = getInstance<TodoItem>(li, 'TodoItem');
    expect(getInstances<TodoItem>('TodoItem')).toContain(instance);

    const detached = document.createElement('div');
    detached.append(root);
    await settle();

    // Destroyed instances remain retained but are excluded by `$isMounted`.
    expect(instance.$isMounted).toBe(false);
    expect(getInstance(li, 'TodoItem')).toBe(instance);
    expect(detached.querySelectorAll('[data-component~="TodoItem"]')).toHaveLength(2);
    expect(getInstances('TodoItem', detached)).toEqual([]);
    expect(getInstances('TodoItem')).toEqual([]);
  });

  it('drops a destroyed instance', async () => {
    const root = renderTodoList({ items: ['one'] });
    await settle();

    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    const instance = getInstance<TodoItem>(li, 'TodoItem');
    instance.$destroy();

    expect(instance.$isMounted).toBe(false);
    expect(getInstances('TodoItem')).toEqual([]);
  });
});

describe('getInstances on an element', () => {
  it('answers what is mounted on one element, in mount order', async () => {
    const root = renderTodoList({ items: ['one'] });
    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    li.setAttribute('data-component', 'TodoItem TodoCount');
    await settle();

    expect(getInstances(li).map((instance) => instance.$config.name)).toEqual([
      'TodoItem',
      'TodoCount',
    ]);
    expect(getInstances(li)).toContain(getInstance(li, 'TodoItem'));
  });

  it('never looks past the element', async () => {
    const root = renderTodoList({ items: ['one'] });
    await settle();

    // `TodoList` is on `root`; its items are on descendants.
    expect(getInstances(root).map((instance) => instance.$config.name)).toEqual(['TodoList']);
  });

  it('returns nothing for an element carrying no instance', async () => {
    const el = document.createElement('div');
    document.body.append(el);
    await settle();

    expect(getInstances(el)).toEqual([]);
  });

  it('excludes an instance that is no longer mounted', async () => {
    const root = renderTodoList({ items: ['one'] });
    await settle();

    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    getInstance<TodoItem>(li, 'TodoItem').$destroy();

    expect(getInstances(li)).toEqual([]);
  });
});
