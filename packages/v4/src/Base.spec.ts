import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  Base,
  type BaseConfig,
  type GlobalEvent,
  type OptionChange,
  type RefEvent,
} from './Base.js';
import type { AttributeChange } from './dom-mutations.js';
import { registerComponent } from './registry.js';
import { SWAP_MODES, swap } from './swap.js';
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

    const event = instance.$emit('ping', { count: 1, label: 'two' });
    // The detail is the payload object itself, not a wrapper around it.
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
    // Not `{}` and not `[]`: `$emit('open')` announces a fact, and nothing is
    // synthesized to stand in for a payload nobody sent. `null` is what
    // `new CustomEvent('ping')` stores, so the platform sets this, not us.
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

    // What the no-build path can write and TypeScript never sees.
    (instance.$emit as (type: string, payload?: unknown) => void)('ping', 1);

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('one payload object');
    expect(seen).toEqual([1]);
    warn.mockRestore();
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

  /**
   * The no-build path, which is the audience the type-level ban on a literal
   * `Object`/`Array` default cannot reach. The copy has to go all the way
   * down: a shallow one gave every instance its own outer object and *the
   * same* nested one, which is the same bug one level in.
   */
  it('copies a literal default all the way down', () => {
    class Literal extends Base<{
      $options: { tween: Record<string, Record<string, number>>; matrix: number[][] };
    }> {
      // Cast on purpose: `TypedOptionDefinition` bans a literal `Object`/
      // `Array` default, and the no-build path never sees that ban. This is
      // what it runs.
      static config = {
        name: 'Literal',
        options: {
          tween: { type: Object, default: { ease: { in: 1, out: 2 } } },
          matrix: { type: Array, default: [[1], [2]] },
        },
      } as unknown as BaseConfig;
    }

    const first = new Literal(document.createElement('div'));
    const second = new Literal(document.createElement('div'));

    expect(first.$options.tween).not.toBe(second.$options.tween);
    expect(first.$options.tween.ease).not.toBe(second.$options.tween.ease);
    expect(first.$options.matrix[0]).not.toBe(second.$options.matrix[0]);

    first.$options.tween.ease.in = 99;
    first.$options.matrix[0].push(42);
    expect(second.$options.tween).toEqual({ ease: { in: 1, out: 2 } });
    expect(second.$options.matrix).toEqual([[1], [2]]);
  });

  it('hands over a default it cannot rebuild rather than guessing', () => {
    const shared = new Date(0);

    class Exotic extends Base<{ $options: { at: Record<string, unknown> } }> {
      static config = {
        name: 'Exotic',
        options: { at: { type: Object, default: { stamp: shared } } },
      } as unknown as BaseConfig;
    }

    const first = new Exotic(document.createElement('div'));
    const second = new Exotic(document.createElement('div'));

    // The plain wrapper is the instance's own; the `Date` inside it is not,
    // because copying it would mean guessing at its constructor.
    expect(first.$options.at).not.toBe(second.$options.at);
    expect(first.$options.at.stamp).toBe(shared);
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

  /**
   * REPORT.md gap 9. Without `merge`, an attribute replaces the default
   * outright, so overriding one key of a settings object means restating every
   * other one in the markup.
   */
  it('completes the default with the attribute when the option declares merge', () => {
    class Merged extends Base<{
      $options: {
        styles: Record<string, unknown>;
        plain: Record<string, unknown>;
        list: number[];
      };
    }> {
      static config = {
        name: 'Merged',
        options: {
          styles: {
            type: Object,
            default: () => ({ display: 'none', tween: { ease: 'linear', duration: 1 } }),
            merge: true,
          },
          // The same default without `merge`, for the contrast.
          plain: { type: Object, default: () => ({ display: 'none' }) },
          list: { type: Array, default: () => [1], merge: true },
        },
      };
    }

    const el = document.createElement('div');
    const instance = new Merged(el);

    // Nothing to merge with: the default stands.
    expect(instance.$options.styles).toEqual({
      display: 'none',
      tween: { ease: 'linear', duration: 1 },
    });

    el.setAttribute('data-option-styles', '{"opacity":1,"tween":{"ease":"ease-out"}}');
    el.setAttribute('data-option-plain', '{"opacity":1}');
    el.setAttribute('data-option-list', '[2,3]');

    // Objects recurse key by key, arrays concatenate — v3's rules, which were
    // `deepmerge`'s.
    expect(instance.$options.styles).toEqual({
      display: 'none',
      opacity: 1,
      tween: { ease: 'ease-out', duration: 1 },
    });
    expect(instance.$options.list).toEqual([1, 2, 3]);
    // Without `merge`, the attribute replaces the default outright.
    expect(instance.$options.plain).toEqual({ opacity: 1 });

    // The merge borrows the memoised default; it must not consume it.
    el.removeAttribute('data-option-styles');
    el.removeAttribute('data-option-list');
    expect(instance.$options.styles).toEqual({
      display: 'none',
      tween: { ease: 'linear', duration: 1 },
    });
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
      <span data-ref="many[]"></span>
      <span data-ref="many[]"></span>
      <div data-component="Other"><span data-ref="own"></span></div>
    `;
    const instance = new Owner(el).$mount();

    expect(instance.$refs.own).toBe(el.querySelector('[data-ref="own"]'));
    expect(instance.$refs.many).toHaveLength(2);
    // The ref nested in another component does not belong to this one.
    expect(el.querySelectorAll('[data-ref="own"]')).toHaveLength(2);
  });

  /**
   * REPORT.md gap 11. The `[]` of a list ref is part of the attribute, not
   * only of the declaration — v3's spelling, and the one ui's templates,
   * fixtures and documentation are written in. One spelling, not two: the
   * unsuffixed attribute is a different ref, and a list definition does not
   * match it.
   */
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

    // Once per instance and per ref, whatever the read count.
    void instance.$refs.dots;
    void instance.$refs.dots;
    expect(warn).toHaveBeenCalledOnce();

    // A list ref that is simply absent says nothing: there is nothing to fix.
    expect(instance.$refs.title).toEqual([]);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
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

    // A Fetch-style swap: brand new elements, no $update() call.
    el.innerHTML =
      '<h1 data-ref="title">after</h1><span data-ref="items[]"></span><span data-ref="items[]"></span>';
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
    // Third button, no rebinding needed.
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

    // The component's own element, side by side with the global handler
    // above: two different method names, two different targets.
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

    // A click on the component's own element is both: it is the element's
    // event, and it bubbles to the document.
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
    // The declared ref, clicked: it is not what `onDocumentClick` resolves
    // to, but the click does reach the document.
    el.querySelector('span')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(instance.resized).toBe(1);
    expect(instance.documentClicks).toBe(1);
  });

  it('listens in the bubble phase, so a descendant non-bubbling event is not heard', () => {
    const { el, instance } = render();

    // `scroll` from an inner element does not bubble: only a capture-phase
    // listener would see it, and a global handler is not delegation.
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

/**
 * The attribute nothing can enumerate: its name is any DOM event, so no
 * parse-time registration is ever complete and the page-wide
 * `attributeFilter` cannot hold it. This is the `Action` port's primary form.
 */
const VIRTUAL_ATTRIBUTE = 'data-on:click';

class AttributeProbe extends Base {
  static config = { name: 'AttributeProbe' };

  changes: AttributeChange[] = [];

  mounts = 0;

  mounted() {
    this.mounts += 1;
    return this.$watchAttributes((change) => this.changes.push(change));
  }
}

registerComponent(AttributeProbe);

function renderProbe(attributes: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-component', 'AttributeProbe');
  for (const [name, value] of Object.entries(attributes)) {
    el.setAttribute(name, value);
  }
  document.body.append(el);
  return el;
}

describe('$watchAttributes', () => {
  it('reports an attribute the framework never named, with both values', async () => {
    const el = renderProbe();
    await settle();
    const probe = getInstance<AttributeProbe>(el, 'AttributeProbe');

    el.setAttribute(VIRTUAL_ATTRIBUTE, 'open()');
    await settle();
    expect(probe.changes).toEqual([
      { name: VIRTUAL_ATTRIBUTE, value: 'open()', previousValue: null },
    ]);

    el.setAttribute(VIRTUAL_ATTRIBUTE, 'close()');
    await settle();
    expect(probe.changes).toHaveLength(2);
    expect(probe.changes[1]).toEqual({
      name: VIRTUAL_ATTRIBUTE,
      value: 'close()',
      previousValue: 'open()',
    });
  });

  it('reports a removal as a null value', async () => {
    const el = renderProbe({ [VIRTUAL_ATTRIBUTE]: 'open()' });
    await settle();
    const probe = getInstance<AttributeProbe>(el, 'AttributeProbe');

    el.removeAttribute(VIRTUAL_ATTRIBUTE);
    await settle();
    expect(probe.changes).toEqual([
      { name: VIRTUAL_ATTRIBUTE, value: null, previousValue: 'open()' },
    ]);
  });

  it('reports nothing for another element, including its own descendants', async () => {
    const el = renderProbe();
    el.innerHTML = '<span></span>';
    const sibling = document.createElement('div');
    document.body.append(sibling);
    await settle();
    const probe = getInstance<AttributeProbe>(el, 'AttributeProbe');

    sibling.setAttribute(VIRTUAL_ATTRIBUTE, 'sibling');
    el.firstElementChild?.setAttribute(VIRTUAL_ATTRIBUTE, 'child');
    await settle();
    expect(probe.changes).toEqual([]);

    // The same write on the element itself is reported, so the silence above
    // is the scope and not a broken subscription.
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'own');
    await settle();
    expect(probe.changes).toHaveLength(1);
  });

  it('coalesces one batch to one change, and reports none when it nets out', async () => {
    const el = renderProbe({ [VIRTUAL_ATTRIBUTE]: 'a' });
    await settle();
    const probe = getInstance<AttributeProbe>(el, 'AttributeProbe');

    el.setAttribute(VIRTUAL_ATTRIBUTE, 'b');
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'c');
    await settle();
    expect(probe.changes).toEqual([{ name: VIRTUAL_ATTRIBUTE, value: 'c', previousValue: 'a' }]);

    // Written away and written back inside one batch: the DOM never changed
    // as far as anything downstream is concerned.
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'd');
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'c');
    await settle();
    expect(probe.changes).toHaveLength(1);
  });

  it('disconnects the observer on destroy and observes again on remount', async () => {
    const el = renderProbe();
    await settle();
    const probe = getInstance<AttributeProbe>(el, 'AttributeProbe');

    el.remove();
    await settle();
    expect(probe.$isMounted).toBe(false);

    // A MutationObserver keeps observing a detached element, so this is the
    // write that proves the observer is gone rather than merely idle.
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'while-detached');
    await settle();
    expect(probe.changes).toEqual([]);

    document.body.append(el);
    await settle();
    expect(probe.mounts).toBe(2);
    expect(probe.$isMounted).toBe(true);

    el.setAttribute(VIRTUAL_ATTRIBUTE, 'after-remount');
    await settle();
    expect(probe.changes).toEqual([
      { name: VIRTUAL_ATTRIBUTE, value: 'after-remount', previousValue: 'while-detached' },
    ]);
  });

  it('ends early through the returned cleanup, which is idempotent', async () => {
    const el = renderProbe();
    await settle();
    const probe = getInstance<AttributeProbe>(el, 'AttributeProbe');

    const seen: AttributeChange[] = [];
    const stop = probe.$watchAttributes((change) => seen.push(change));

    el.setAttribute(VIRTUAL_ATTRIBUTE, 'one');
    await settle();
    expect(seen).toHaveLength(1);

    stop();
    stop();
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'two');
    await settle();
    expect(seen).toHaveLength(1);
    // The component's own subscription is untouched: two watchers, one element.
    expect(probe.changes).toHaveLength(2);
  });

  it('stays silent for a component the same batch has just terminated', async () => {
    const el = renderProbe({ [VIRTUAL_ATTRIBUTE]: 'open()' });
    await settle();
    const probe = getInstance<AttributeProbe>(el, 'AttributeProbe');

    // One batch, and the order inside it is the whole point: the element
    // stops declaring the component *and* rewrites the watched attribute.
    // Component reconciliation runs first, so this instance is terminated —
    // and therefore no longer watching — before any watcher is told anything.
    // Delivering straight from the element observer would instead report a
    // change to an instance the framework had already ended.
    el.setAttribute('data-component', '');
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'close()');
    await settle();

    expect(probe.$isTerminated).toBe(true);
    expect(probe.changes).toEqual([]);
  });

  it('reaches a watching component through an in-place morph rewrite', async () => {
    const container = document.createElement('div');
    container.innerHTML = `<p data-component="AttributeProbe" ${VIRTUAL_ATTRIBUTE}="open()">hello</p>`;
    document.body.append(container);
    await settle();

    const el = container.firstElementChild as HTMLElement;
    const probe = getInstance<AttributeProbe>(el, 'AttributeProbe');
    expect(probe.$isMounted).toBe(true);

    await swap(
      container,
      `<p data-component="AttributeProbe" ${VIRTUAL_ATTRIBUTE}="close()">hello</p>`,
      { mode: SWAP_MODES.MORPH },
    );

    // The element was rewritten, not replaced: same node, same instance, same
    // mount cycle — which is exactly why nothing else could have told the
    // component that its binding changed.
    expect(container.firstElementChild).toBe(el);
    expect(getInstance<AttributeProbe>(el, 'AttributeProbe')).toBe(probe);
    expect(probe.mounts).toBe(1);
    expect(probe.$isMounted).toBe(true);
    // No `settle()` above: `swap()` resolves once the framework has caught up,
    // and a watched attribute is part of catching up.
    expect(probe.changes).toEqual([
      { name: VIRTUAL_ATTRIBUTE, value: 'close()', previousValue: 'open()' },
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

  /**
   * REPORT.md gap 5. Cancelling the pending tasks *after* the cleanups took
   * the work the teardown itself had just scheduled, so "reset my styles on
   * the way out" — written the only way the framework offers — never ran.
   */
  it('runs a task scheduled by a mount cleanup, and cancels the cycle it left behind', async () => {
    const ran: string[] = [];

    class Resetting extends Base {
      static config = { name: 'Resetting' };
      mounted() {
        // In flight when the instance goes: this one belongs to the cycle and
        // must not survive it.
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
});
