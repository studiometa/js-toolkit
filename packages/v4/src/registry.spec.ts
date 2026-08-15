import { afterEach, describe, expect, it, vi } from 'vitest';
import { Base } from './Base.js';
import { JS_TOOLKIT_ERROR_EVENT, type ToolkitErrorDetail } from './errors.js';
import { registerComponent } from './registry.js';
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

  it('isolates a construction failure and reports it from the component element', async () => {
    const failure = new Error('constructor failed');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const events: CustomEvent<ToolkitErrorDetail>[] = [];
    let healthyMounts = 0;

    class BrokenConstruction extends Base {
      static config = { name: 'BrokenConstructionErrorEvent' };

      constructor(el: HTMLElement) {
        super(el);
        throw failure;
      }
    }

    class HealthyConstruction extends Base {
      static config = { name: 'HealthyAfterConstructionError' };

      mounted(): void {
        healthyMounts += 1;
      }
    }

    registerComponent(BrokenConstruction);
    registerComponent(HealthyConstruction);
    const broken = document.createElement('div');
    broken.setAttribute('data-component', 'BrokenConstructionErrorEvent');
    broken.addEventListener(JS_TOOLKIT_ERROR_EVENT, (event) => {
      events.push(event as CustomEvent<ToolkitErrorDetail>);
    });
    const healthy = document.createElement('div');
    healthy.setAttribute('data-component', 'HealthyAfterConstructionError');
    document.body.append(broken, healthy);
    await settle();

    expect(error).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalledWith(
      '[registry] Failed to mount "BrokenConstructionErrorEvent":',
      failure,
    );
    expect(events).toHaveLength(1);
    expect(events[0].target).toBe(broken);
    expect(events[0].detail).toEqual({
      stage: 'mount',
      error: failure,
      component: 'BrokenConstructionErrorEvent',
    });
    expect(healthyMounts).toBe(1);
    error.mockRestore();
  });

  it('processes a pending token replacement before mounting a newly registered class', async () => {
    const calls: string[] = [];

    class Before extends Base {
      static config = { name: 'RegistrationBefore' };
      terminated(): void {
        calls.push('before:terminated');
      }
    }
    class After extends Base {
      static config = { name: 'RegistrationAfter' };
      mounted(): void {
        calls.push(`after:mounted:before=${Boolean(this.$el.__base__?.has('RegistrationBefore'))}`);
      }
    }

    registerComponent(Before);
    const el = document.createElement('div');
    el.setAttribute('data-component', 'RegistrationBefore');
    document.body.append(el);
    await settle();

    el.setAttribute('data-component', 'RegistrationAfter');
    registerComponent(After);
    await settle();

    expect(calls).toEqual(['before:terminated', 'after:mounted:before=false']);
  });
});
