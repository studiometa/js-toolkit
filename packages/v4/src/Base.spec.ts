import { afterEach, describe, expect, it } from 'vitest';
import { Base, type BaseConfig, type OptionChange, type RefEvent } from './Base.js';
import { registerComponent } from './registry.js';
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

  it('gives each instance its own defaulted object, declared or not', () => {
    class Defaulted extends Base<{
      $options: { tween: Record<string, unknown>; list: unknown[]; bag: Record<string, unknown> };
    }> {
      static config = {
        name: 'Defaulted',
        options: {
          // Declared through a factory: called once per instance.
          tween: { type: Object, default: () => ({ ease: 'linear' }) },
          // Undeclared: an empty array, still one per instance.
          list: Array,
          bag: Object,
        },
      };
    }

    const first = new Defaulted(document.createElement('div'));
    const second = new Defaulted(document.createElement('div'));

    expect(first.$options.tween).toEqual({ ease: 'linear' });
    expect(second.$options.tween).toEqual({ ease: 'linear' });
    // Same value, never the same object: this is the bug that let one
    // component corrupt every other instance of its class.
    expect(first.$options.tween).not.toBe(second.$options.tween);
    expect(first.$options.list).not.toBe(second.$options.list);
    expect(first.$options.bag).not.toBe(second.$options.bag);

    first.$options.tween.ease = 'ease-out';
    expect(second.$options.tween).toEqual({ ease: 'linear' });
  });

  it('memoises the default, so a mutation of it persists on that instance', () => {
    class Listed extends Base<{ $options: { list: number[]; tween: Record<string, unknown> } }> {
      static config = {
        name: 'Listed',
        options: {
          list: Array,
          tween: { type: Object, default: () => ({ ease: 'linear' }) },
        },
      };
    }

    const instance = new Listed(document.createElement('div'));

    // Every read used to build a fresh array, so this push went nowhere.
    instance.$options.list.push(1, 2);
    expect(instance.$options.list).toEqual([1, 2]);
    expect(instance.$options.list).toBe(instance.$options.list);

    instance.$options.tween.ease = 'ease-out';
    expect(instance.$options.tween).toEqual({ ease: 'ease-out' });
  });

  it('calls the factory once per instance, lazily', () => {
    let calls = 0;

    class Lazy extends Base<{ $options: { tween: Record<string, unknown> } }> {
      static config = {
        name: 'Lazy',
        options: {
          tween: {
            type: Object,
            default: () => {
              calls += 1;
              return { id: calls };
            },
          },
        },
      };
    }

    const first = new Lazy(document.createElement('div'));
    const second = new Lazy(document.createElement('div'));
    // Nothing is built before the option is read.
    expect(calls).toBe(0);

    const read = first.$options.tween;
    expect(first.$options.tween).toBe(read);
    expect(calls).toBe(1);

    expect(second.$options.tween).not.toBe(read);
    expect(calls).toBe(2);
    expect(second.$options.tween).toEqual({ id: 2 });
  });

  it('runs option<Name>Changed as a live mount-scoped effect', async () => {
    const calls: string[] = [];

    class LiveOption extends Base<{ $options: { count: number } }> {
      static config = {
        name: 'LiveOptionEffect',
        options: { count: { type: Number, default: 5 } },
      };

      optionCountChanged(change: OptionChange<number>) {
        calls.push(
          `${change.initial ? 'initial' : 'changed'}:${change.previousValue ?? 'none'}->${change.value}`,
        );
        return () => calls.push(`cleanup:${change.value}`);
      }
    }

    registerComponent(LiveOption);
    const el = document.createElement('div');
    el.setAttribute('data-component', 'LiveOptionEffect');
    el.setAttribute('data-option-count', '1');
    document.body.append(el);
    await settle();
    expect(calls).toEqual(['initial:none->1']);

    // Several writes in one task produce one effect update from the first
    // old value to the final DOM value.
    el.setAttribute('data-option-count', '2');
    el.setAttribute('data-option-count', '3');
    await settle();
    expect(calls).toEqual(['initial:none->1', 'cleanup:1', 'changed:1->3']);

    // Removing the attribute applies the declared default.
    el.removeAttribute('data-option-count');
    await settle();
    expect(calls).toEqual([
      'initial:none->1',
      'cleanup:1',
      'changed:1->3',
      'cleanup:3',
      'changed:3->5',
    ]);

    // A batch which ends on its initial raw value causes no update.
    el.setAttribute('data-option-count', '7');
    el.removeAttribute('data-option-count');
    await settle();
    expect(calls.at(-1)).toBe('changed:3->5');

    el.remove();
    await settle();
    expect(calls.at(-1)).toBe('cleanup:5');

    document.body.append(el);
    await settle();
    expect(calls.at(-1)).toBe('initial:none->5');
  });

  it('isolates option effect errors and reentrant cleanup', async () => {
    const calls: string[] = [];
    const error = console.error;
    console.error = () => {};

    class ResilientOptions extends Base {
      static config = {
        name: 'ResilientOptions',
        options: { first: Number, second: Number },
      };

      optionFirstChanged({ initial }: OptionChange<number>) {
        if (!initial) {
          throw new Error('expected handler failure');
        }
        return () => {
          throw new Error('expected cleanup failure');
        };
      }

      optionSecondChanged({ value }: OptionChange<number>) {
        calls.push(`second:${value}`);
      }
    }

    class ReentrantOption extends Base {
      static config = {
        name: 'ReentrantOption',
        options: { value: Number },
      };

      optionValueChanged({ initial }: OptionChange<number>) {
        return initial ? () => this.$destroy() : undefined;
      }
    }

    try {
      registerComponent(ResilientOptions);
      registerComponent(ReentrantOption);
      const resilient = document.createElement('div');
      resilient.setAttribute('data-component', 'ResilientOptions');
      const reentrant = document.createElement('div');
      reentrant.setAttribute('data-component', 'ReentrantOption');
      document.body.append(resilient, reentrant);
      await settle();

      resilient.setAttribute('data-option-first', '1');
      resilient.setAttribute('data-option-second', '2');
      reentrant.setAttribute('data-option-value', '1');
      await settle();

      // A failed cleanup and handler do not block the later option update.
      expect(calls).toEqual(['second:0', 'second:2']);
      // Cleanup can destroy its own mount cycle without recursion or a stale
      // replacement cleanup being retained.
      expect(getInstance<ReentrantOption>(reentrant, 'ReentrantOption').$isMounted).toBe(false);
    } finally {
      console.error = error;
    }
  });

  it('keeps primitive defaults and attribute values as they were', () => {
    class Mixed extends Base<{
      $options: { speed: number; label: string; flag: boolean; list: unknown[] };
    }> {
      static config = {
        name: 'Mixed',
        options: {
          speed: { type: Number, default: 3 },
          label: { type: String, default: 'none' },
          flag: { type: Boolean, default: true },
          list: { type: Array, default: () => [1] },
        },
      };
    }

    const el = document.createElement('div');
    const instance = new Mixed(el);

    expect(instance.$options.speed).toBe(3);
    expect(instance.$options.label).toBe('none');
    expect(instance.$options.flag).toBe(true);
    expect(instance.$options.list).toEqual([1]);

    // An attribute is still the source of truth, read on every access.
    el.setAttribute('data-option-speed', '9');
    el.setAttribute('data-option-flag', 'false');
    el.setAttribute('data-option-list', '[2, 3]');
    expect(instance.$options.speed).toBe(9);
    expect(instance.$options.flag).toBe(false);
    expect(instance.$options.list).toEqual([2, 3]);

    // Malformed JSON falls back to the instance's own default.
    el.setAttribute('data-option-list', '{oops');
    expect(instance.$options.list).toEqual([1]);
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

  it('does not steal component records when read before observer delivery', async () => {
    class Inserted extends Base {
      static config = { name: 'RefReadInserted' };
    }

    class Owner extends Base {
      static config = { name: 'RefReadOwner', refs: ['item'] };
    }

    registerComponent(Inserted);
    const root = document.createElement('div');
    document.body.append(root);
    const owner = new Owner(root).$mount();

    root.innerHTML = '<span data-ref="item"></span><span data-component="RefReadInserted"></span>';

    // This drains `MutationObserver.takeRecords()` to make the lookup
    // synchronous. The same records must remain available to the registry.
    expect(owner.$refs.item).toBe(root.querySelector('[data-ref="item"]'));

    await settle();
    expect(getInstance(root.lastElementChild, 'RefReadInserted').$isMounted).toBe(true);
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
