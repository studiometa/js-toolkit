import { afterEach, describe, expect, it } from 'vitest';
import { getInstance, renderTodoList, resetDom, settle, TodoList } from './test-utils';

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
});
