import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { DataBind } from './DataBind.js';
import { DataComputed } from './DataComputed.js';
import { DataEffect } from './DataEffect.js';
import { DataModel } from './DataModel.js';
import { DataScope } from './DataScope.js';
import { DATA_DOM_UPDATE_EVENT } from './dom-update.js';
import type { DataValue } from './registry.js';

/**
 * A member that publishes from inside its own delivery.
 *
 * This is the hazard `@studiometa/ui`'s
 * `should preserve the latest value during reentrant group updates` encodes,
 * reduced to its minimum. Real callers that do it: `DataComputed` writing a
 * derived value back, an `Action` mutating a bound value from a click that
 * itself came from a binding.
 */
class ReentrantBind extends DataBind {
  static config = { ...DataBind.config, name: 'ReentrantBind' };

  #dispatched = false;

  override set(value: DataValue, dispatch = true): void {
    super.set(value, dispatch);

    if (!dispatch && value === 'outer' && !this.#dispatched) {
      this.#dispatched = true;
      super.set('inner');
    }
  }
}

/** Records every `set()` the channel drives, so delivery can be counted. */
class RecordingBind extends DataBind {
  static config = { ...DataBind.config, name: 'RecordingBind' };

  calls: Array<[DataValue, boolean]> = [];

  override set(value: DataValue, dispatch = true): void {
    this.calls.push([value, dispatch]);
    super.set(value, dispatch);
  }
}

registerComponents(
  DataScope,
  DataBind,
  DataModel,
  DataComputed,
  DataEffect,
  ReentrantBind,
  RecordingBind,
);

afterEach(resetDom);

let counter = 0;
function uniqueGroup(name: string): string {
  counter += 1;
  return `${name}-${counter}`;
}

async function render(html: string): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  await settle();
  return root;
}

function el<T extends HTMLElement = HTMLElement>(root: HTMLElement, selector: string): T {
  return root.querySelector<T>(selector) as T;
}

function at<T>(root: HTMLElement, selector: string, name: string): T {
  return getInstance<never>(root.querySelector(selector), name) as T;
}

describe('DataBind — the element half', () => {
  it('binds textContent by default and a named property on demand', async () => {
    const root = await render(`
      <div id="text" data-component="DataBind" data-option-group="${uniqueGroup('t')}"></div>
      <div id="named" data-component="DataBind" data-option-prop="title" data-option-group="${uniqueGroup('t')}"></div>
    `);

    const text = at<DataBind>(root, '#text', 'DataBind');
    const named = at<DataBind>(root, '#named', 'DataBind');

    expect(text.get()).toBe('');
    text.set('foo');
    expect(el(root, '#text').textContent).toBe('foo');
    expect(text.get()).toBe('foo');

    named.set('bar');
    expect(el(root, '#named').title).toBe('bar');
    expect(el(root, '#named').textContent).toBe('');
  });

  it('reads and writes typed input properties', async () => {
    const root = await render(`
      <input id="number" type="number" value="1" data-component="DataBind" data-option-group="${uniqueGroup('n')}">
      <input id="date" type="date" value="2025-01-01" data-component="DataBind" data-option-group="${uniqueGroup('d')}">
      <input id="check" type="checkbox" data-component="DataBind" data-option-group="${uniqueGroup('c')}">
      <input id="radio" type="radio" value="foo" data-component="DataBind" data-option-group="${uniqueGroup('r')}">
    `);

    const number = at<DataBind>(root, '#number', 'DataBind');
    const date = at<DataBind>(root, '#date', 'DataBind');
    const check = at<DataBind>(root, '#check', 'DataBind');
    const radio = at<DataBind>(root, '#radio', 'DataBind');

    expect(number.value).toBe(1);
    number.value = '20';
    expect(number.value).toBe(20);

    expect(date.value).toEqual(new Date('2025-01-01'));
    date.set(null);
    expect(el<HTMLInputElement>(root, '#date').value).toBe('');

    expect(check.value).toBe(false);
    check.set(true);
    expect(el<HTMLInputElement>(root, '#check').checked).toBe(true);

    expect(radio.value).toBe('foo');
    radio.set('foo');
    expect(el<HTMLInputElement>(root, '#radio').checked).toBe(true);
    radio.set('bar');
    expect(el<HTMLInputElement>(root, '#radio').checked).toBe(false);
  });

  it('unions the checked values of a [] checkbox group', async () => {
    const group = `${uniqueGroup('checkbox')}[]`;
    const root = await render(`
      <input id="a" type="checkbox" value="foo" data-component="DataBind" data-option-group="${group}">
      <input id="b" type="checkbox" value="bar" data-component="DataBind" data-option-group="${group}">
    `);

    const a = at<DataBind>(root, '#a', 'DataBind');
    const b = at<DataBind>(root, '#b', 'DataBind');

    expect(a.get()).toEqual([]);
    a.set(['foo']);
    expect(el<HTMLInputElement>(root, '#a').checked).toBe(true);
    expect(el<HTMLInputElement>(root, '#b').checked).toBe(false);
    expect(b.get()).toEqual(['foo']);
  });

  it('selects one or several options of a select', async () => {
    const single = uniqueGroup('select');
    const multi = `${uniqueGroup('select')}[]`;
    const root = await render(`
      <select id="one" data-component="DataBind" data-option-group="${single}">
        <option value="foo">Foo</option><option value="bar">Bar</option>
      </select>
      <select id="many" multiple data-component="DataBind" data-option-group="${multi}">
        <option value="foo" selected>Foo</option><option value="bar">Bar</option><option value="baz">Baz</option>
      </select>
    `);

    const one = at<DataBind>(root, '#one', 'DataBind');
    const many = at<DataBind>(root, '#many', 'DataBind');

    expect(one.get()).toBe('foo');
    one.set('bar');
    expect(one.get()).toBe('bar');

    expect(many.get()).toEqual(['foo']);
    many.set(['foo', 'bar']);
    expect(many.get()).toEqual(['foo', 'bar']);
  });

  it('applies every virtual binding kind', async () => {
    const root = await render(`
      <button id="btn" data-component="DataBind" data-option-group="${uniqueGroup('v')}"
        data-bind:prop.disabled="!value"
        data-bind:prop.tab-index="value ? 0 : -1"
        data-bind:attr.aria-pressed="String(Boolean(value))"
        data-bind:class.is-active="value"
        data-bind:style.display="value ? 'block' : 'none'"
        data-bind:text="\`Selected: \${value}\`">Original</button>
    `);

    at<DataBind>(root, '#btn', 'DataBind').set(true);
    const btn = el<HTMLButtonElement>(root, '#btn');

    expect(btn.disabled).toBe(false);
    expect(btn.tabIndex).toBe(0);
    expect(btn.getAttribute('aria-pressed')).toBe('true');
    expect(btn.classList.contains('is-active')).toBe(true);
    expect(btn.style.display).toBe('block');
    expect(btn.textContent).toBe('Selected: true');
  });

  it('passes the raw value through empty expressions and clears on nullish', async () => {
    const root = await render(`
      <div id="d" data-component="DataBind" data-option-group="${uniqueGroup('v')}"
        data-bind:prop.title="" data-bind:attr.data-value="" data-bind:class.selected=""
        data-bind:style.--state="" data-bind:text=""></div>
    `);

    const bind = at<DataBind>(root, '#d', 'DataBind');
    const div = el(root, '#d');

    bind.set('visible');
    expect(div.title).toBe('visible');
    expect(div.dataset.value).toBe('visible');
    expect(div.classList.contains('selected')).toBe(true);
    expect(div.style.getPropertyValue('--state')).toBe('visible');
    expect(div.textContent).toBe('visible');

    bind.set(undefined);
    expect(div.title).toBe('');
    expect(div.hasAttribute('data-value')).toBe(false);
    expect(div.classList.contains('selected')).toBe(false);
    expect(div.style.getPropertyValue('--state')).toBe('');
    expect(div.textContent).toBe('');
  });

  it('retains the raw value a virtual binding was fed, not what it wrote', async () => {
    const root = await render(`
      <button id="b" data-component="DataBind" data-option-group="${uniqueGroup('v')}"
        data-bind:attr.aria-expanded="String(value === 'open')"></button>
    `);

    const bind = at<DataBind>(root, '#b', 'DataBind');
    bind.set('open');
    expect(bind.value).toBe('open');
    expect(el(root, '#b').getAttribute('aria-expanded')).toBe('true');

    bind.toggle('open', 'closed');
    expect(bind.value).toBe('closed');
    expect(el(root, '#b').getAttribute('aria-expanded')).toBe('false');
  });

  it('fails quietly when a virtual expression throws', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const root = await render(`
      <div id="d" data-component="DataBind" data-option-group="${uniqueGroup('v')}"
        data-bind:attr.title="missing.value" data-bind:text="\`Value: \${value}\`"></div>
    `);

    expect(() => at<DataBind>(root, '#d', 'DataBind').set('foo')).not.toThrow();
    expect(el(root, '#d').hasAttribute('title')).toBe(false);
    expect(el(root, '#d').textContent).toBe('Value: foo');
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });

  it('toggles, increments and cycles', async () => {
    const root = await render(`
      <div id="state" data-component="DataBind" data-option-group="${uniqueGroup('m')}"></div>
      <div id="count" data-component="DataBind" data-option-group="${uniqueGroup('m')}">2</div>
      <div id="cycle" data-component="DataBind" data-option-group="${uniqueGroup('m')}">one</div>
    `);

    const state = at<DataBind>(root, '#state', 'DataBind');
    state.toggle('open', 'closed');
    expect(state.value).toBe('open');
    state.toggle('open', 'closed');
    expect(state.value).toBe('closed');

    const count = at<DataBind>(root, '#count', 'DataBind');
    count.increment();
    expect(count.value).toBe('3');
    count.increment(-2);
    expect(count.value).toBe('1');
    count.value = 'invalid';
    count.increment(5);
    expect(count.value).toBe('5');

    const cycle = at<DataBind>(root, '#cycle', 'DataBind');
    const values = ['one', 'two', 'three'];
    cycle.cycle(values);
    expect(cycle.value).toBe('two');
    cycle.cycle(values);
    expect(cycle.value).toBe('three');
    cycle.cycle(values);
    expect(cycle.value).toBe('one');
    cycle.cycle([]);
    expect(cycle.value).toBe('one');
  });

  it('refuses the mutation helpers on computed values and effects', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const root = await render(`
      <div id="c" data-component="DataComputed" data-option-compute="value"
           data-option-group="${uniqueGroup('m')}">current</div>
      <div id="e" data-component="DataEffect" data-option-effect="target.dataset.called = 'true'"
           data-option-group="${uniqueGroup('m')}"></div>
    `);

    at<DataComputed>(root, '#c', 'DataComputed').toggle('next', 'current');
    expect(el(root, '#c').textContent).toBe('current');

    at<DataEffect>(root, '#e', 'DataEffect').increment();
    expect(el(root, '#e').dataset.called).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});

describe('DataBind — the group half', () => {
  it('dispatches a value to every peer of an unscoped group', async () => {
    const group = uniqueGroup('a');
    const root = await render(`
      <div id="one" data-component="DataBind" data-option-group="${group}">foo</div>
      <div id="two" data-component="DataBind" data-option-group="${group}">foo</div>
      <div id="three" data-component="DataComputed" data-option-group="${group}"
           data-option-compute="value + value">foofoo</div>
      <div id="four" data-component="DataEffect" data-option-group="${group}"
           data-option-effect="target.id = value" ></div>
    `);

    const one = at<DataBind>(root, '#one', 'DataBind');
    const two = at<DataBind>(root, '#two', 'DataBind');
    const three = at<DataComputed>(root, '#three', 'DataComputed');

    one.value = 'bar';
    expect(one.value).toBe('bar');
    expect(two.value).toBe('bar');
    expect(three.value).toBe('barbar');
    expect(root.querySelector('#bar')).not.toBeNull();
  });

  it('delivers through the public set method, with dispatch false', async () => {
    const group = uniqueGroup('delivery');
    const root = await render(`
      <div id="src" data-component="DataBind" data-option-group="${group}"></div>
      <div id="sub" data-component="RecordingBind" data-option-group="${group}"></div>
    `);

    const source = at<DataBind>(root, '#src', 'DataBind');
    const subscriber = at<RecordingBind>(root, '#sub', 'RecordingBind');

    source.set('legacy');
    expect(subscriber.calls).toContainEqual(['legacy', false]);
  });

  it('gives every peer the same page-wide channel when no scope is above them', async () => {
    const group = uniqueGroup('page');
    const root = await render(`
      <div id="a" data-component="DataBind" data-option-group="${group}"></div>
      <section><article><div id="b" data-component="DataBind" data-option-group="${group}"></div></article></section>
    `);

    const a = at<DataBind>(root, '#a', 'DataBind');
    const b = at<DataBind>(root, '#b', 'DataBind');

    // v3 needed a `globalThis` registry for this; `provideRootContext` makes
    // it the outermost scope of the one mechanism.
    expect(a.dataRegistry).toBe(b.dataRegistry);
    expect(a.dataRegistry.scoped).toBe(false);
    a.set('shared');
    expect(b.value).toBe('shared');
  });

  it('preserves the latest value during reentrant group updates', async () => {
    // Was red when this port landed; **green since `signal()` landed on
    // `main`** (verified 2026-08-13). Kept as the regression guard for the
    // semantic it asked for.
    //
    // The old eager `Signal` iterated its subscriber set and delivered the
    // frame it was called with. A subscriber that published from inside its
    // own delivery moved the signal forward, but the remaining subscribers of
    // the *outer* round still received the superseded frame — so `#out` ended
    // on `'outer'` after `#reentrant` had already moved the group to
    // `'inner'`.
    //
    // What fixed it: **a nested write abandons the current delivery round and
    // restarts it, so a subscriber not yet reached never sees a superseded
    // frame.** Nothing else in this port needs anything else from the signal
    // — no batching, no untracked read, no derived values.
    //
    // Note what is *not* asserted: how many times each member's `set()` ran.
    // ui takes a major version bump, so call counts are negotiable; the final
    // agreed value is not.
    const group = uniqueGroup('reentrant');
    const root = await render(`
      <div id="src" data-component="DataBind" data-option-group="${group}"></div>
      <div id="reentrant" data-component="ReentrantBind" data-option-group="${group}"></div>
      <div id="out" data-component="DataBind" data-option-group="${group}"></div>
    `);

    const source = at<DataBind>(root, '#src', 'DataBind');
    const reentrant = at<ReentrantBind>(root, '#reentrant', 'ReentrantBind');
    const out = at<DataBind>(root, '#out', 'DataBind');

    source.set('outer');

    expect(source.value).toBe('inner');
    expect(reentrant.value).toBe('inner');
    expect(out.value).toBe('inner');
  });

  it('leaves and rejoins its group across destroy/mount cycles', async () => {
    const group = uniqueGroup('lifecycle');
    const root = await render(`
      <div id="src" data-component="DataBind" data-option-group="${group}"></div>
      <div id="wrap"><div id="eff" data-component="DataEffect" data-option-group="${group}"
        data-option-effect="target.dataset.calls = String(Number(target.dataset.calls || 0) + 1)"></div></div>
    `);

    const source = at<DataBind>(root, '#src', 'DataBind');
    const effectEl = el(root, '#eff');

    source.set('first');
    expect(effectEl.dataset.calls).toBe('1');

    // v3 needed `destroyed()` to unsubscribe; here the subscription is the
    // cleanup `mounted()` returned, so disconnection is the whole story.
    effectEl.remove();
    await settle();
    source.set('second');
    expect(effectEl.dataset.calls).toBe('1');

    el(root, '#wrap').append(effectEl);
    await settle();
    source.set('third');
    expect(effectEl.dataset.calls).toBe('2');
  });

  it('forgets peers that left the document, synchronously', async () => {
    const group = `${uniqueGroup('checkbox')}[]`;
    const root = await render(`
      <input id="a" type="checkbox" value="foo" checked data-component="DataBind" data-option-group="${group}">
      <input id="b" type="checkbox" value="bar" checked data-component="DataBind" data-option-group="${group}">
    `);

    const a = at<DataBind>(root, '#a', 'DataBind');
    expect(a.value).toEqual(['foo', 'bar']);

    // No `await settle()`: the registry prunes disconnected members on read,
    // so the guarantee survives v4's asynchronous teardown.
    el(root, '#b').remove();
    expect(a.value).toEqual(['foo']);
  });

  it('propagates its own value on mount when immediate is set', async () => {
    const group = uniqueGroup('immediate');
    const root = await render(`
      <input id="a" type="text" value="foo" data-option-immediate data-component="DataBind" data-option-group="${group}">
      <input id="b" type="text" data-component="DataBind" data-option-group="${group}">
    `);

    expect(at<DataBind>(root, '#b', 'DataBind').value).toBe('foo');
  });

  it('runs an effect on mount only when immediate is set', async () => {
    const passive = uniqueGroup('passive');
    const immediate = uniqueGroup('immediate');
    const root = await render(`
      <div id="passive" data-component="DataEffect" data-option-group="${passive}"
           data-option-effect="target.dataset.called = 'true'"></div>
      <div id="immediate" data-component="DataEffect" data-option-group="${immediate}" data-option-immediate
           data-option-effect="target.dataset.calls = String(Number(target.dataset.calls || 0) + 1)"></div>
    `);

    expect(el(root, '#passive').dataset.called).toBeUndefined();
    expect(el(root, '#immediate').dataset.calls).toBe('1');
  });

  it('updates a virtual subscriber even when its own value already matches', async () => {
    const group = uniqueGroup('equal');
    const root = await render(`
      <div id="src" data-component="DataBind" data-option-group="${group}">foo</div>
      <button id="sub" data-component="DataBind" data-option-group="${group}"
              data-bind:attr.data-value="value">foo</button>
    `);

    at<DataBind>(root, '#src', 'DataBind').set('foo');
    expect(el(root, '#sub').dataset.value).toBe('foo');
  });

  it('uses the scoped $data inside virtual expressions', async () => {
    const group = uniqueGroup('tabs');
    const root = await render(`
      <div id="scope" data-component="DataScope" data-option-group="${group}">
        <button id="btn" data-component="DataBind"
                data-bind:attr.aria-selected="$data.active === value"
                data-bind:class.is-active="$data.active === value"></button>
      </div>
    `);

    at<DataScope>(root, '#scope', 'DataScope').setValue(group, 'active', 'details');
    at<DataBind>(root, '#btn', 'DataBind').set('details');

    expect(el(root, '#btn').getAttribute('aria-selected')).toBe('');
    expect(el(root, '#btn').classList.contains('is-active')).toBe(true);
  });

  it('syncs a late immediate keyed subscriber with the current scoped value', async () => {
    const group = uniqueGroup('late');
    const root = await render(`
      <div id="scope" data-component="DataScope" data-option-group="${group}">
        <input id="model" data-component="DataModel" name="query" value="initial">
      </div>
    `);

    at<DataModel>(root, '#model', 'DataModel').set('current');

    const scope = el(root, '#scope');
    scope.insertAdjacentHTML(
      'beforeend',
      `<div id="late" data-component="DataBind" data-option-key="query" data-option-immediate></div>
       <div id="passive" data-component="DataBind" data-option-key="query"></div>`,
    );
    await settle();

    expect(el(root, '#late').textContent).toBe('current');
    expect(el(root, '#passive').textContent).toBe('');
  });
});

describe('DataBind — the data-bind:if template protocol', () => {
  it('toggles the presence of template content', async () => {
    const group = uniqueGroup('if');
    const root = await render(`
      <div id="host">
        <template id="tpl" data-component="DataBind" data-option-group="${group}"
                  data-bind:if="value === 'open'"><p>Hello</p></template>
      </div>
    `);

    const bind = at<DataBind>(root, '#tpl', 'DataBind');
    expect(root.querySelector('p')).toBeNull();

    bind.set('open');
    const inserted = root.querySelector('p');
    expect(inserted?.textContent).toBe('Hello');
    expect(el(root, '#tpl').nextElementSibling).toBe(inserted);

    bind.set('closed');
    expect(root.querySelector('p')).toBeNull();

    bind.set('open');
    expect(root.querySelector('p')).not.toBe(inserted);
  });

  it('lets a Data DOM-update listener defer the insertion', async () => {
    const group = uniqueGroup('if');
    const root = await render(`
      <div id="host">
        <template id="tpl" data-component="DataBind" data-option-group="${group}"
                  data-bind:if=""><p>Hello</p></template>
      </div>
    `);

    let apply: (() => void) | undefined;
    let isPresent: boolean | undefined;
    el(root, '#host').addEventListener(DATA_DOM_UPDATE_EVENT, (event) => {
      const { detail } = event as CustomEvent<{
        isPresent: boolean;
        wrap(runner: (run: () => void) => void): void;
      }>;
      isPresent = detail.isPresent;
      detail.wrap((run) => {
        apply = run;
      });
    });

    at<DataBind>(root, '#tpl', 'DataBind').set(true);

    expect(isPresent).toBe(true);
    expect(root.querySelector('p')).toBeNull();

    apply?.();
    expect(root.querySelector('p')).not.toBeNull();
  });

  it('warns when the if binding sits on something other than a template', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const root = await render(`
      <div id="d" data-component="DataBind" data-option-group="${uniqueGroup('if')}"
           data-bind:if="value"></div>
    `);

    at<DataBind>(root, '#d', 'DataBind').set(true);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
