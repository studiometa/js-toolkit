import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { DataBind } from './DataBind.js';
import { DataComputed } from './DataComputed.js';
import { DataEffect } from './DataEffect.js';
import { DataModel } from './DataModel.js';
import { DataScope } from './DataScope.js';

// The late-scope spec below covers the opposite registration order.
registerComponents(DataScope, DataBind, DataModel, DataComputed, DataEffect);

afterEach(resetDom);

/** Isolate tests because the page-wide registry survives `resetDom()`. */
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

function at<T>(root: HTMLElement, selector: string, name: string): T {
  return getInstance<never>(root.querySelector(selector), name) as T;
}

function el<T extends HTMLElement = HTMLElement>(root: HTMLElement, selector: string): T {
  return root.querySelector<T>(selector) as T;
}

describe('DataScope', () => {
  it('gives descendants its group and lets one override it', async () => {
    const group = uniqueGroup('scoped');
    const root = await render(`
      <div data-component="DataScope" data-option-group="${group}">
        <div id="a" data-component="DataBind"></div>
        <div id="b" data-component="DataBind"></div>
        <div id="c" data-component="DataBind" data-option-group="${group}-other"></div>
      </div>
    `);

    const scope = at<DataScope>(root, '[data-component="DataScope"]', 'DataScope');
    const a = at<DataBind>(root, '#a', 'DataBind');
    const b = at<DataBind>(root, '#b', 'DataBind');
    const c = at<DataBind>(root, '#c', 'DataBind');

    expect(scope.$options.group).toBe(group);
    expect(a.group).toBe(group);
    expect(a.peers).toBe(b.peers);
    expect(c.group).toBe(`${group}-other`);
    expect(c.peers).not.toBe(a.peers);
  });

  it('isolates sibling scopes and resolves the nearest nested one', async () => {
    const group = uniqueGroup('shared');
    const root = await render(`
      <div id="outer" data-component="DataScope" data-option-group="${group}">
        <div id="outer-bind" data-component="DataBind"></div>
        <div id="nested" data-component="DataScope" data-option-group="${group}">
          <div id="nested-bind" data-component="DataBind"></div>
        </div>
      </div>
      <div id="sibling" data-component="DataScope" data-option-group="${group}">
        <div id="sibling-bind" data-component="DataBind"></div>
      </div>
    `);

    const nestedScope = at<DataScope>(root, '#nested', 'DataScope');
    const outer = at<DataBind>(root, '#outer-bind', 'DataBind');
    const nested = at<DataBind>(root, '#nested-bind', 'DataBind');
    const sibling = at<DataBind>(root, '#sibling-bind', 'DataBind');

    expect(outer.peers).not.toBe(nested.peers);
    expect(outer.peers).not.toBe(sibling.peers);
    expect(nested.dataRegistry).toBe(nestedScope.registry);

    outer.set('outer');
    expect(nested.value).toBe('');
    expect(sibling.value).toBe('');
  });

  it('keeps keyed values independent and synchronizes equal keys', async () => {
    const group = uniqueGroup('person');
    const root = await render(`
      <div data-component="DataScope" data-option-group="${group}">
        <input id="first" data-component="DataModel" name="first" value="Ada">
        <input id="last" data-component="DataModel" name="last" value="Lovelace">
        <div id="out" data-component="DataBind" data-option-key="first"></div>
      </div>
    `);

    const first = at<DataModel>(root, '#first', 'DataModel');
    const last = at<DataModel>(root, '#last', 'DataModel');
    const out = at<DataBind>(root, '#out', 'DataBind');
    const firstInput = el<HTMLInputElement>(root, '#first');

    firstInput.value = 'Grace';
    firstInput.dispatchEvent(new Event('input'));

    expect(first.value).toBe('Grace');
    expect(out.value).toBe('Grace');
    expect(last.value).toBe('Lovelace');
    expect(first.$data).toEqual({ first: 'Grace' });
    expect(Object.isFrozen(first.$data)).toBe(true);
  });

  it('clones and freezes mutable snapshot values', async () => {
    const group = uniqueGroup('values');
    const root = await render(
      `<div data-component="DataScope" data-option-group="${group}"></div>`,
    );
    const scope = at<DataScope>(root, '[data-component="DataScope"]', 'DataScope');

    const items = ['one'];
    const date = new Date('2026-01-01');
    scope.setValue(group, 'items', items);
    scope.setValue(group, 'date', date);
    const data = scope.getData(group);

    expect(data.items).toEqual(items);
    expect(data.items).not.toBe(items);
    expect(Object.isFrozen(data.items)).toBe(true);
    expect(Object.isFrozen(data.date)).toBe(true);

    items.push('two');
    date.setFullYear(2030);
    (data.date as Date).setFullYear(2031);
    scope.setValue(group, 'other', 'value');

    expect(data.items).toEqual(['one']);
    expect(scope.getData(group)).toEqual({
      items: ['one'],
      date: new Date('2026-01-01'),
      other: 'value',
    });
  });

  it('hydrates every immediate source before notifying subscribers', async () => {
    const group = uniqueGroup('person');
    const root = await render(`
      <div data-component="DataScope" data-option-group="${group}">
        <input data-component="DataModel" name="first" value="Ada" data-option-immediate>
        <input data-component="DataModel" name="last" value="Lovelace" data-option-immediate>
        <div id="computed" data-component="DataComputed"
             data-option-compute="$data.first + ' ' + $data.last"></div>
        <div id="effect" data-component="DataEffect"
             data-option-effect="target.dataset.values = (target.dataset.values || '') + $data.first + ' ' + $data.last + '|'; target.dataset.frozen = Object.isFrozen($data)"></div>
      </div>
    `);

    const computed = at<DataComputed>(root, '#computed', 'DataComputed');
    const effectEl = el(root, '#effect');

    // The batching is the contract: no subscriber ever sees a half-filled
    // `$data` on the way to the full one.
    expect(computed.value).toBe('Ada Lovelace');
    expect(effectEl.dataset.values?.split('|').filter(Boolean)).toEqual([
      'Ada Lovelace',
      'Ada Lovelace',
    ]);
    expect(effectEl.dataset.frozen).toBe('true');
  });

  it('notifies once when several immediate sources share a key', async () => {
    const group = uniqueGroup('person');
    const root = await render(`
      <div data-component="DataScope" data-option-group="${group}">
        <input data-component="DataModel" name="first" value="Ada" data-option-immediate>
        <input data-component="DataModel" name="first" value="Ada" data-option-immediate>
        <div id="effect" data-component="DataEffect"
             data-option-effect="target.dataset.values = (target.dataset.values || '') + $data.first + '|'"></div>
      </div>
    `);

    const scope = at<DataScope>(root, '[data-component="DataScope"]', 'DataScope');
    const effectEl = el(root, '#effect');

    expect(effectEl.dataset.values?.split('|').filter(Boolean)).toEqual(['Ada']);
    expect(scope.getData(group)).toEqual({ first: 'Ada' });
  });

  it('drops a keyed value when its last source leaves the document', async () => {
    const group = uniqueGroup('person');
    const root = await render(`
      <div data-component="DataScope" data-option-group="${group}">
        <input id="input" data-component="DataModel" name="first" value="Ada" data-option-immediate>
        <div id="computed" data-component="DataComputed"
             data-option-compute="$data.first ?? 'missing'"></div>
      </div>
    `);

    const scope = at<DataScope>(root, '[data-component="DataScope"]', 'DataScope');
    const computed = at<DataComputed>(root, '#computed', 'DataComputed');
    expect(scope.getData(group)).toEqual({ first: 'Ada' });
    expect(computed.value).toBe('Ada');

    // Synchronous, without waiting for the registry's MutationObserver —
    // `DataRegistry` reconciles its sources against `isConnected` on read.
    el(root, '#input').remove();
    expect(scope.getData(group)).toEqual({});
    expect(computed.value).toBe('missing');
  });

  it('recomputes a [] group when one of its checkbox sources is removed', async () => {
    const group = uniqueGroup('choices');
    const root = await render(`
      <div data-component="DataScope" data-option-group="${group}[]">
        <input id="one" data-component="DataModel" type="checkbox" name="items" value="first" checked data-option-immediate>
        <input id="two" data-component="DataModel" type="checkbox" name="items" value="second" checked data-option-immediate>
        <div id="computed" data-component="DataComputed"
             data-option-compute="$data.items?.join(', ') ?? ''"></div>
      </div>
    `);

    const scope = at<DataScope>(root, '[data-component="DataScope"]', 'DataScope');
    const computed = at<DataComputed>(root, '#computed', 'DataComputed');
    expect(scope.getData(`${group}[]`)).toEqual({ items: ['first', 'second'] });
    expect(computed.value).toBe('first, second');

    el(root, '#two').remove();
    expect(scope.getData(`${group}[]`)).toEqual({ items: ['first'] });
    expect(computed.value).toBe('first');
  });

  it('hydrates and tracks only the checked radio', async () => {
    const group = uniqueGroup('tabs');
    const root = await render(`
      <div data-component="DataScope" data-option-group="${group}">
        <input id="overview" data-component="DataModel" type="radio" name="tab" value="overview" checked data-option-immediate>
        <input id="details" data-component="DataModel" type="radio" name="tab" value="details" data-option-immediate>
      </div>
    `);

    const scope = at<DataScope>(root, '[data-component="DataScope"]', 'DataScope');
    const overview = at<DataModel>(root, '#overview', 'DataModel');
    expect(scope.getData(group)).toEqual({ tab: 'overview' });

    overview.set('details');
    expect(el<HTMLInputElement>(root, '#details').checked).toBe(true);
    expect(scope.getData(group)).toEqual({ tab: 'details' });
  });

  it('notifies subscribers again when the same value is written twice', async () => {
    const group = uniqueGroup('person');
    const root = await render(`
      <div data-component="DataScope" data-option-group="${group}">
        <input id="input" data-component="DataModel" name="first">
        <div id="out" data-component="DataBind" data-option-key="first"></div>
        <div id="effect" data-component="DataEffect"
             data-option-effect="target.dataset.calls = String(Number(target.dataset.calls || 0) + 1); target.dataset.value = value"></div>
      </div>
    `);

    const model = at<DataModel>(root, '#input', 'DataModel');
    const out = at<DataBind>(root, '#out', 'DataBind');
    const effectEl = el(root, '#effect');

    model.set('Ada');
    const firstSnapshot = model.$data;
    expect(out.value).toBe('Ada');
    expect(effectEl.dataset.calls).toBe('1');

    // Equal values remain observable events.
    model.set('Ada');
    expect(effectEl.dataset.calls).toBe('2');
    expect(model.$data).toEqual({ first: 'Ada' });
    expect(model.$data).not.toBe(firstSnapshot);
  });

  it('recomputes unkeyed subscribers on every keyed update', async () => {
    const group = uniqueGroup('values');
    const root = await render(`
      <div data-component="DataScope" data-option-group="${group}">
        <input id="first" data-component="DataModel" name="first" value="A" data-option-immediate>
        <input data-component="DataModel" name="last" value="B" data-option-immediate>
        <div id="computed" data-component="DataComputed"
             data-option-compute="$data.first + $data.last"></div>
      </div>
    `);

    const computed = at<DataComputed>(root, '#computed', 'DataComputed');
    expect(computed.value).toBe('AB');

    const input = el<HTMLInputElement>(root, '#first');
    input.value = 'AB';
    input.dispatchEvent(new Event('input'));
    expect(computed.value).toBe('ABB');
  });

  it('rebinds descendants when a scope is wrapped around existing content', async () => {
    const group = uniqueGroup('wrapped');
    const root = await render(`
      <div id="bind" data-component="DataBind" data-option-key="first"></div>
    `);
    const bind = at<DataBind>(root, '#bind', 'DataBind');
    expect(bind.dataRegistry.scoped).toBe(false);

    const scope = document.createElement('div');
    scope.setAttribute('data-component', 'DataScope');
    scope.setAttribute('data-option-group', group);
    root.append(scope);
    scope.append(el(root, '#bind'));
    await settle();

    const scopeInstance = getInstance<DataScope>(scope, 'DataScope');
    const rebound = getInstance<DataBind>(el(root, '#bind'), 'DataBind');
    expect(rebound.dataRegistry).toBe(scopeInstance.registry);
    expect(rebound.group).toBe(group);
    expect(rebound.dataKey).toBe('first');
  });

  it('reclaims descendants when the scope mounts around content that already resolved', async () => {
    const group = uniqueGroup('late');
    const root = await render(`
      <div id="scope" data-option-group="${group}">
        <div id="bind" data-component="DataBind" data-option-key="first"></div>
      </div>
    `);

    const early = at<DataBind>(root, '#bind', 'DataBind');
    expect(early.dataRegistry.scoped).toBe(false);
    expect(early.dataKey).toBe('');

    el(root, '#scope').setAttribute('data-component', 'DataScope');
    await settle();

    const scope = at<DataScope>(root, '#scope', 'DataScope');
    expect(early.dataRegistry).toBe(scope.registry);
    expect(early.group).toBe(group);
    expect(early.dataKey).toBe('first');
    expect(scope.getGroup(group).has(early)).toBe(true);
  });

  it('leaves nested members with their nearest scope when an outer one arrives late', async () => {
    const outerGroup = uniqueGroup('outer');
    const innerGroup = uniqueGroup('inner');
    const root = await render(`
      <div id="outer" data-option-group="${outerGroup}">
        <div id="inner" data-component="DataScope" data-option-group="${innerGroup}">
          <div id="bind" data-component="DataBind"></div>
        </div>
      </div>
    `);

    const inner = at<DataScope>(root, '#inner', 'DataScope');
    const bind = at<DataBind>(root, '#bind', 'DataBind');
    expect(bind.dataRegistry).toBe(inner.registry);

    el(root, '#outer').setAttribute('data-component', 'DataScope');
    await settle();

    expect(bind.dataRegistry).toBe(inner.registry);
    expect(bind.group).toBe(innerGroup);
  });
});
