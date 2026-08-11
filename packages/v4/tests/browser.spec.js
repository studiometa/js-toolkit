import { afterEach, describe, expect, it } from 'vitest';
import {
  Base,
  Cell,
  createContext,
  nextFrame,
  registerComponent,
  scheduler,
  viewTransition,
} from '../src/index';

/**
 * Wait for the MutationObserver microtask and every scheduler queue,
 * repeatedly, until the framework is fully settled.
 */
async function settle() {
  for (let i = 0; i < 5; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
    await scheduler.whenIdle();
  }
}

const CountContext = createContext('todo-count');

class TodoItem extends Base {
  static config = { name: 'TodoItem', refs: ['remove'] };

  onClick(event) {
    if (event.target === this.$refs.remove) {
      this.$emit('remove');
    }
  }
}

class TodoCount extends Base {
  static config = { name: 'TodoCount' };

  async mounted() {
    const cell = await this.$inject(CountContext);
    const unsubscribe = cell.subscribe(
      (count) => {
        this.$el.textContent = String(count);
      },
      { immediate: true },
    );
    this.cleanupCalls = (this.cleanupCalls ?? 0) + 0;
    return () => {
      unsubscribe();
      this.cleanupCalls = (this.cleanupCalls ?? 0) + 1;
    };
  }
}

class TodoList extends Base {
  static config = {
    name: 'TodoList',
    refs: ['list'],
    components: { TodoItem, TodoCount },
  };

  count = this.$provide(CountContext, 0);

  items = this.$watchChildren('TodoItem', {
    added: () => this.sync(),
    removed: () => this.sync(),
  });

  removedEvents = [];

  sync() {
    this.count.value = this.items?.size ?? 0;
  }

  mounted() {
    this.sync();
  }

  onTodoItemRemove({ target, event }) {
    this.removedEvents.push({ target, event });
    target.$el.remove();
  }
}

registerComponent(TodoList);

function renderTodoList({ items = ['one', 'two'] } = {}) {
  const root = document.createElement('div');
  root.setAttribute('data-component', 'TodoList');
  root.innerHTML = `
    <ul data-ref="list">
      ${items.map((item) => `<li data-component="TodoItem">${item} <button data-ref="remove">×</button></li>`).join('')}
    </ul>
    <span data-component="TodoCount"></span>
  `;
  document.body.append(root);
  return root;
}

function getInstance(el, name) {
  return el.__base__?.get(name);
}

afterEach(async () => {
  document.body.innerHTML = '';
  await settle();
});

describe('registry', () => {
  it('mounts existing elements and auto-mounts inserted ones', async () => {
    const root = renderTodoList();
    await settle();

    const list = getInstance(root, 'TodoList');
    expect(list.$isMounted).toBe(true);
    expect(list.items.size).toBe(2);

    const li = document.createElement('li');
    li.setAttribute('data-component', 'TodoItem');
    li.innerHTML = 'three <button data-ref="remove">×</button>';
    root.querySelector('[data-ref="list"]').append(li);
    await settle();

    expect(list.items.size).toBe(3);
    expect(getInstance(li, 'TodoItem').$isMounted).toBe(true);
  });

  it('destroys on removal and remounts the same instance on re-insertion', async () => {
    const root = renderTodoList();
    await settle();

    const list = getInstance(root, 'TodoList');
    const li = root.querySelector('[data-component="TodoItem"]');
    const instance = getInstance(li, 'TodoItem');

    li.remove();
    await settle();
    expect(instance.$isMounted).toBe(false);
    expect(getInstance(li, 'TodoItem')).toBe(instance);
    expect(list.items.size).toBe(1);

    root.querySelector('[data-ref="list"]').append(li);
    await settle();
    expect(getInstance(li, 'TodoItem')).toBe(instance);
    expect(instance.$isMounted).toBe(true);
    expect(list.items.size).toBe(2);
  });
});

describe('events', () => {
  it('delegates bubbled child $emit to on<Child><Event> with a real click', async () => {
    const root = renderTodoList();
    await settle();

    const list = getInstance(root, 'TodoList');
    root.querySelector('[data-ref="remove"]').click();
    await settle();

    expect(list.removedEvents).toHaveLength(1);
    expect(list.removedEvents[0].target).toBeInstanceOf(TodoItem);
    expect(list.removedEvents[0].event.type).toBe('remove');
    expect(list.items.size).toBe(1);
  });

  it('returns the dispatched event so cancelation is observable', async () => {
    const root = renderTodoList();
    await settle();

    const li = root.querySelector('[data-component="TodoItem"]');
    const instance = getInstance(li, 'TodoItem');
    const seen = [];
    root.addEventListener('ping', (event) => {
      seen.push(event.detail);
      event.preventDefault();
    });

    const event = instance.$emit('ping', 1, 'two');
    expect(seen).toEqual([[1, 'two']]);
    expect(event.defaultPrevented).toBe(true);
  });
});

describe('$watchChildren', () => {
  it('adopts already-mounted children moved into the subtree (children first)', async () => {
    const orphan = document.createElement('li');
    orphan.setAttribute('data-component', 'TodoItem');
    orphan.innerHTML = 'orphan <button data-ref="remove">×</button>';
    document.body.append(orphan);
    await settle();
    expect(getInstance(orphan, 'TodoItem').$isMounted).toBe(true);

    const root = renderTodoList({ items: [] });
    await settle();
    const list = getInstance(root, 'TodoList');
    expect(list.items.size).toBe(0);

    root.querySelector('[data-ref="list"]').append(orphan);
    await settle();
    expect(list.items.size).toBe(1);
    expect(list.items.items[0]).toBe(getInstance(orphan, 'TodoItem'));
  });
});

describe('provide/inject', () => {
  it('resolves for a consumer that mounts before its provider', async () => {
    const Key = createContext('late-provider');
    const received = [];

    class LateConsumer extends Base {
      static config = { name: 'LateConsumer' };
      async mounted() {
        const cell = await this.$inject(Key);
        received.push(cell.value);
      }
    }
    registerComponent(LateConsumer);

    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<span data-component="LateConsumer"></span>';
    document.body.append(wrapper);
    await settle();
    expect(received).toEqual([]);

    // The provider appears later, higher in the tree.
    const { provideContext } = await import('../src/index');
    provideContext(wrapper, Key, new Cell('hello'));
    await settle();
    expect(received).toEqual(['hello']);
  });

  it('feeds TodoCount through the provided cell', async () => {
    const root = renderTodoList();
    await settle();

    const countEl = root.querySelector('[data-component="TodoCount"]');
    expect(countEl.textContent).toBe('2');

    root.querySelector('[data-ref="remove"]').click();
    await settle();
    expect(countEl.textContent).toBe('1');
  });
});

describe('lifecycle', () => {
  it('runs the mounted() cleanup on destroy', async () => {
    const root = renderTodoList();
    await settle();

    const countInstance = getInstance(
      root.querySelector('[data-component="TodoCount"]'),
      'TodoCount',
    );
    expect(countInstance.cleanupCalls ?? 0).toBe(0);

    root.remove();
    await settle();
    expect(countInstance.cleanupCalls).toBe(1);
    expect(countInstance.$isMounted).toBe(false);
  });
});

describe('scheduler (real frames)', () => {
  it('runs reads before writes within one frame, regardless of scheduling order', async () => {
    const order = [];
    scheduler.write(() => order.push('write'));
    scheduler.read(() => order.push('read'));
    await scheduler.whenIdle();
    expect(order).toEqual(['read', 'write']);
  });

  it('defers a read scheduled from a write to the next frame', async () => {
    const frames = [];
    let firstFrame;
    scheduler.write(() => {
      firstFrame = performance.now();
      scheduler.read(() => frames.push(performance.now() - firstFrame));
    });
    await scheduler.whenIdle();
    expect(frames).toHaveLength(1);
    // Ran in a later frame, not synchronously after the write.
    expect(frames[0]).toBeGreaterThan(0);
  });

  it('survives a throwing task', async () => {
    const task = scheduler.write(() => {
      throw new Error('boom');
    });
    await expect(task.promise).rejects.toThrow('boom');

    const after = scheduler.write(() => 'still alive');
    await expect(after.promise).resolves.toBe('still alive');
  });

  it('resolves task promises with return values and supports cancel', async () => {
    const canceled = scheduler.read(() => 'never');
    canceled.cancel();
    const kept = scheduler.read(() => 42);
    await expect(kept.promise).resolves.toBe(42);
    await expect(canceled.promise).resolves.toBeUndefined();
  });
});

describe('view transitions (native)', () => {
  it('batches updates into one native transition and resolves when finished', async () => {
    expect(typeof document.startViewTransition).toBe('function');

    const target = document.createElement('p');
    target.textContent = 'before';
    document.body.append(target);

    const a = viewTransition(() => {
      target.textContent = 'after';
    });
    const b = viewTransition(() => {
      target.dataset.done = 'yes';
    });
    await Promise.all([a, b]);

    expect(target.textContent).toBe('after');
    expect(target.dataset.done).toBe('yes');
    await nextFrame();
  });
});
