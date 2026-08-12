import { afterEach, describe, expect, it } from 'vitest';
import { getInstance, renderTodoList, resetDom, settle, TodoItem, TodoList } from './test-utils.js';

afterEach(resetDom);

describe('registry', () => {
  it('mounts existing elements and auto-mounts inserted ones', async () => {
    const root = renderTodoList();
    await settle();

    const list = getInstance<TodoList>(root, 'TodoList');
    expect(list.$isMounted).toBe(true);
    expect(list.items.size).toBe(2);

    const li = document.createElement('li');
    li.setAttribute('data-component', 'TodoItem');
    li.innerHTML = 'three <button data-ref="remove">×</button>';
    root.querySelector('[data-ref="list"]')?.append(li);
    await settle();

    expect(list.items.size).toBe(3);
    expect(getInstance(li, 'TodoItem').$isMounted).toBe(true);
  });

  it('destroys on removal and remounts the same instance on re-insertion', async () => {
    const root = renderTodoList();
    await settle();

    const list = getInstance<TodoList>(root, 'TodoList');
    const li = root.querySelector('[data-component="TodoItem"]') as HTMLElement;
    const instance = getInstance(li, 'TodoItem');

    li.remove();
    await settle();
    expect(instance.$isMounted).toBe(false);
    expect(getInstance(li, 'TodoItem')).toBe(instance);
    expect(list.items.size).toBe(1);

    root.querySelector('[data-ref="list"]')?.append(li);
    await settle();
    expect(getInstance(li, 'TodoItem')).toBe(instance);
    expect(instance.$isMounted).toBe(true);
    expect(list.items.size).toBe(2);
  });

  it('mounts a component token added to a connected element', async () => {
    const el = document.createElement('li');
    document.body.append(el);
    await settle();
    expect(el.__base__?.get('TodoItem')).toBeUndefined();

    el.setAttribute('data-component', 'TodoItem');
    await settle();
    expect(getInstance<TodoItem>(el, 'TodoItem').$isMounted).toBe(true);
  });

  it('reconciles token changes without disturbing retained components', async () => {
    const el = document.createElement('li');
    el.setAttribute('data-component', 'TodoItem TodoCount');
    document.body.append(el);
    await settle();

    const item = getInstance<TodoItem>(el, 'TodoItem');
    const count = getInstance(el, 'TodoCount');
    expect(item.$isMounted).toBe(true);
    expect(count.$isMounted).toBe(true);

    el.setAttribute('data-component', 'TodoCount');
    await settle();

    expect(el.__base__?.get('TodoItem')).toBeUndefined();
    expect(el.__base__?.get('TodoCount')).toBe(count);
    expect(count.$isMounted).toBe(true);
  });

  it('creates a new instance when a terminated token is declared again', async () => {
    const el = document.createElement('li');
    el.setAttribute('data-component', 'TodoItem');
    document.body.append(el);
    await settle();
    const first = getInstance<TodoItem>(el, 'TodoItem');

    el.removeAttribute('data-component');
    await settle();
    expect(el.__base__?.get('TodoItem')).toBeUndefined();
    expect(first.$isMounted).toBe(false);

    el.setAttribute('data-component', 'TodoItem');
    await settle();
    const second = getInstance<TodoItem>(el, 'TodoItem');
    expect(second).not.toBe(first);
    expect(second.$isMounted).toBe(true);
  });
});
