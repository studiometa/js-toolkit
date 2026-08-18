import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  Base,
  type BaseConfig,
  type ChildrenCollection,
  type DelegatedEvent,
  type GlobalEvent,
  type MountedReturn,
  type OptionChange,
  type RefEvent,
} from './Base.js';
import { DIAGNOSTICS, type ToolkitDiagnosticDetail } from './diagnostic-contract.js';
import { EVENTS } from './events.js';
import { INSTANCES } from './protocol-symbols.js';
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

describe('$id', () => {
  it('uses the resolved component name and a unique monotonic sequence', () => {
    class First extends Base {
      static config = { name: 'ResolvedFirst' };
    }
    class Second extends Base {
      static config = { name: 'ResolvedSecond' };
    }

    const first = new First(document.createElement('div'));
    const next = new First(document.createElement('div'));
    const other = new Second(document.createElement('div'));
    const sequence = (instance: Base) => Number(instance.$id.split('-').at(-1));

    expect(first.$id).toMatch(/^ResolvedFirst-\d+$/);
    expect(next.$id).toMatch(/^ResolvedFirst-\d+$/);
    expect(other.$id).toMatch(/^ResolvedSecond-\d+$/);
    expect(new Set([first.$id, next.$id, other.$id]).size).toBe(3);
    expect(sequence(next)).toBe(sequence(first) + 1);
    expect(sequence(other)).toBe(sequence(next) + 1);
  });

  it('is available to derived field initializers and survives remounts', () => {
    class Identified extends Base {
      static config = { name: 'Identified' };
      readonly initializedWith = this.$id;
    }

    const instance = new Identified(document.createElement('div'));
    const id = instance.$id;

    expect(instance.initializedWith).toBe(id);
    instance.$mount().$destroy().$mount();
    expect(instance.$id).toBe(id);
  });
});

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

    const event = instance.$emit('ping', { count: 1, label: 'two' });
    expect(seen).toEqual([{ count: 1, label: 'two' }]);
    expect(event.defaultPrevented).toBe(true);
  });

  it('leaves the detail at the platform null when nothing is emitted', async () => {
    const root = renderTodoList();
    await settle();

    const li = root.querySelector('[data-component="TodoItem"]');
    const instance = getInstance(li, 'TodoItem');
    const seen: unknown[] = [];
    root.addEventListener('ping', (event) => seen.push((event as CustomEvent).detail));

    instance.$emit('ping');
    expect(seen).toEqual([null]);
  });

  it('warns when the payload is not an object, and dispatches anyway', async () => {
    const root = renderTodoList();
    await settle();

    const li = root.querySelector('[data-component="TodoItem"]');
    const instance = getInstance(li, 'TodoItem');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const seen: unknown[] = [];
    root.addEventListener('ping', (event) => seen.push((event as CustomEvent).detail));

    (instance.$emit as (type: string, payload?: unknown) => void)('ping', 1);
    (instance.$emit as (type: string, payload?: unknown) => void)('ping', 2);
    (instance.$emit as (type: string, payload?: unknown) => void)('pong', 3);

    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn.mock.calls[0][0]).toContain('one payload object');
    expect(seen).toEqual([1, 2]);
    warn.mockRestore();
  });
});

describe('the fixed instance properties', () => {
  it('refuses a write to any of the four', () => {
    class Fixed extends Base<{ $refs: { title: HTMLElement } }> {
      static config = { name: 'Fixed', refs: ['title'] };
    }

    const el = document.createElement('div');
    const instance = new Fixed(el);
    const before = {
      $el: instance.$el,
      $id: instance.$id,
      $options: instance.$options,
      $refs: instance.$refs,
    };

    // The element it is bound to, the id derived from its name and the two
    // views over its markup are what every other part of the framework reads.
    for (const property of ['$el', '$id', '$options', '$refs'] as const) {
      expect(() => {
        (instance as unknown as Record<string, unknown>)[property] = {};
      }).toThrow(TypeError);
    }

    expect(instance.$el).toBe(before.$el);
    expect(instance.$id).toBe(before.$id);
    expect(instance.$options).toBe(before.$options);
    expect(instance.$refs).toBe(before.$refs);
  });

  it('keeps them enumerable, so an instance still reads as one', () => {
    class Plain extends Base {
      static config = { name: 'Plain' };
    }

    const keys = Object.keys(new Plain(document.createElement('div')));

    expect(keys).toEqual(expect.arrayContaining(['$el', '$id', '$options', '$refs']));
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

    el.setAttribute('data-option-count', '9');
    expect(instance.$options.count).toBe(9);
  });

  it('refuses a write to the view itself, not only to an option', () => {
    class Panel extends Base<{ $options: { open: boolean } }> {
      static config = { name: 'Panel', options: { open: Boolean } };
    }

    const instance = new Panel(document.createElement('div'));
    const view = instance.$options;

    expect(() => {
      // @ts-expect-error the view is the instance's, and it is fixed
      instance.$options = { open: true };
    }).toThrow(TypeError);
    expect(instance.$options).toBe(view);
  });

  it('refuses a write, and the attribute is what changes the value', () => {
    class Panel extends Base<{ $options: { open: boolean } }> {
      static config = { name: 'Panel', options: { open: Boolean } };
    }

    const el = document.createElement('div');
    const instance = new Panel(el).$mount();

    expect(instance.$options.open).toBe(false);
    expect(() => {
      // @ts-expect-error the view is read-only, and this is the runtime half of it
      instance.$options.open = true;
    }).toThrow(TypeError);
    expect(instance.$options.open).toBe(false);

    el.setAttribute('data-option-open', '');
    expect(instance.$options.open).toBe(true);
  });

  it('reads the first matching type from a union option', () => {
    class Offset extends Base<{ $options: { offset: number | unknown[] } }> {
      static config = {
        name: 'Offset',
        options: {
          offset: [Number, Array],
        },
      };
    }

    const number = document.createElement('div');
    number.setAttribute('data-option-offset', '10');
    expect(new Offset(number).$options.offset).toBe(10);

    const array = document.createElement('div');
    array.setAttribute('data-option-offset', '[10, 20]');
    expect(new Offset(array).$options.offset).toEqual([10, 20]);

    const fallback = new Offset(document.createElement('div'));
    expect(fallback.$options.offset).toBe(0);

    class Ordered extends Base<{ $options: { value: string | number } }> {
      static config = {
        name: 'Ordered',
        options: {
          value: { type: [String, Number], default: 1 },
        },
      };
    }

    const ordered = document.createElement('div');
    ordered.setAttribute('data-option-value', '10');
    expect(new Ordered(ordered).$options.value).toBe('10');

    class Defaulted extends Base<{ $options: { value: number | unknown[] } }> {
      static config = {
        name: 'DefaultedUnion',
        options: {
          value: { type: [Number, Array], default: 3 },
        },
      };
    }

    const invalid = document.createElement('div');
    invalid.setAttribute('data-option-value', 'invalid');
    expect(new Defaulted(invalid).$options.value).toBe(3);
  });

  it('gives each instance its own defaulted object, declared or not', () => {
    class Defaulted extends Base<{
      $options: { tween: Record<string, unknown>; list: unknown[]; bag: Record<string, unknown> };
    }> {
      static config = {
        name: 'Defaulted',
        options: {
          tween: { type: Object, default: () => ({ ease: 'linear' }) },
          list: Array,
          bag: Object,
        },
      };
    }

    const first = new Defaulted(document.createElement('div'));
    const second = new Defaulted(document.createElement('div'));

    expect(first.$options.tween).toEqual({ ease: 'linear' });
    expect(second.$options.tween).toEqual({ ease: 'linear' });
    expect(first.$options.tween).not.toBe(second.$options.tween);
    expect(first.$options.list).not.toBe(second.$options.list);
    expect(first.$options.bag).not.toBe(second.$options.bag);

    first.$options.tween.ease = 'ease-out';
    expect(second.$options.tween).toEqual({ ease: 'linear' });
  });

  it('gives each instance its own nested default through a factory', () => {
    class Nested extends Base<{
      $options: { tween: Record<string, Record<string, number>>; matrix: number[][] };
    }> {
      static config = {
        name: 'Nested',
        options: {
          tween: { type: Object, default: () => ({ ease: { in: 1, out: 2 } }) },
          matrix: { type: Array, default: () => [[1], [2]] },
        },
      };
    }

    const first = new Nested(document.createElement('div'));
    const second = new Nested(document.createElement('div'));

    expect(first.$options.tween.ease).not.toBe(second.$options.tween.ease);
    expect(first.$options.matrix[0]).not.toBe(second.$options.matrix[0]);

    first.$options.tween.ease.in = 99;
    first.$options.matrix[0].push(42);
    expect(second.$options.tween).toEqual({ ease: { in: 1, out: 2 } });
    expect(second.$options.matrix).toEqual([[1], [2]]);
  });

  it('warns about a literal default instead of repairing it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    class LiteralDefault extends Base<{ $options: { tween: Record<string, unknown> } }> {
      static config = {
        name: 'LiteralDefault',
        options: { tween: { type: Object, default: { ease: 'linear' } } },
      } as unknown as BaseConfig;
    }

    const first = new LiteralDefault(document.createElement('div'));
    const second = new LiteralDefault(document.createElement('div'));

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('LiteralDefault');
    expect(warn.mock.calls[0][0]).toContain('tween');
    expect(warn.mock.calls[0][0]).toContain('default: () => (…)');

    expect(first.$options.tween).toBe(second.$options.tween);
    warn.mockRestore();
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

    el.setAttribute('data-option-count', '2');
    el.setAttribute('data-option-count', '3');
    await settle();
    expect(calls).toEqual(['initial:none->1', 'cleanup:1', 'changed:1->3']);

    el.removeAttribute('data-option-count');
    await settle();
    expect(calls).toEqual([
      'initial:none->1',
      'cleanup:1',
      'changed:1->3',
      'cleanup:3',
      'changed:3->5',
    ]);

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
    const cleanupFailure = new Error('expected cleanup failure');
    const handlerFailure = new Error('expected handler failure');
    const events: CustomEvent<ToolkitDiagnosticDetail>[] = [];

    class ResilientOptions extends Base {
      static config = {
        name: 'ResilientOptions',
        options: { first: Number, second: Number },
      };

      optionFirstChanged({ initial }: OptionChange<number>) {
        if (!initial) {
          throw handlerFailure;
        }
        return () => {
          throw cleanupFailure;
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
      resilient.addEventListener(EVENTS.diagnostic, (event) => {
        event.preventDefault();
        events.push(event as CustomEvent<ToolkitDiagnosticDetail>);
      });
      const reentrant = document.createElement('div');
      reentrant.setAttribute('data-component', 'ReentrantOption');
      document.body.append(resilient, reentrant);
      await settle();

      resilient.setAttribute('data-option-first', '1');
      resilient.setAttribute('data-option-second', '2');
      reentrant.setAttribute('data-option-value', '1');
      await settle();

      expect(calls).toEqual(['second:0', 'second:2']);
      expect(events.map((event) => event.detail.error)).toEqual([cleanupFailure, handlerFailure]);
      expect(
        events.every((event) => event.detail.code === DIAGNOSTICS.component.lifecycleFailed),
      ).toBe(true);
      expect(events.every((event) => event.detail.component === 'ResilientOptions')).toBe(true);
      expect(getInstance<ReentrantOption>(reentrant, 'ReentrantOption').$isMounted).toBe(false);
    } finally {
      document.querySelectorAll('[data-component="ResilientOptions"]').forEach((el) => el.remove());
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

    el.setAttribute('data-option-speed', '9');
    // A boolean reads presence, so the off switch is the negated spelling.
    el.setAttribute('data-option-no-flag', '');
    el.setAttribute('data-option-list', '[2, 3]');
    expect(instance.$options.speed).toBe(9);
    expect(instance.$options.flag).toBe(false);
    expect(instance.$options.list).toEqual([2, 3]);

    el.setAttribute('data-option-list', '{oops');
    expect(instance.$options.list).toEqual([1]);
  });
});

describe('$el', () => {
  it('keeps the declared root element type at runtime', () => {
    class Panel extends Base<{ $el: HTMLDetailsElement }> {
      static config = { name: 'Panel' };

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
      <span data-ref="many[]"></span>
      <span data-ref="many[]"></span>
      <div data-component="Other"><span data-ref="own"></span></div>
    `;
    const instance = new Owner(el).$mount();

    expect(instance.$refs.own).toBe(el.querySelector('[data-ref="own"]'));
    expect(instance.$refs.many).toHaveLength(2);
    expect(el.querySelectorAll('[data-ref="own"]')).toHaveLength(2);
  });

  it('selects a list ref by its declared name, suffix included', () => {
    class Dotted extends Base {
      static config = { name: 'Dotted', refs: ['dots[]'] };
    }

    const el = document.createElement('div');
    el.innerHTML = '<i data-ref="dots[]"></i><i data-ref="dots[]"></i><i data-ref="dots"></i>';
    const instance = new Dotted(el).$mount();

    expect(instance.$refs.dots).toHaveLength(2);
    expect(instance.$refs.dots).toEqual([...el.querySelectorAll('[data-ref="dots[]"]')]);
  });

  it('names the element to fix when a list ref lost its suffix in the markup', () => {
    class Dropped extends Base {
      static config = { name: 'Dropped', refs: ['dots[]', 'title[]'] };
    }

    const el = document.createElement('div');
    el.innerHTML = '<i data-ref="dots"></i><i data-ref="dots"></i>';
    document.body.append(el);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const instance = new Dropped(el).$mount();

    expect(instance.$refs.dots).toEqual([]);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('data-ref="dots[]"');
    expect(warn.mock.calls[0][0]).toContain('Dropped');

    void instance.$refs.dots;
    void instance.$refs.dots;
    instance.$destroy().$mount();
    void instance.$refs.dots;
    expect(warn).toHaveBeenCalledOnce();

    expect(instance.$refs.title).toEqual([]);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('resolves a namespaced ref across an intervening component', () => {
    class App extends Base {
      static config = { name: 'NamespacedApp', refs: ['form'] };
    }

    const el = document.createElement('div');
    el.innerHTML = `
      <div data-component="NamespacedFrame">
        <form data-ref="NamespacedApp.form"></form>
        <span data-ref="form"></span>
      </div>
    `;
    const instance = new App(el).$mount();

    expect(instance.$refs.form).toBe(el.querySelector('form'));
    expect(instance.$refs.form).not.toBe(el.querySelector('span'));
  });

  it('spells a namespaced list ref with the suffix last', () => {
    class Modal extends Base {
      static config = { name: 'NamespacedModal', refs: ['close[]'] };
    }

    const el = document.createElement('div');
    el.innerHTML = `
      <div data-component="NamespacedPanel">
        <button data-ref="NamespacedModal.close[]"></button>
        <button data-ref="NamespacedModal.close[]"></button>
      </div>
      <button data-ref="close[]"></button>
    `;
    const instance = new Modal(el).$mount();

    expect(instance.$refs.close).toEqual([...el.querySelectorAll('button')]);
  });

  it('ignores a namespaced ref addressed to another component', () => {
    class Slider extends Base {
      static config = { name: 'NamespacedSlider', refs: ['next'] };
    }

    const el = document.createElement('div');
    el.innerHTML = '<button data-ref="Carousel.next"></button>';
    const instance = new Slider(el).$mount();

    expect(instance.$refs.next).toBeUndefined();
  });

  it('gives a namespaced ref to the nearest component of that name', () => {
    class Nested extends Base {
      static config = { name: 'NamespacedNested', refs: ['item'] };
    }

    const el = document.createElement('div');
    el.innerHTML = `
      <div data-component="NamespacedNested" id="inner">
        <span data-ref="NamespacedNested.item"></span>
      </div>
    `;
    const inner = el.querySelector<HTMLElement>('#inner') as HTMLElement;
    const outerInstance = new Nested(el).$mount();
    const innerInstance = new Nested(inner).$mount();

    expect(innerInstance.$refs.item).toBe(el.querySelector('span'));
    expect(outerInstance.$refs.item).toBeUndefined();
  });

  it('delegates on<Ref><Event> to a namespaced ref, named without its namespace', async () => {
    const seen: number[] = [];

    class Dialog extends Base {
      static config = { name: 'NamespacedDialog', refs: ['close[]'] };
      onCloseClick({ index }: RefEvent) {
        seen.push(index);
      }
    }

    const el = document.createElement('div');
    el.innerHTML = `
      <div data-component="NamespacedShell">
        <button data-ref="NamespacedDialog.close[]">a</button>
        <button data-ref="NamespacedDialog.close[]">b</button>
      </div>
    `;
    document.body.append(el);
    new Dialog(el).$mount();

    el.querySelectorAll('button')[1].click();
    await settle();
    expect(seen).toEqual([1]);
  });

  it('delegates on<Ref><Event> to a list ref through its suffixed attribute', async () => {
    const seen: number[] = [];

    class Tabs extends Base {
      static config = { name: 'RefSuffixTabs', refs: ['tab[]'] };
      onTabClick({ index }: RefEvent) {
        seen.push(index);
      }
    }

    const el = document.createElement('div');
    el.innerHTML = '<button data-ref="tab[]">a</button><button data-ref="tab[]">b</button>';
    document.body.append(el);
    new Tabs(el).$mount();

    el.querySelectorAll('button')[1].click();
    await settle();
    expect(seen).toEqual([1]);
  });

  it('stays live when the markup is replaced', async () => {
    class Swapped extends Base {
      static config = { name: 'Swapped', refs: ['title', 'items[]'] };
    }

    const el = document.createElement('div');
    el.innerHTML = '<h1 data-ref="title">before</h1><span data-ref="items[]"></span>';
    const instance = new Swapped(el).$mount();
    expect((instance.$refs.title as HTMLElement).textContent).toBe('before');
    expect(instance.$refs.items).toHaveLength(1);

    el.innerHTML =
      '<h1 data-ref="title">after</h1><span data-ref="items[]"></span><span data-ref="items[]"></span>';
    expect((instance.$refs.title as HTMLElement).textContent).toBe('after');
    expect(instance.$refs.title).toBe(el.querySelector('[data-ref="title"]'));
    expect(instance.$refs.items).toHaveLength(2);

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

    // The synchronous ref lookup must not consume records needed by the registry.
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
      <button data-ref="buttons[]">a</button>
      <button data-ref="buttons[]">b</button>
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
    added.setAttribute('data-ref', 'buttons[]');
    el.append(added);
    added.click();
    expect(instance.pressed).toEqual([2]);
  });

  it('ignores refs owned by a nested component', () => {
    const { el, instance } = render();

    const nested = document.createElement('div');
    nested.setAttribute('data-component', 'Other');
    nested.innerHTML = '<button data-ref="buttons[]">nested</button>';
    el.append(nested);
    nested.querySelector('button')?.click();
    expect(instance.pressed).toEqual([]);
  });
});

describe('onWindow<Event> / onDocument<Event> handlers', () => {
  class Outside extends Base {
    static config = { name: 'Outside' };

    resized: GlobalEvent[] = [];
    documentClicks: GlobalEvent<MouseEvent>[] = [];
    ownClicks: Event[] = [];
    scrolled: GlobalEvent[] = [];

    onWindowResize(payload: GlobalEvent): void {
      this.resized.push(payload);
    }

    onDocumentClick(payload: GlobalEvent<MouseEvent>): void {
      this.documentClicks.push(payload);
    }

    onClick(event: Event): void {
      this.ownClicks.push(event);
    }

    onDocumentScroll(payload: GlobalEvent): void {
      this.scrolled.push(payload);
    }
  }

  function render(): { el: HTMLElement; outside: HTMLElement; instance: Outside } {
    const el = document.createElement('div');
    const outside = document.createElement('div');
    document.body.append(el, outside);
    return { el, outside, instance: new Outside(el).$mount() };
  }

  it('binds to the global target the method names', () => {
    const { outside, instance } = render();

    window.dispatchEvent(new Event('resize'));
    outside.click();

    expect(instance.resized).toHaveLength(1);
    expect(instance.resized[0].target).toBe(window);
    expect(instance.documentClicks).toHaveLength(1);
    expect(instance.documentClicks[0].target).toBe(document);
    expect(instance.documentClicks[0].event.type).toBe('click');
  });

  it('keeps on<Event> and onDocument<Event> unambiguous on one component', () => {
    const { el, outside, instance } = render();

    outside.click();
    expect(instance.ownClicks).toHaveLength(0);
    expect(instance.documentClicks).toHaveLength(1);

    el.click();
    expect(instance.ownClicks).toHaveLength(1);
    expect(instance.documentClicks).toHaveLength(2);
  });

  it('reserves the prefixes against a same-named child or ref', () => {
    class WindowChild extends Base {
      static config = { name: 'Window' };
    }

    class Reserved extends Base {
      static config = {
        name: 'Reserved',
        components: { Window: WindowChild },
        refs: ['document'],
      };

      resized = 0;
      documentClicks = 0;

      onWindowResize(): void {
        this.resized += 1;
      }

      onDocumentClick(): void {
        this.documentClicks += 1;
      }
    }

    const el = document.createElement('div');
    el.innerHTML = '<span data-ref="document"></span>';
    document.body.append(el);
    const instance = new Reserved(el).$mount();

    window.dispatchEvent(new Event('resize'));
    el.querySelector('span')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(instance.resized).toBe(1);
    expect(instance.documentClicks).toBe(1);
  });

  it('listens in the bubble phase, so a descendant non-bubbling event is not heard', () => {
    const { el, instance } = render();

    // Global handlers use the bubble phase.
    el.dispatchEvent(new Event('scroll'));
    expect(instance.scrolled).toHaveLength(0);

    document.dispatchEvent(new Event('scroll'));
    expect(instance.scrolled).toHaveLength(1);
  });

  it('scopes the listeners to the mount cycle', () => {
    const { outside, instance } = render();

    instance.$destroy();
    window.dispatchEvent(new Event('resize'));
    outside.click();
    expect(instance.resized).toHaveLength(0);
    expect(instance.documentClicks).toHaveLength(0);

    instance.$mount();
    window.dispatchEvent(new Event('resize'));
    outside.click();
    expect(instance.resized).toHaveLength(1);
    expect(instance.documentClicks).toHaveLength(1);
  });
});

describe('the per-class handler plan', () => {
  class PlanItem extends Base {
    static config = { name: 'PlanItem' };

    pick(): void {
      this.$emit('pick');
    }
  }

  class Panel extends Base<{
    $refs: { close: HTMLButtonElement; tabs: HTMLButtonElement[] };
  }> {
    static config: BaseConfig = {
      name: 'PlanPanel',
      refs: ['close', 'tabs[]'],
      components: { PlanItem },
    };

    ownClicks = 0;
    closeClicks = 0;
    tabIndexes: number[] = [];
    picked: string[] = [];
    resizes = 0;

    onClick(): void {
      this.ownClicks += 1;
    }

    onCloseClick(): void {
      this.closeClicks += 1;
    }

    onTabsClick({ index }: RefEvent): void {
      this.tabIndexes.push(index);
    }

    onPlanItemPick({ target }: DelegatedEvent<PlanItem>): void {
      this.picked.push(target.$el.id);
    }

    onWindowResize(): void {
      this.resizes += 1;
    }
  }

  function markup(id: string): HTMLElement {
    const el = document.createElement('div');
    el.innerHTML = `
      <button data-ref="close"></button>
      <button data-ref="tabs[]"></button>
      <button data-ref="tabs[]"></button>
      <button data-ref="extra"></button>
      <div data-component="PlanItem" id="${id}"></div>
    `;
    document.body.append(el);
    return el;
  }

  function render(id: string): { el: HTMLElement; instance: Panel; item: PlanItem } {
    const el = markup(id);
    const instance = new Panel(el).$mount();
    const item = new PlanItem(el.querySelector('#' + id) as HTMLElement).$mount();
    return { el, instance, item };
  }

  const buttons = (el: HTMLElement) => [...el.querySelectorAll('button')];

  it('binds two instances of one class, each to its own subtree', () => {
    const a = render('a');
    const b = render('b');

    buttons(a.el)[0].click();
    expect(a.instance.closeClicks).toBe(1);
    expect(a.instance.ownClicks).toBe(1);
    expect(b.instance.closeClicks).toBe(0);
    expect(b.instance.ownClicks).toBe(0);

    buttons(b.el)[2].click();
    expect(b.instance.tabIndexes).toEqual([1]);
    expect(a.instance.tabIndexes).toEqual([]);

    b.item.pick();
    expect(b.instance.picked).toEqual(['b']);
    expect(a.instance.picked).toEqual([]);

    window.dispatchEvent(new Event('resize'));
    expect(a.instance.resizes).toBe(1);
    expect(b.instance.resizes).toBe(1);
  });

  it('rebinds every kind of handler on a remount', () => {
    const { el, instance, item } = render('remount');

    instance.$destroy();
    buttons(el)[0].click();
    buttons(el)[1].click();
    item.pick();
    window.dispatchEvent(new Event('resize'));
    expect(instance.closeClicks).toBe(0);
    expect(instance.tabIndexes).toEqual([]);
    expect(instance.picked).toEqual([]);
    expect(instance.resizes).toBe(0);

    instance.$mount();
    buttons(el)[0].click();
    buttons(el)[1].click();
    item.pick();
    window.dispatchEvent(new Event('resize'));
    expect(instance.closeClicks).toBe(1);
    expect(instance.tabIndexes).toEqual([0]);
    expect(instance.picked).toEqual(['remount']);
    expect(instance.resizes).toBe(1);
  });

  it('resolves a subclass against its own merged config, not its parent’s plan', () => {
    class ExtendedPanel extends Panel {
      static config: BaseConfig = { name: 'PlanExtendedPanel', refs: ['extra'] };

      extraClicks = 0;

      onExtraClick(): void {
        this.extraClicks += 1;
      }
    }

    const el = markup('sub');
    const instance = new ExtendedPanel(el).$mount();
    new PlanItem(el.querySelector('#sub') as HTMLElement).$mount();

    buttons(el)[3].click();
    expect(instance.extraClicks).toBe(1);
    buttons(el)[0].click();
    buttons(el)[2].click();
    expect(instance.closeClicks).toBe(1);
    expect(instance.tabIndexes).toEqual([1]);

    const parent = render('parent');
    buttons(parent.el)[3].click();
    buttons(parent.el)[1].click();
    expect(parent.instance.tabIndexes).toEqual([0]);
    expect(parent.instance.ownClicks).toBe(2);
  });

  it('skips a handler the instance shadows with a non-function', () => {
    class Maybe extends Base {
      static config: BaseConfig = { name: 'PlanMaybe' };

      clicks = 0;

      constructor(el: HTMLElement) {
        super(el);
        if (el.hasAttribute('data-mute')) {
          (this as unknown as Record<string, unknown>).onClick = null;
        }
      }

      onClick(): void {
        this.clicks += 1;
      }
    }

    const live = document.createElement('div');
    const muted = document.createElement('div');
    muted.setAttribute('data-mute', '');
    document.body.append(live, muted);

    const liveInstance = new Maybe(live).$mount();
    const mutedInstance = new Maybe(muted).$mount();

    const reported: unknown[] = [];
    const onError = (event: ErrorEvent) => {
      reported.push(event.error);
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    window.addEventListener('error', onError, { capture: true });
    try {
      live.click();
      muted.click();
    } finally {
      window.removeEventListener('error', onError, { capture: true });
    }

    expect(liveInstance.clicks).toBe(1);
    expect(mutedInstance.clicks).toBe(0);
    expect(reported).toEqual([]);
  });
});

describe('config inheritance', () => {
  it('merges refs, options and components with the parent config', () => {
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
    expect(child.$config.refs).toEqual(['one', 'two']);
    expect(Object.keys(child.$config.options ?? {})).toEqual(['a', 'b']);
    expect(Object.keys(child.$config.components ?? {})).toEqual(['TodoItem', 'TodoCount']);

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

  it('matches a class and every named subclass through initial and live updates', async () => {
    class Family extends Base {
      static config = { name: 'WatchFamily' };
      family = true;
    }
    class Alpha extends Family {
      static config = { name: 'WatchAlpha' };
    }
    class Beta extends Family {
      static config = { name: 'WatchBeta' };
    }
    class Gamma extends Family {
      static config = { name: 'WatchGamma' };
    }
    class Owner extends Family {
      static config = { name: 'WatchOwner' };
    }
    class Unrelated extends Base {
      static config = { name: 'WatchUnrelated' };
    }

    const root = document.createElement('div');
    root.innerHTML = `
      <div id="alpha"></div>
      <section>
        <div id="beta"></div>
        <div><div id="family"></div></div>
      </section>
      <div id="gamma"></div>
      <div id="unrelated"></div>
    `;
    document.body.append(root);

    const alpha = new Alpha(root.querySelector('#alpha') as HTMLElement);
    const beta = new Beta(root.querySelector('#beta') as HTMLElement);
    const family = new Family(root.querySelector('#family') as HTMLElement);
    const gamma = new Gamma(root.querySelector('#gamma') as HTMLElement);
    const unrelated = new Unrelated(root.querySelector('#unrelated') as HTMLElement);
    for (const instance of [unrelated, gamma, family, beta, alpha]) {
      instance.$mount();
    }
    alpha.$el[INSTANCES]?.set('WatchAlphaAlias', alpha);

    const owner = new Owner(root);
    const added: Family[] = [];
    const removed: Family[] = [];
    const collection = owner.$watchChildren(Family, {
      added(instance) {
        expectTypeOf(instance).toEqualTypeOf<Family>();
        added.push(instance);
      },
      removed(instance) {
        expectTypeOf(instance).toEqualTypeOf<Family>();
        removed.push(instance);
      },
    });
    expectTypeOf(collection).toEqualTypeOf<ChildrenCollection<Family>>();

    owner.$mount();
    await settle();

    expect(added).toEqual([alpha, beta, family, gamma]);
    expect(collection.items).toEqual([alpha, beta, family, gamma]);
    expect(collection.items).not.toContain(owner);
    expect(collection.items).not.toContain(unrelated);

    const outsideEl = document.createElement('div');
    document.body.append(outsideEl);
    new Alpha(outsideEl).$mount();
    expect(collection.size).toBe(4);

    const lateEl = document.createElement('div');
    root.querySelector('section')?.prepend(lateEl);
    const late = new Alpha(lateEl).$mount();
    expect(added.at(-1)).toBe(late);
    expect(collection.items).toEqual([alpha, late, beta, family, gamma]);

    beta.$destroy();
    expect(removed).toEqual([beta]);
    expect(collection.items).toEqual([alpha, late, family, gamma]);

    beta.$mount();
    expect(added.at(-1)).toBe(beta);
    expect(collection.items).toEqual([alpha, late, beta, family, gamma]);

    // The collection belongs to the instance, not to a mount cycle, so it
    // keeps adopting and dropping children while its owner is destroyed.
    owner.$destroy();
    const afterDestroy = new Gamma(root.appendChild(document.createElement('div'))).$mount();
    expect(collection.items).toContain(afterDestroy);
    alpha.$destroy();
    expect(collection.items).not.toContain(alpha);
  });

  it('keeps string matching as exact config.name matching', async () => {
    class Exact extends Base {
      static config = { name: 'WatchExact' };
    }
    class NamedSubclass extends Exact {
      static config = { name: 'WatchNamedSubclass' };
    }
    class Owner extends Base {
      static config = { name: 'WatchExactOwner' };
    }

    const root = document.createElement('div');
    root.innerHTML =
      '<div id="exact" data-component="WatchExact"></div>' +
      '<div id="subclass" data-component="WatchNamedSubclass"></div>';
    document.body.append(root);
    const exact = new Exact(root.querySelector('#exact') as HTMLElement).$mount();
    const subclass = new NamedSubclass(root.querySelector('#subclass') as HTMLElement).$mount();
    const owner = new Owner(root).$mount();
    const collection = owner.$watchChildren<Exact>('WatchExact');
    await settle();

    expect(collection.items).toEqual([exact]);
    expect(collection.items).not.toContain(subclass);

    const lateSubclassEl = root.appendChild(document.createElement('div'));
    lateSubclassEl.setAttribute('data-component', 'WatchNamedSubclass');
    const lateSubclass = new NamedSubclass(lateSubclassEl).$mount();
    expect(collection.items).toEqual([exact]);
    expect(collection.items).not.toContain(lateSubclass);

    const lateExactEl = root.appendChild(document.createElement('div'));
    lateExactEl.setAttribute('data-component', 'WatchExact');
    const lateExact = new Exact(lateExactEl).$mount();
    expect(collection.items).toEqual([exact, lateExact]);
  });

  it('does not announce or retain a child destroyed from mounted()', async () => {
    class Child extends Base {
      static config = { name: 'WatchSelfDestroyingChild' };

      mounted(): void {
        this.$destroy();
      }
    }
    class Owner extends Base {
      static config = { name: 'WatchSelfDestroyingOwner' };
    }

    const root = document.createElement('div');
    const childEl = root.appendChild(document.createElement('div'));
    document.body.append(root);
    const owner = new Owner(root);
    const collection = owner.$watchChildren(Child);
    owner.$mount();
    let announcements = 0;
    root.addEventListener(EVENTS.component.mounted, () => {
      announcements += 1;
    });

    const child = new Child(childEl).$mount();
    await settle();

    expect(child.$isMounted).toBe(false);
    expect(announcements).toBe(0);
    expect(collection.size).toBe(0);

    childEl.dispatchEvent(
      new CustomEvent(EVENTS.component.mounted, { bubbles: true, detail: { instance: child } }),
    );
    expect(collection.size).toBe(0);
    owner.$destroy();
  });

  it('serves every watcher from one shared document listener', async () => {
    class Child extends Base {
      static config = { name: 'WatchSharedChild' };
    }
    class Owner extends Base {
      static config = { name: 'WatchSharedOwner' };
    }

    const root = document.createElement('div');
    document.body.append(root);
    // Attach the shared listener first, so the counts below do not depend on
    // whether another spec in this file already created a watcher.
    new Owner(root).$watchChildren(Child);

    const attach = vi.spyOn(document, 'addEventListener');
    const detach = vi.spyOn(document, 'removeEventListener');
    for (let index = 0; index < 20; index += 1) {
      new Owner(root.appendChild(document.createElement('div'))).$watchChildren(Child);
    }

    // A listener per watcher is what made a watching component immortal: the
    // document held the instance, and nothing on the teardown path took it
    // back. Twenty more watchers must add none.
    expect(attach).not.toHaveBeenCalled();
    expect(detach).not.toHaveBeenCalled();

    attach.mockRestore();
    detach.mockRestore();
    await settle();
  });

  it('removes a destroyed child from every watcher of it', async () => {
    class Child extends Base {
      static config = { name: 'WatchFanoutChild' };
    }
    class Owner extends Base {
      static config = { name: 'WatchFanoutOwner' };
    }

    const root = document.createElement('div');
    const childEl = root.appendChild(document.createElement('div'));
    document.body.append(root);
    const child = new Child(childEl).$mount();
    const first = new Owner(root);
    const second = new Owner(root);
    const firstCollection = first.$watchChildren(Child);
    const secondCollection = second.$watchChildren(Child);
    await settle();

    expect(firstCollection.items).toEqual([child]);
    expect(secondCollection.items).toEqual([child]);

    child.$destroy();

    expect(firstCollection.size).toBe(0);
    expect(secondCollection.size).toBe(0);
  });
});

describe('lifecycle', () => {
  it('reports synchronous and asynchronous mounted failures once without stopping mount', async () => {
    const synchronousFailure = new Error('synchronous mounted failure');
    const asynchronousFailure = new Error('asynchronous mounted failure');
    const events: CustomEvent<ToolkitDiagnosticDetail>[] = [];
    let mountedEvents = 0;

    class SynchronousFailure extends Base {
      static config = { name: 'SynchronousMountedFailure' };

      mounted(): void {
        throw synchronousFailure;
      }
    }

    class AsynchronousFailure extends Base {
      static config = { name: 'AsynchronousMountedFailure' };

      async mounted(): Promise<void> {
        throw asynchronousFailure;
      }
    }

    const synchronousElement = document.createElement('div');
    const asynchronousElement = document.createElement('div');
    document.body.append(synchronousElement, asynchronousElement);
    for (const el of [synchronousElement, asynchronousElement]) {
      el.addEventListener(EVENTS.diagnostic, (event) => {
        event.preventDefault();
        events.push(event as CustomEvent<ToolkitDiagnosticDetail>);
      });
      el.addEventListener(EVENTS.component.mounted, () => {
        mountedEvents += 1;
      });
    }

    const synchronous = new SynchronousFailure(synchronousElement).$mount();
    const asynchronous = new AsynchronousFailure(asynchronousElement).$mount();
    await settle();

    expect(events).toHaveLength(2);
    expect(events.map((event) => event.target)).toEqual([synchronousElement, asynchronousElement]);
    expect(events.map((event) => event.detail)).toEqual([
      {
        severity: 'error',
        code: DIAGNOSTICS.component.lifecycleFailed,
        message: '`mounted()` failed.',
        error: synchronousFailure,
        component: 'SynchronousMountedFailure',
      },
      {
        severity: 'error',
        code: DIAGNOSTICS.component.lifecycleFailed,
        message: '`mounted()` failed.',
        error: asynchronousFailure,
        component: 'AsynchronousMountedFailure',
      },
    ]);
    expect(events.every((event) => event.cancelable && event.defaultPrevented)).toBe(true);
    expect(synchronous.$isMounted).toBe(true);
    expect(asynchronous.$isMounted).toBe(true);
    expect(mountedEvents).toBe(2);
  });

  it('reports cleanup and destroyed failures without stopping teardown', () => {
    const cleanupFailure = new Error('cleanup failure');
    const destroyedFailure = new Error('destroyed failure');
    const events: CustomEvent<ToolkitDiagnosticDetail>[] = [];

    class TeardownFailure extends Base {
      static config = { name: 'TeardownFailure' };

      mounted() {
        return () => {
          throw cleanupFailure;
        };
      }

      destroyed(): void {
        throw destroyedFailure;
      }
    }

    const el = document.createElement('div');
    document.body.append(el);
    el.addEventListener(EVENTS.diagnostic, (event) => {
      event.preventDefault();
      events.push(event as CustomEvent<ToolkitDiagnosticDetail>);
    });
    const instance = new TeardownFailure(el).$mount();

    instance.$destroy();

    expect(events.map((event) => event.detail.error)).toEqual([cleanupFailure, destroyedFailure]);
    expect(
      events.every((event) => event.detail.code === DIAGNOSTICS.component.lifecycleFailed),
    ).toBe(true);
    expect(events.every((event) => event.detail.component === 'TeardownFailure')).toBe(true);
    expect(events.every((event) => event.defaultPrevented)).toBe(true);
    expect(instance.$isMounted).toBe(false);
    // Destroy is reversible, so the instance stays on its element for a later
    // mount even when both its hooks threw.
    expect(el[INSTANCES]?.get('TeardownFailure')).toBe(instance);
  });

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

  it('makes destroy the reversible inverse of mount, as many times as asked', async () => {
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
    }

    const el = document.createElement('div');
    document.body.append(el);
    const instance = new Tracked(el);

    instance.$mount();
    instance.$destroy();
    expect(calls).toEqual(['mounted', 'cleanup', 'destroyed']);

    instance.$mount();
    expect(instance.$isMounted).toBe(true);
    expect(el[INSTANCES]?.get('Tracked')).toBe(instance);

    // Mount and destroy are the whole lifecycle: neither is one-way, and the
    // instance stays on its element between them, which is what lets a moved
    // or re-inserted element keep its identity.
    instance.$destroy();
    expect(calls).toEqual(['mounted', 'cleanup', 'destroyed', 'mounted', 'cleanup', 'destroyed']);
    expect(el[INSTANCES]?.get('Tracked')).toBe(instance);

    instance.$mount();
    expect(instance.$isMounted).toBe(true);
    expect(calls.filter((call) => call === 'mounted')).toHaveLength(3);
  });

  it('runs a task scheduled by a mount cleanup, and cancels the cycle it left behind', async () => {
    const ran: string[] = [];

    class Resetting extends Base {
      static config = { name: 'Resetting' };
      mounted() {
        this.$write(() => ran.push('during-cycle'));
        return () => {
          this.$write(() => ran.push('cleanup'));
        };
      }
      destroyed(): void {
        this.$write(() => ran.push('destroyed'));
      }
    }

    const el = document.createElement('div');
    document.body.append(el);
    const instance = new Resetting(el).$mount();
    instance.$destroy();

    await settle();
    expect(ran).toEqual(['cleanup', 'destroyed']);
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

  it('keeps recursive async cleanups with the mount cycle that produced them', async () => {
    const calls: string[] = [];
    const resolvers: Array<(result: MountedReturn) => void> = [];
    let mounts = 0;

    class Cycled extends Base {
      static config = { name: 'CycledAsyncCleanup' };

      mounted(): MountedReturn {
        mounts += 1;
        return new Promise<MountedReturn>((resolve) => {
          resolvers.push((result) => resolve(result));
        });
      }
    }

    const el = document.createElement('div');
    document.body.append(el);
    const instance = new Cycled(el).$mount();
    instance.$destroy();
    instance.$mount();

    resolvers[0]([Promise.resolve([() => calls.push('cleanup:1')])]);
    await settle();
    expect(mounts).toBe(2);
    expect(instance.$isMounted).toBe(true);
    expect(calls).toEqual(['cleanup:1']);

    resolvers[1]([() => calls.push('cleanup:2')]);
    await settle();
    expect(calls).toEqual(['cleanup:1']);
    instance.$destroy();
    expect(calls).toEqual(['cleanup:1', 'cleanup:2']);
  });
});
