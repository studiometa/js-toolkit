import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Base, registerComponents, swap, SWAP_MODES, type BaseConfig } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Dialog } from '../Dialog/Dialog.js';
import { Action } from './Action.js';
import { ActionEvent } from './ActionEvent.js';
import { Target } from './Target.js';

/**
 * Specs for the `Action` port.
 *
 * ## How these differ from ui's
 *
 * ui's specs build instances by hand — `new Action(h('div'))`, then
 * `mount(action, target)` — on elements that are never in the document. v4
 * has no such state: the registry creates an instance on first mount, from an
 * element that is in the DOM. So every spec here renders real markup and lets
 * the registry do the mounting, which is also what a v4 consumer writes.
 *
 * That adaptation is not cosmetic for this family: `Action`'s whole job is
 * finding *other* components, and the port resolves them from the document
 * (see `instances.ts`). A detached-element spec could not exercise it at all.
 *
 * ## Deliberately not ported
 *
 * - ui's `configures the addEventListener options` spec asserted
 *   `addEventListener('click', actionEvent, {…})` — the `EventListenerObject`
 *   identity. v4's `$on` takes an `EventListener`, so the port passes a
 *   closure. The **options** are the contract and they are asserted below;
 *   the listener identity is incidental mechanics.
 * - ui's `it.todo` for unparseable target strings is implemented instead, as
 *   `ignores a target part it cannot parse`.
 * - The fake-timer debounce specs are re-timed against real timers with short
 *   delays. Browser-mode fake timers would work, but the assertion worth
 *   keeping is "the effect ran once, late", not the timer bookkeeping.
 */

class Foo extends Base {
  static config: BaseConfig = { name: 'Foo' };

  calls: unknown[][] = [];

  fn(...args: unknown[]): void {
    this.calls.push(args);
  }
}

class Bar extends Base {
  static config: BaseConfig = { name: 'Bar' };
}

/**
 * Counts mount cycles from the same element as the component under test.
 *
 * Declared alongside an `Action` rather than built into it: a mount counter is
 * test scaffolding, and a co-located component destroys and remounts on
 * exactly the same schedule, so it measures the thing without being it.
 */
class MountProbe extends Base {
  static config: BaseConfig = { name: 'MountProbe' };

  mounts = 0;

  mounted(): void {
    this.mounts += 1;
  }
}

registerComponents(Action, Target, Foo, Bar, Dialog, MountProbe);

afterEach(resetDom);

async function render(html: string): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  await settle();
  return root;
}

function at<T extends Base>(root: ParentNode, selector: string, name: string): T {
  return getInstance<T>(root.querySelector(selector), name);
}

function click(el: Element): Event {
  const event = new Event('click', { bubbles: true, cancelable: true });
  el.dispatchEvent(event);
  return event;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('ActionEvent — parsing and the effect evaluator', () => {
  it('compiles a callable effect from the effect definition', async () => {
    const root = await render('<div id="action" data-component="Action"></div>');
    const action = at<Action>(root, '#action', 'Action');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const actionEvent = new ActionEvent(action, 'click', 'console.log(ctx)');
    actionEvent.effect('foo');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('foo');
    spy.mockRestore();
  });

  it('returns a callable function from the effect property', async () => {
    const root = await render('<div id="action" data-component="Action"></div>');
    const action = at<Action>(root, '#action', 'Action');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const actionEvent = new ActionEvent(action, 'click', '(...args) => console.log(...args)');
    const callback = actionEvent.effect() as (...args: unknown[]) => void;

    expect(typeof callback).toBe('function');
    callback('foo');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('foo');
    spy.mockRestore();
  });

  it('parses modifiers and the debounce delay', async () => {
    const root = await render('<div id="action" data-component="Action"></div>');
    const action = at<Action>(root, '#action', 'Action');

    const plain = new ActionEvent(action, 'click.prevent.stop', 'target');
    expect(plain.event).toBe('click');
    expect(plain.modifiers).toEqual(['prevent', 'stop']);
    expect(plain.debounceDelay).toBe(100);

    const debounced = new ActionEvent(action, 'scroll.debounce300', 'target');
    expect(debounced.modifiers).toEqual(['debounce']);
    expect(debounced.debounceDelay).toBe(300);
  });

  it('splits the target definition from the effect', async () => {
    const root = await render('<div id="action" data-component="Action"></div>');
    const action = at<Action>(root, '#action', 'Action');

    const actionEvent = new ActionEvent(action, 'click', ' Target(#a) Foo -> target.fn() ');
    expect(actionEvent.targetDefinition).toBe('Target(#a) Foo');
    expect(actionEvent.effectDefinition).toBe('target.fn()');
  });
});

describe('ActionEvent — target resolution', () => {
  it('resolves the target to the action itself when no target is set', async () => {
    const root = await render('<div id="action" data-component="Action"></div>');
    const action = at<Action>(root, '#action', 'Action');

    const actionEvent = new ActionEvent(action, 'click', '(...args) => args');
    expect(actionEvent.targets).toEqual([{ Action: action }]);
  });

  it('resolves a single target', async () => {
    const root = await render(`
      <div id="action" data-component="Action"></div>
      <div id="target" data-component="Target"></div>
    `);
    const action = at<Action>(root, '#action', 'Action');
    const target = at<Target>(root, '#target', 'Target');

    const actionEvent = new ActionEvent(action, 'click', 'Target -> target');
    expect(actionEvent.targets).toEqual([{ Target: target }]);
  });

  it('resolves multiple targets', async () => {
    const root = await render(`
      <div id="action" data-component="Action"></div>
      <div id="target" data-component="Target"></div>
      <div id="foo" data-component="Foo"></div>
    `);
    const action = at<Action>(root, '#action', 'Action');
    const target = at<Target>(root, '#target', 'Target');
    const foo = at<Foo>(root, '#foo', 'Foo');

    const actionEvent = new ActionEvent(action, 'click', 'Target Foo -> target');
    expect(actionEvent.targets).toEqual([{ Target: target }, { Foo: foo }]);
  });

  it('resolves targets narrowed by a selector', async () => {
    const root = await render(`
      <div id="action" data-component="Action"></div>
      <div id="a" data-component="Target"></div>
      <div id="b" data-component="Target"></div>
    `);
    const action = at<Action>(root, '#action', 'Action');
    const targetA = at<Target>(root, '#a', 'Target');

    const actionEvent = new ActionEvent(action, 'click', 'Target(#a) -> target');
    expect(actionEvent.targets).toEqual([{ Target: targetA }]);
  });

  it('ignores a target part it cannot parse', async () => {
    const root = await render(`
      <div id="action" data-component="Action"></div>
      <div id="target" data-component="Target"></div>
    `);
    const action = at<Action>(root, '#action', 'Action');
    const target = at<Target>(root, '#target', 'Target');

    // `123` matches no name; v3's `it.todo` said this must fail silently.
    const actionEvent = new ActionEvent(action, 'click', '123 Target -> target');
    expect(actionEvent.targets).toEqual([{ Target: target }]);
  });

  it('reaches a target that is neither a descendant nor an ancestor', async () => {
    // The case the port exists to answer. `$query` sees descendants,
    // `$closest` sees ancestors; this target is in a sibling subtree, which
    // is where every documented `Action` example puts it.
    const root = await render(`
      <section><button id="action" data-component="Action"
        data-on:click="Foo -> target.fn('far')"></button></section>
      <section><div><div id="foo" data-component="Foo"></div></div></section>
    `);
    const foo = at<Foo>(root, '#foo', 'Foo');

    click(root.querySelector('#action') as Element);
    expect(foo.calls).toEqual([['far']]);
  });

  it('resolves targets at event time, so a target mounting later is reached', async () => {
    const root = await render(`
      <button id="action" data-component="Action" data-on:click="Foo -> target.fn()"></button>
    `);

    click(root.querySelector('#action') as Element);

    const late = document.createElement('div');
    late.id = 'late';
    late.setAttribute('data-component', 'Foo');
    root.append(late);
    await settle();

    click(root.querySelector('#action') as Element);
    expect(at<Foo>(root, '#late', 'Foo').calls).toHaveLength(1);
  });

  it('stops targeting a component once it is destroyed', async () => {
    const root = await render(`
      <button id="action" data-component="Action" data-on:click="Foo -> target.fn()"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const foo = at<Foo>(root, '#foo', 'Foo');

    click(root.querySelector('#action') as Element);
    expect(foo.calls).toHaveLength(1);

    (root.querySelector('#foo') as Element).remove();
    await settle();

    click(root.querySelector('#action') as Element);
    expect(foo.calls).toHaveLength(1);
  });
});

describe('ActionEvent — modifiers', () => {
  it('prevents default and stops propagation', async () => {
    const root = await render(`
      <div id="outer">
        <button id="action" data-component="Action"
          data-on:click.prevent.stop="Foo -> target.fn()"></button>
      </div>
      <div id="foo" data-component="Foo"></div>
    `);
    let bubbled = 0;
    (root.querySelector('#outer') as Element).addEventListener('click', () => {
      bubbled += 1;
    });

    const event = click(root.querySelector('#action') as Element);

    expect(event.defaultPrevented).toBe(true);
    expect(bubbled).toBe(0);
    expect(at<Foo>(root, '#foo', 'Foo').calls).toHaveLength(1);
  });

  it('forwards capture, once and passive to the listener options', async () => {
    const root = await render('<div id="action" data-component="Action"></div>');
    const action = at<Action>(root, '#action', 'Action');
    const spy = vi.spyOn(action.$el, 'addEventListener');

    const release = new ActionEvent(action, 'click.capture.once.passive', 'target').attach();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('click', expect.any(Function), {
      capture: true,
      once: true,
      passive: true,
    });
    release();
    spy.mockRestore();
  });

  it('runs a `once` binding exactly once', async () => {
    const root = await render(`
      <button id="action" data-component="Action" data-on:click.once="Foo -> target.fn()"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as Element;

    click(button);
    click(button);

    expect(at<Foo>(root, '#foo', 'Foo').calls).toHaveLength(1);
  });

  it('debounces with the default delay', async () => {
    const root = await render(`
      <button id="action" data-component="Action"
        data-on:click.debounce="Foo -> target.fn()"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as Element;
    const foo = at<Foo>(root, '#foo', 'Foo');

    click(button);
    click(button);
    click(button);
    expect(foo.calls).toHaveLength(0);

    await wait(50);
    expect(foo.calls).toHaveLength(0);

    await wait(120);
    expect(foo.calls).toHaveLength(1);
  });

  it('debounces with a custom delay', async () => {
    const root = await render(`
      <button id="action" data-component="Action"
        data-on:click.debounce300="Foo -> target.fn()"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const foo = at<Foo>(root, '#foo', 'Foo');

    click(root.querySelector('#action') as Element);

    await wait(120);
    expect(foo.calls).toHaveLength(0);

    await wait(280);
    expect(foo.calls).toHaveLength(1);
  });

  it('drops a pending debounced effect when the action is destroyed', async () => {
    // Not a ui spec. v3 cleared the timer in `detachEvent()` too, but the
    // failure it prevents is v4-shaped: an element removed mid-debounce would
    // otherwise fire an effect against a target list resolved from a DOM that
    // has moved on.
    const root = await render(`
      <button id="action" data-component="Action"
        data-on:click.debounce50="Foo -> target.fn()"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const foo = at<Foo>(root, '#foo', 'Foo');

    click(root.querySelector('#action') as Element);
    (root.querySelector('#action') as Element).remove();
    await settle();
    await wait(100);

    expect(foo.calls).toHaveLength(0);
  });
});

describe('Action — the component', () => {
  it('reacts on click by default', async () => {
    const root = await render(`
      <button id="action" data-component="Action"
        data-option-target="Foo" data-option-effect="target.fn()"></button>
      <div id="foo" data-component="Foo"></div>
    `);

    click(root.querySelector('#action') as Element);
    expect(at<Foo>(root, '#foo', 'Foo').calls).toHaveLength(1);
  });

  it('reacts on the event given by the `on` option', async () => {
    const root = await render(`
      <button id="action" data-component="Action" data-option-on="mouseenter"
        data-option-target="Foo" data-option-effect="(ctx) => ctx.Foo.fn()"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as Element;

    button.dispatchEvent(new Event('mouseenter'));
    click(button);

    expect(at<Foo>(root, '#foo', 'Foo').calls).toHaveLength(1);
  });

  it('does nothing when `on` is set without an `effect`', async () => {
    const root = await render(`
      <button id="action" data-component="Action" data-option-on="click"
        data-option-target="Foo"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const action = at<Action>(root, '#action', 'Action');

    expect(action.actionEvents).toHaveLength(0);
    click(root.querySelector('#action') as Element);
    expect(at<Foo>(root, '#foo', 'Foo').calls).toHaveLength(0);
  });

  it('calls the effect with the documented arguments', async () => {
    const root = await render(`
      <button id="action" data-component="Action" data-option-target="Foo"
        data-option-effect="target.fn(this, ...arguments)"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const action = at<Action>(root, '#action', 'Action');
    const foo = at<Foo>(root, '#foo', 'Foo');

    const event = click(action.$el);

    // `this`, then ctx, event, target, action, self, $el, then one argument
    // per instance on the action element — here just the `Action` itself.
    expect(foo.calls).toEqual([
      [action.$el, { Foo: foo }, event, foo, action, action, foo.$el, action],
    ]);
  });

  it('calls a returned function with the same arguments', async () => {
    const root = await render(`
      <button id="action" data-component="Action" data-option-target="Foo"
        data-option-effect="function() { target.fn(this, ...arguments); }"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const action = at<Action>(root, '#action', 'Action');
    const foo = at<Foo>(root, '#foo', 'Foo');

    const event = click(action.$el);

    expect(foo.calls).toEqual([
      [action.$el, { Foo: foo }, event, foo, action, action, foo.$el, action],
    ]);
  });

  it('exposes the instances mounted on its own element by name', async () => {
    const root = await render(`
      <button id="action" data-component="Action Bar" data-option-target="Foo"
        data-option-effect="target.fn(Action, Bar)"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const action = at<Action>(root, '#action', 'Action');
    const bar = at<Bar>(root, '#action', 'Bar');

    click(action.$el);
    expect(at<Foo>(root, '#foo', 'Foo').calls).toEqual([[action, bar]]);
  });

  it('sees an instance mounted on the action element after it', async () => {
    // v4-only. The instance list is read per event, from `$el.__base__`, so
    // adding a second `data-component` token later is picked up with no
    // rebinding. v3 needed the instance to exist when the effect was first
    // compiled, because the compiled function was cached under a key built
    // from the names known at that moment.
    const root = await render(`
      <button id="action" data-component="Action" data-option-target="Foo"
        data-option-effect="target.fn(typeof Bar === 'undefined' ? null : Bar)"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    click(button);
    expect(foo.calls).toEqual([[null]]);

    button.setAttribute('data-component', 'Action Bar');
    await settle();

    click(button);
    expect(foo.calls[1]).toEqual([at<Bar>(root, '#action', 'Bar')]);
  });

  it('binds every `data-on:<event>` attribute', async () => {
    const root = await render(`
      <div id="action" data-component="Action"
        data-on:click="target.$el.id = 'clicked'"
        data-on:mouseenter="Foo -> target.fn('hovered')"></div>
      <div id="foo" data-component="Foo"></div>
    `);
    const el = root.querySelector('#action') as HTMLElement;

    el.dispatchEvent(new Event('mouseenter'));
    expect(at<Foo>(root, '#foo', 'Foo').calls).toEqual([['hovered']]);

    click(el);
    expect(el.id).toBe('clicked');
  });

  it('accepts a multiline binding', async () => {
    const root = await render(`
      <div id="bar" data-component="Action" data-on:click="
        Action(#bar)
        ->
        target.$el.id = true
          ? 'foo'
          : 'bar'
      "></div>
    `);
    const el = root.querySelector('#bar') as HTMLElement;

    expect(el.id).toBe('bar');
    click(el);
    expect(el.id).toBe('foo');
  });

  it('warns instead of throwing when the effect fails', async () => {
    const root = await render(`
      <div id="action" data-component="Action" data-on:click="() => consol.log()"></div>
    `);
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    click(root.querySelector('#action') as Element);

    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

describe('Action — the v4 lifecycle', () => {
  it('releases its listeners when the element leaves the DOM', async () => {
    const root = await render(`
      <button id="action" data-component="Action" data-on:click="Foo -> target.fn()"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    click(button);
    expect(foo.calls).toHaveLength(1);

    button.remove();
    await settle();

    click(button);
    expect(foo.calls).toHaveLength(1);
  });

  it('re-reads its bindings on every mount cycle', async () => {
    // v3 memoised the parsed bindings for the instance's whole life, so this
    // moved element would keep its old binding. In v4 a move is a destroy
    // plus a mount of the same instance, and the bindings are per cycle.
    const root = await render(`
      <div id="a"><button id="action" data-component="Action"
        data-on:click="Foo -> target.fn('before')"></button></div>
      <div id="b"></div>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    click(button);
    expect(foo.calls).toEqual([['before']]);

    button.setAttribute('data-on:click', "Foo -> target.fn('after')");
    (root.querySelector('#b') as Element).append(button);
    await settle();

    click(button);
    expect(foo.calls).toEqual([['before'], ['after']]);
  });

  it('binds once per cycle, not once per remount', async () => {
    const root = await render(`
      <div id="a"><button id="action" data-component="Action"
        data-on:click="Foo -> target.fn()"></button></div>
      <div id="b"></div>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    (root.querySelector('#b') as Element).append(button);
    await settle();
    (root.querySelector('#a') as Element).append(button);
    await settle();

    click(button);
    expect(foo.calls).toHaveLength(1);
  });
});

describe('Action — live rebinding through $watchAttributes', () => {
  /**
   * Core closed REPORT.md gap 21 with `$watchAttributes()`, and this block is
   * the port consuming it. The gap was that `data-on:<event>` is named by the
   * component, not by the framework, so no `attributeFilter` could enumerate
   * it and an in-place rewrite left the old binding attached. The only
   * workaround was to move or re-insert the element, which the block above
   * still covers.
   *
   * What is asserted here is the three shapes an edit takes — changed,
   * removed, added — plus the two coalescing rules the primitive imposes.
   */
  it('rebinds when a `data-on:*` attribute is rewritten in place', async () => {
    const root = await render(`
      <button id="action" data-component="Action"
        data-on:click="Foo -> target.fn('before')"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    button.setAttribute('data-on:click', "Foo -> target.fn('after')");
    await settle();
    click(button);

    // One call, not two: the old binding is released before the new one is
    // attached, so a rewrite cannot leak the listener it replaces.
    expect(foo.calls).toEqual([['after']]);
  });

  it('detaches the binding when its attribute is removed', async () => {
    const root = await render(`
      <button id="action" data-component="Action"
        data-on:click="Foo -> target.fn()"
        data-on:mouseenter="Foo -> target.fn('hover')"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    // Assert the binding exists first, or the removal below passes vacuously.
    click(button);
    expect(foo.calls).toHaveLength(1);

    button.removeAttribute('data-on:click');
    await settle();

    click(button);
    expect(foo.calls).toHaveLength(1);

    // The sibling binding is untouched — bindings are keyed by the attribute
    // that produced them, so removing one says nothing about the others.
    button.dispatchEvent(new Event('mouseenter'));
    expect(foo.calls[1]).toEqual(['hover']);
  });

  it('attaches a binding for an attribute added after mount', async () => {
    const root = await render(`
      <button id="action" data-component="Action"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    click(button);
    expect(foo.calls).toEqual([]);

    button.setAttribute('data-on:click', "Foo -> target.fn('added')");
    await settle();

    click(button);
    expect(foo.calls).toEqual([['added']]);
  });

  it('applies only the final value when one batch writes several times', async () => {
    // `$watchAttributes` coalesces per attribute per batch and reports against
    // the final DOM value. That is exactly right here, because a binding is a
    // pure function of the attribute's current value.
    const root = await render(`
      <button id="action" data-component="Action"
        data-on:click="Foo -> target.fn('a')"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    button.setAttribute('data-on:click', "Foo -> target.fn('b')");
    button.setAttribute('data-on:click', "Foo -> target.fn('c')");
    await settle();

    click(button);
    expect(foo.calls).toEqual([['c']]);
  });

  it('keeps the binding through a rewrite that nets out', async () => {
    // `a` → `b` → `a` in one batch reports nothing at all. The binding built
    // from `a` is still the correct one, so silence is the right answer and
    // no rebinding happens — one fewer `new Function` compile per morph.
    const root = await render(`
      <button id="action" data-component="Action"
        data-on:click="Foo -> target.fn('a')"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    button.setAttribute('data-on:click', "Foo -> target.fn('b')");
    button.setAttribute('data-on:click', "Foo -> target.fn('a')");
    await settle();

    click(button);
    expect(foo.calls).toEqual([['a']]);
  });

  it('rebinds after a morph rewrites the attribute', async () => {
    // The case gap 21 was really about: `swap({ mode: 'morph' })` rewrites
    // attributes in place without replacing the element, so the instance is
    // never destroyed and the per-mount-cycle re-parse never runs. Because the
    // watcher's records join the one mutation engine's queue, `swap()` has
    // already reported the change when it resolves — no extra `settle()`.
    //
    // `swap` morphs with `childrenOnly`, so the content is the host's *inner*
    // markup. Wrapping it in `#host` again makes the button a structural
    // change instead of an attribute one, and the component remounts — which
    // is a different code path, and the one the block above already covers.
    const root = await render(`
      <div id="host">
        <button id="action" data-component="Action MountProbe"
          data-on:click="Foo -> target.fn('before')"></button>
      </div>
      <div id="foo" data-component="Foo"></div>
    `);
    const before = root.querySelector('#action') as HTMLElement;
    const action = at<Action>(root, '#action', 'Action');
    const probe = at<MountProbe>(root, '#action', 'MountProbe');
    const foo = at<Foo>(root, '#foo', 'Foo');
    expect(probe.mounts).toBe(1);

    await swap(
      root.querySelector('#host') as Element,
      `<button id="action" data-component="Action MountProbe"
        data-on:click="Foo -> target.fn('after')"></button>`,
      { mode: SWAP_MODES.MORPH },
    );

    // Same node, same instance, **same mount cycle**: only the third makes
    // this a test of the watcher rather than of the mount re-parse.
    expect(root.querySelector('#action')).toBe(before);
    expect(at<Action>(root, '#action', 'Action')).toBe(action);
    expect(probe.mounts).toBe(1);

    click(before);
    expect(foo.calls).toEqual([['after']]);
  });

  it('stops watching once the element leaves the DOM', async () => {
    const root = await render(`
      <button id="action" data-component="Action"
        data-on:click="Foo -> target.fn()"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    button.remove();
    await settle();

    // A MutationObserver keeps observing a detached element, so this write is
    // what proves the subscription is destroy-scoped rather than merely idle.
    button.setAttribute('data-on:click', "Foo -> target.fn('while-detached')");
    await settle();

    root.append(button);
    await settle();

    click(button);
    // Remounting re-read the attribute, so the value written while detached is
    // the one in force — reached by the mount re-parse, not by the watcher.
    expect(foo.calls).toEqual([['while-detached']]);
  });
});

describe('Action — live rebinding of the option triple', () => {
  /**
   * The other half of the surface. `on`, `target` and `effect` are declared
   * options, so the framework already observes them and reports each through
   * `option<Name>Changed()` — no `$watchAttributes` needed, and using it here
   * would mean re-deriving the `data-option-<kebab>` spelling by hand.
   *
   * The catch the framework cannot absorb: three attributes feed **one**
   * binding, and the hook is per option name. `Action` dedupes on its own.
   */
  it('rebinds when the `effect` option changes', async () => {
    const root = await render(`
      <button id="action" data-component="Action" data-option-target="Foo"
        data-option-effect="target.fn('before')"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    button.setAttribute('data-option-effect', "target.fn('after')");
    await settle();

    click(button);
    expect(foo.calls).toEqual([['after']]);
  });

  it('rebinds to the new event when the `on` option changes', async () => {
    const root = await render(`
      <button id="action" data-component="Action" data-option-target="Foo"
        data-option-effect="target.fn()"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    button.setAttribute('data-option-on', 'mouseenter');
    await settle();

    // The old listener is gone, not merely shadowed.
    click(button);
    expect(foo.calls).toEqual([]);

    button.dispatchEvent(new Event('mouseenter'));
    expect(foo.calls).toHaveLength(1);
  });

  it('rebinds to the new target when the `target` option changes', async () => {
    const root = await render(`
      <button id="action" data-component="Action" data-option-target="Foo(#foo)"
        data-option-effect="target.fn()"></button>
      <div id="foo" data-component="Foo"></div>
      <div id="bar" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');
    const bar = at<Foo>(root, '#bar', 'Foo');

    button.setAttribute('data-option-target', 'Foo(#bar)');
    await settle();

    click(button);
    expect(foo.calls).toEqual([]);
    expect(bar.calls).toHaveLength(1);
  });

  it('detaches when the `effect` option is removed', async () => {
    const root = await render(`
      <button id="action" data-component="Action" data-option-target="Foo"
        data-option-effect="target.fn()"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    // Assert the binding exists first, or the removal below passes vacuously.
    click(button);
    expect(foo.calls).toHaveLength(1);

    button.removeAttribute('data-option-effect');
    await settle();

    click(button);
    expect(foo.calls).toHaveLength(1);
  });

  it('attaches when an `effect` option is added after mount', async () => {
    const root = await render(`
      <button id="action" data-component="Action"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    button.setAttribute('data-option-target', 'Foo');
    button.setAttribute('data-option-effect', "target.fn('added')");
    await settle();

    click(button);
    expect(foo.calls).toEqual([['added']]);
  });

  it('produces one binding when two of the three options change together', async () => {
    // `option<Name>Changed()` fires once per option, so this batch calls back
    // twice for a single binding. Without `Action`'s own signature check the
    // second call would rebuild an identical binding for nothing; with it, the
    // observable result is one listener either way — which is what is asserted,
    // since a leaked one would double the call count.
    const root = await render(`
      <button id="action" data-component="Action" data-option-target="Foo"
        data-option-effect="target.fn('before')"></button>
      <div id="foo" data-component="Foo"></div>
      <div id="bar" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');
    const bar = at<Foo>(root, '#bar', 'Foo');

    button.setAttribute('data-option-target', 'Foo(#bar)');
    button.setAttribute('data-option-effect', "target.fn('after')");
    await settle();

    click(button);
    expect(foo.calls).toEqual([]);
    expect(bar.calls).toEqual([['after']]);
  });

  it('leaves the option binding alone when a `data-on:*` attribute changes', async () => {
    // The two halves are keyed apart, so neither disturbs the other.
    const root = await render(`
      <button id="action" data-component="Action" data-option-target="Foo"
        data-option-effect="target.fn('option')"
        data-on:click="Foo -> target.fn('attribute')"></button>
      <div id="foo" data-component="Foo"></div>
    `);
    const button = root.querySelector('#action') as HTMLElement;
    const foo = at<Foo>(root, '#foo', 'Foo');

    button.setAttribute('data-on:click', "Foo -> target.fn('rewritten')");
    await settle();

    click(button);
    expect(foo.calls.flat().sort()).toEqual(['option', 'rewritten']);
  });
});

describe('Action — interop with the ported Dialog', () => {
  // REPORT.md §2 listed `Action` triggers as the one thing the `Dialog` port
  // could not cover. This is that gap closed: the markup is ui's own
  // `close-dialogs` story, reduced to what the assertion needs.
  let root: HTMLElement;

  beforeEach(async () => {
    root = await render(`
      <button id="open" data-component="Action"
        data-on:click="Dialog(#modal) -> target.open()"></button>
      <button id="close" data-component="Action"
        data-on:click="Dialog([data-can-be-closed]) -> target.close()"></button>
      <dialog id="modal" data-can-be-closed data-component="Action Dialog"
        data-option-modal="false"
        data-on:cancel.prevent="Dialog.close()"></dialog>
      <dialog id="drawer" data-can-be-closed data-component="Dialog"
        data-option-modal="false"></dialog>
    `);
  });

  it('opens a dialog it does not contain', async () => {
    const dialog = at<Dialog>(root, '#modal', 'Dialog');
    expect(dialog.isOpen).toBe(false);

    click(root.querySelector('#open') as Element);
    await settle();

    expect(dialog.isOpen).toBe(true);
  });

  it('closes every dialog matching an attribute selector at once', async () => {
    const modal = at<Dialog>(root, '#modal', 'Dialog');
    const drawer = at<Dialog>(root, '#drawer', 'Dialog');
    await modal.open();
    await drawer.open();
    expect([modal.isOpen, drawer.isOpen]).toEqual([true, true]);

    click(root.querySelector('#close') as Element);
    await settle();

    expect([modal.isOpen, drawer.isOpen]).toEqual([false, false]);
  });

  it('lets an Action on the dialog itself reach the Dialog beside it', async () => {
    // `data-component="Action Dialog"` with `data-on:cancel="Dialog.close()"`:
    // no target definition, so the effect resolves `Dialog` from the names of
    // the instances sharing the element.
    const dialog = at<Dialog>(root, '#modal', 'Dialog');
    await dialog.open();
    expect(dialog.isOpen).toBe(true);

    dialog.$el.dispatchEvent(new Event('cancel', { cancelable: true }));
    await settle();

    expect(dialog.isOpen).toBe(false);
  });
});
