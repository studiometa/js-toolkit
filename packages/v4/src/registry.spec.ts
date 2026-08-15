import { afterEach, describe, expect, it } from 'vitest';
import { Base } from './Base.js';
import { DIAGNOSTICS, type ToolkitDiagnosticDetail } from './diagnostic-contract.js';
import { EVENTS } from './events.js';
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

  it('does not retain or reuse an instance whose derived constructor failed', async () => {
    const failure = new Error('constructor failed');
    const events: CustomEvent<ToolkitDiagnosticDetail>[] = [];
    const attempts: BrokenConstruction[] = [];
    let brokenMounts = 0;
    let healthyMounts = 0;

    class BrokenConstruction extends Base {
      static config = { name: 'BrokenConstructionErrorEvent' };

      constructor(el: HTMLElement) {
        super(el);
        attempts.push(this);
        throw failure;
      }

      mounted(): void {
        brokenMounts += 1;
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
    broken.addEventListener(EVENTS.diagnostic, (event) => {
      event.preventDefault();
      events.push(event as CustomEvent<ToolkitDiagnosticDetail>);
    });
    const healthy = document.createElement('div');
    healthy.setAttribute('data-component', 'HealthyAfterConstructionError');
    document.body.append(broken, healthy);
    await settle();

    expect(attempts).toHaveLength(1);
    expect(broken.__base__?.get('BrokenConstructionErrorEvent')).toBeUndefined();
    expect(brokenMounts).toBe(0);
    expect(healthyMounts).toBe(1);

    // Reconciliation retries construction. It must not mount the object whose
    // derived constructor did not finish.
    const firstAttempt = attempts[0];
    broken.remove();
    await settle();
    document.body.append(broken);
    await settle();

    expect(attempts).toHaveLength(2);
    expect(attempts[1]).not.toBe(firstAttempt);
    expect(broken.__base__?.get('BrokenConstructionErrorEvent')).toBeUndefined();
    expect(brokenMounts).toBe(0);
    expect(events).toHaveLength(2);
    expect(events.every((event) => event.target === broken)).toBe(true);
    expect(events.every((event) => event.defaultPrevented)).toBe(true);
    expect(events.every((event) => event.detail.code === DIAGNOSTICS.component.mountFailed)).toBe(
      true,
    );
    expect(events.every((event) => event.detail.error === failure)).toBe(true);
    expect(events.every((event) => event.detail.component === 'BrokenConstructionErrorEvent')).toBe(
      true,
    );
  });

  it('preserves a valid pre-existing instance when its registry mount fails', async () => {
    const failure = new Error('mount failed');
    const diagnostics: ToolkitDiagnosticDetail[] = [];

    class Existing extends Base {
      static config = { name: 'ExistingMountFailure' };

      $mount(): this {
        throw failure;
      }
    }

    registerComponent(Existing);
    const el = document.createElement('div');
    const instance = new Existing(el);
    el.addEventListener(EVENTS.diagnostic, (event) => {
      event.preventDefault();
      diagnostics.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
    });
    el.setAttribute('data-component', 'ExistingMountFailure');
    document.body.append(el);
    await settle();

    expect(el.__base__?.get('ExistingMountFailure')).toBe(instance);
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]).toMatchObject({
      severity: 'error',
      code: DIAGNOSTICS.component.mountFailed,
      error: failure,
      component: 'ExistingMountFailure',
    });
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
