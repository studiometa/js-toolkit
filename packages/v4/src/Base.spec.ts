import { afterEach, describe, expect, it } from 'vitest';
import { Base, type BaseConfig, type RefEvent } from './Base.js';
import {
  getInstance,
  renderTodoList,
  resetDom,
  settle,
  TodoCount,
  TodoItem,
  TodoList,
} from './test-utils.js';

afterEach(resetDom);

describe('$emit and delegation', () => {
  it('delegates bubbled child $emit to on<Child><Event> with a real click', async () => {
    const root = renderTodoList();
    await settle();

    const list = getInstance<TodoList>(root, 'TodoList');
    root.querySelector<HTMLElement>('[data-ref="remove"]')?.click();
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
    const seen: unknown[] = [];
    root.addEventListener('ping', (event) => {
      seen.push((event as CustomEvent).detail);
      event.preventDefault();
    });

    const event = instance.$emit('ping', 1, 'two');
    expect(seen).toEqual([[1, 'two']]);
    expect(event.defaultPrevented).toBe(true);
  });
});

describe('$options', () => {
  it('reads typed values from data-option attributes', async () => {
    class Optioned extends Base {
      static config = {
        name: 'Optioned',
        options: {
          count: Number,
          label: String,
          flag: Boolean,
          list: Array,
          withDefault: { type: Number, default: 42 },
        },
      };
    }

    const el = document.createElement('div');
    el.setAttribute('data-option-count', '7');
    el.setAttribute('data-option-label', 'hello');
    el.setAttribute('data-option-flag', '');
    el.setAttribute('data-option-list', '[1, 2]');
    const instance = new Optioned(el).$mount();

    expect(instance.$options.count).toBe(7);
    expect(instance.$options.label).toBe('hello');
    expect(instance.$options.flag).toBe(true);
    expect(instance.$options.list).toEqual([1, 2]);
    expect(instance.$options.withDefault).toBe(42);

    // Options are live getters, not a snapshot.
    el.setAttribute('data-option-count', '9');
    expect(instance.$options.count).toBe(9);
  });
});

describe('$el', () => {
  it('keeps the declared root element type at runtime', () => {
    class Panel extends Base<{ $el: HTMLDetailsElement }> {
      static config = { name: 'Panel' };

      // Reads `open` straight off `$el`: no getter, no cast.
      toggle(): boolean {
        this.$el.open = !this.$el.open;
        return this.$el.open;
      }
    }

    const el = document.createElement('details');
    const instance = new Panel(el).$mount();

    expect(instance.$el).toBe(el);
    expect(instance.toggle()).toBe(true);
    expect(el.open).toBe(true);
  });
});

describe('$refs', () => {
  it('resolves only the refs owned by the component', async () => {
    class Owner extends Base {
      static config = { name: 'Owner', refs: ['own', 'many[]'] };
    }

    const el = document.createElement('div');
    el.innerHTML = `
      <span data-ref="own"></span>
      <span data-ref="many"></span>
      <span data-ref="many"></span>
      <div data-component="Other"><span data-ref="own"></span></div>
    `;
    const instance = new Owner(el).$mount();

    expect(instance.$refs.own).toBe(el.querySelector('[data-ref="own"]'));
    expect(instance.$refs.many).toHaveLength(2);
    // The ref nested in another component does not belong to this one.
    expect(el.querySelectorAll('[data-ref="own"]')).toHaveLength(2);
  });

  it('stays live when the markup is replaced', async () => {
    class Swapped extends Base {
      static config = { name: 'Swapped', refs: ['title', 'items[]'] };
    }

    const el = document.createElement('div');
    el.innerHTML = '<h1 data-ref="title">before</h1><span data-ref="items"></span>';
    const instance = new Swapped(el).$mount();
    expect((instance.$refs.title as HTMLElement).textContent).toBe('before');
    expect(instance.$refs.items).toHaveLength(1);

    // A Fetch-style swap: brand new elements, no $update() call.
    el.innerHTML =
      '<h1 data-ref="title">after</h1><span data-ref="items"></span><span data-ref="items"></span>';
    expect((instance.$refs.title as HTMLElement).textContent).toBe('after');
    expect(instance.$refs.title).toBe(el.querySelector('[data-ref="title"]'));
    expect(instance.$refs.items).toHaveLength(2);

    // A ref that disappears reads as undefined rather than as a detached node.
    el.innerHTML = '';
    expect(instance.$refs.title).toBeUndefined();
    expect(instance.$refs.items).toHaveLength(0);
  });
});

describe('on<Ref><Event> handlers', () => {
  class Form extends Base<{
    $refs: { input: HTMLInputElement; buttons: HTMLButtonElement[] };
  }> {
    static config = { name: 'RefForm', refs: ['input', 'buttons[]'] };

    typed: string[] = [];
    pressed: number[] = [];
    focused = 0;

    onInputInput({ target }: RefEvent<HTMLInputElement>): void {
      this.typed.push(target.value);
    }

    onButtonsClick({ index }: RefEvent): void {
      this.pressed.push(index);
    }

    // `focus` does not bubble: it must be delegated from the capture phase.
    onInputFocus(): void {
      this.focused += 1;
    }
  }

  function render(): { el: HTMLElement; instance: Form } {
    const el = document.createElement('div');
    el.innerHTML = `
      <input data-ref="input" />
      <button data-ref="buttons">a</button>
      <button data-ref="buttons">b</button>
    `;
    document.body.append(el);
    return { el, instance: new Form(el).$mount() };
  }

  it('routes events to the matching ref handler', () => {
    const { el, instance } = render();

    const input = el.querySelector('input') as HTMLInputElement;
    input.value = 'hello';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(instance.typed).toEqual(['hello']);
  });

  it('reports the index of a ref among its namesakes', () => {
    const { el, instance } = render();

    const buttons = el.querySelectorAll('button');
    buttons[1].click();
    buttons[0].click();
    expect(instance.pressed).toEqual([1, 0]);
  });

  it('handles non-bubbling events through the capture phase', () => {
    const { el, instance } = render();

    (el.querySelector('input') as HTMLInputElement).dispatchEvent(new Event('focus'));
    expect(instance.focused).toBe(1);
  });

  it('keeps working on refs added after mount', () => {
    const { el, instance } = render();

    const added = document.createElement('button');
    added.setAttribute('data-ref', 'buttons');
    el.append(added);
    added.click();
    // Third button, no rebinding needed.
    expect(instance.pressed).toEqual([2]);
  });

  it('ignores refs owned by a nested component', () => {
    const { el, instance } = render();

    const nested = document.createElement('div');
    nested.setAttribute('data-component', 'Other');
    nested.innerHTML = '<button data-ref="buttons">nested</button>';
    el.append(nested);
    nested.querySelector('button')?.click();
    expect(instance.pressed).toEqual([]);
  });
});

describe('config inheritance', () => {
  it('merges refs, options and components with the parent config', () => {
    // An intermediate class annotates its config, so a subclass is free to
    // declare a different shape (the same annotation v3 components use).
    class Parent extends Base {
      static config: BaseConfig = {
        name: 'ConfigParent',
        refs: ['one'],
        options: { a: Number },
        components: { TodoItem },
      };
    }

    class Child extends Parent {
      static config = {
        name: 'ConfigChild',
        refs: ['two'],
        options: { b: String },
        components: { TodoCount },
      };
    }

    const el = document.createElement('div');
    const child = new Child(el);

    expect(child.$config.name).toBe('ConfigChild');
    // Inherited from the parent instead of being dropped by the child.
    expect(child.$config.refs).toEqual(['one', 'two']);
    expect(Object.keys(child.$config.options ?? {})).toEqual(['a', 'b']);
    expect(Object.keys(child.$config.components ?? {})).toEqual(['TodoItem', 'TodoCount']);

    // The parent's own config is untouched.
    expect(new Parent(document.createElement('div')).$config.refs).toEqual(['one']);
  });

  it('resolves a parent ref from a subclass that redeclares its own', () => {
    class Greeter extends Base {
      static config: BaseConfig = { name: 'Greeter', refs: ['label'] };
      greet(): string {
        return (this.$refs.label as HTMLElement).textContent ?? '';
      }
    }

    class LoudGreeter extends Greeter {
      static config = { name: 'LoudGreeter', refs: ['extra'] };
    }

    const el = document.createElement('div');
    el.innerHTML = '<span data-ref="label">hi</span>';
    const instance = new LoudGreeter(el).$mount();
    // v3 threw here: the child config overrode the parent's refs.
    expect(instance.greet()).toBe('hi');
  });
});

describe('$query and $closest', () => {
  it('finds mounted descendants and the nearest mounted ancestor', async () => {
    const root = renderTodoList();
    await settle();

    const list = getInstance<TodoList>(root, 'TodoList');
    const items = list.$query<TodoItem>('TodoItem');
    expect(items).toHaveLength(2);
    expect(items[0].$closest('TodoList')).toBe(list);
    expect(items[0].$closest('Nothing')).toBeNull();
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
    const list = getInstance<TodoList>(root, 'TodoList');
    expect(list.items.size).toBe(0);

    root.querySelector('[data-ref="list"]')?.append(orphan);
    await settle();
    expect(list.items.size).toBe(1);
    expect(list.items.items[0]).toBe(getInstance(orphan, 'TodoItem'));
  });

  it('keeps the collection in DOM order', async () => {
    const root = renderTodoList({ items: ['a', 'b', 'c'] });
    await settle();

    const list = getInstance<TodoList>(root, 'TodoList');
    expect(list.items.items.map((item) => item.$el.textContent?.trim().charAt(0))).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});

describe('lifecycle', () => {
  it('runs the mounted() cleanup on destroy', async () => {
    const root = renderTodoList();
    await settle();

    const countInstance = getInstance<TodoCount>(
      root.querySelector('[data-component="TodoCount"]'),
      'TodoCount',
    );
    expect(countInstance.cleanupCalls).toBe(0);

    root.remove();
    await settle();
    expect(countInstance.cleanupCalls).toBe(1);
    expect(countInstance.$isMounted).toBe(false);
  });

  it('separates destroy from terminate', async () => {
    const calls: string[] = [];

    class Tracked extends Base {
      static config = { name: 'Tracked' };
      mounted() {
        calls.push('mounted');
        return () => calls.push('cleanup');
      }
      destroyed(): void {
        calls.push('destroyed');
      }
      terminated(): void {
        calls.push('terminated');
      }
    }

    const el = document.createElement('div');
    document.body.append(el);
    const instance = new Tracked(el);

    instance.$mount();
    instance.$destroy();
    expect(calls).toEqual(['mounted', 'cleanup', 'destroyed']);

    // Destroy is reversible.
    instance.$mount();
    expect(instance.$isMounted).toBe(true);
    expect(el.__base__?.get('Tracked')).toBe(instance);

    instance.$terminate();
    expect(calls).toEqual([
      'mounted',
      'cleanup',
      'destroyed',
      'mounted',
      'cleanup',
      'destroyed',
      'terminated',
    ]);
    // Terminate is final: detached from the element, never mounts again.
    expect(el.__base__?.get('Tracked')).toBeUndefined();
    instance.$mount();
    expect(instance.$isMounted).toBe(false);
  });

  it('runs a cleanup resolved after destroy immediately', async () => {
    let cleaned = false;

    class Slow extends Base {
      static config = { name: 'Slow' };
      async mounted() {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return () => {
          cleaned = true;
        };
      }
    }

    const el = document.createElement('div');
    document.body.append(el);
    const instance = new Slow(el).$mount();
    instance.$destroy();

    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(cleaned).toBe(true);
  });
});
