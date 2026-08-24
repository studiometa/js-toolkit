/**
 * The todo list the core specs are written against.
 *
 * One fixture exercises the four things a component has to get right together
 * — refs, a provided context, `$watchChildren` and a delegated child event —
 * so a spec about any one of them can be written against a shape that is
 * already familiar rather than against a new one per file.
 *
 * It lives outside `test-utils.ts` because the two are different kinds of
 * thing: `test-utils.ts` holds helpers that read the framework, while this
 * module *is* a component tree, registered on import. Both are excluded from
 * the build — see `scripts/build.js` and `scripts/check-package.js`.
 */

import { Base } from './Base.js';
import { createContext, signal, type Signal } from './context.js';
import { registerComponent } from './registry.js';
import type { DelegatedEvent } from './Base.js';

export const CountContext = createContext<Signal<number>>('todo-count');

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
    const count = await this.$inject(CountContext);
    const unsubscribe = count.subscribe(
      (value) => {
        this.$el.textContent = String(value);
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

  count = this.$provide(CountContext, signal(0));

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
