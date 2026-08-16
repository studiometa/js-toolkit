import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Base, registerComponents, swap, SWAP_MODES, type BaseConfig } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Dialog } from '../Dialog/Dialog.js';
import { Action } from './Action.js';
import { ActionEvent } from './ActionEvent.js';
import { Target } from './Target.js';

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

/** Counts mount cycles on the tested element. */
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

    const actionEvent = new ActionEvent(action, 'click', '123 Target -> target');
    expect(actionEvent.targets).toEqual([{ Target: target }]);
  });

  it('reaches a target that is neither a descendant nor an ancestor', async () => {
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

describe('Action — live rebinding through watchAttributes', () => {
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

    button.setAttribute('data-on:click', "Foo -> target.fn('while-detached')");
    await settle();

    root.append(button);
    await settle();

    click(button);
    expect(foo.calls).toEqual([['while-detached']]);
  });
});

describe('Action — live rebinding of the option triple', () => {
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
    const dialog = at<Dialog>(root, '#modal', 'Dialog');
    await dialog.open();
    expect(dialog.isOpen).toBe(true);

    dialog.$el.dispatchEvent(new Event('cancel', { cancelable: true }));
    await settle();

    expect(dialog.isOpen).toBe(false);
  });
});
