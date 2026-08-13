import { Base, createContext, signal, type DelegatedEvent, type Signal } from '../../src/index.js';

/**
 * The TodoList demo from the playground: registry auto-mount, delegation,
 * `$watchChildren`, provide/inject, and native view transitions.
 */
// The value travels verbatim, so a reactive count is a provided `Signal`.
export const CountContext = createContext<Signal<number>>('todo-count');

export class TodoItem extends Base<{
  $refs: { remove: HTMLButtonElement };
  $emits: { remove: [] };
}> {
  static config = { name: 'TodoItem', refs: ['remove'] };

  // Bound to the `remove` ref through delegation, so the handler no longer
  // has to check the event target itself.
  onRemoveClick(): void {
    this.$emit('remove');
  }
}

export class TodoCount extends Base<{ $el: HTMLElement }> {
  static config = { name: 'TodoCount' };

  async mounted() {
    const signal = await this.$inject(CountContext);
    return signal.subscribe(
      (count) => {
        this.$write(() => {
          this.$el.textContent = `${count} item${count === 1 ? '' : 's'}`;
        });
      },
      { immediate: true },
    );
  }
}

export class TodoList extends Base<{
  $refs: { input: HTMLInputElement; list: HTMLElement };
}> {
  static config = {
    name: 'TodoList',
    refs: ['input', 'list'],
    components: { TodoItem, TodoCount },
  };

  count = this.$provide(CountContext, signal(0));

  items = this.$watchChildren<TodoItem>('TodoItem', {
    added: () => this.sync(),
    removed: () => this.sync(),
  });

  sync(): void {
    this.count.value = this.items?.size ?? 0;
  }

  mounted(): void {
    this.sync();
  }

  onTodoItemRemove({ target }: DelegatedEvent<TodoItem>): void {
    this.$viewTransition(() => target.$el.remove());
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const { input, list } = this.$refs;
    const title = input.value.trim();
    if (!title) {
      return;
    }
    const li = document.createElement('li');
    li.setAttribute('data-component', 'TodoItem');
    li.innerHTML =
      '<span></span> <button data-ref="remove" type="button" aria-label="Remove">×</button>';
    const span = li.querySelector('span');
    if (span) {
      span.textContent = title;
    }
    input.value = '';
    this.$viewTransition(() => list.append(li));
  }
}
