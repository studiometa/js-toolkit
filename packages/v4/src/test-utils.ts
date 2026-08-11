/**
 * Shared fixtures and helpers for the colocated `*.spec.ts` files.
 * Not part of the public API.
 */
import { Base } from './Base.js';
import { createContext } from './context.js';
import { registerComponent } from './registry.js';
import { scheduler } from './scheduler.js';
import type { DelegatedEvent } from './Base.js';

/**
 * Wait for the MutationObserver microtask and every scheduler queue,
 * repeatedly, until the framework is fully settled.
 */
export async function settle(): Promise<void> {
  for (let i = 0; i < 5; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
    await scheduler.whenIdle();
  }
}

export function getInstance<T extends Base = Base>(el: Element | null, name: string): T {
  return el?.__base__?.get(name) as T;
}

export const CountContext = createContext<number>('todo-count');

export class TodoItem extends Base {
  static config = { name: 'TodoItem', refs: ['remove'] };

  onClick(event: Event): void {
    if (event.target === this.$refs.remove) {
      this.$emit('remove');
    }
  }
}

export class TodoCount extends Base {
  static config = { name: 'TodoCount' };

  cleanupCalls = 0;

  async mounted() {
    const signal = await this.$inject(CountContext);
    const unsubscribe = signal.subscribe(
      (count) => {
        this.$el.textContent = String(count);
      },
      { immediate: true },
    );
    return () => {
      unsubscribe();
      this.cleanupCalls += 1;
    };
  }
}

export class TodoList extends Base {
  static config = {
    name: 'TodoList',
    refs: ['list'],
    components: { TodoItem, TodoCount },
  };

  count = this.$provide(CountContext, 0);

  items = this.$watchChildren<TodoItem>('TodoItem', {
    added: () => this.sync(),
    removed: () => this.sync(),
  });

  removedEvents: Array<DelegatedEvent<TodoItem>> = [];

  sync(): void {
    this.count.value = this.items?.size ?? 0;
  }

  mounted(): void {
    this.sync();
  }

  onTodoItemRemove(payload: DelegatedEvent<TodoItem>): void {
    this.removedEvents.push(payload);
    payload.target.$el.remove();
  }
}

registerComponent(TodoList);

export function renderTodoList({ items = ['one', 'two'] }: { items?: string[] } = {}): HTMLElement {
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

export async function resetDom(): Promise<void> {
  document.body.innerHTML = '';
  await settle();
}
