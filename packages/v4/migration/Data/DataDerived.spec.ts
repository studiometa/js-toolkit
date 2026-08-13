import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { DataBind } from './DataBind.js';
import { DataComputed } from './DataComputed.js';
import { DataEffect } from './DataEffect.js';
import { DataModel } from './DataModel.js';
import { DataScope } from './DataScope.js';

registerComponents(DataScope, DataBind, DataModel, DataComputed, DataEffect);

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

describe('DataModel', () => {
  it('publishes what the user types to every peer', async () => {
    const group = uniqueGroup('model');
    const root = await render(`
      <input id="a" value="foo" data-component="DataModel" data-option-group="${group}">
      <input id="b" value="foo" data-component="DataModel" data-option-group="${group}">
    `);

    const a = at<DataModel>(root, '#a', 'DataModel');
    const b = at<DataModel>(root, '#b', 'DataModel');
    expect(a.get()).toBe('foo');

    el<HTMLInputElement>(root, '#a').value = 'bar';
    el(root, '#a').dispatchEvent(new Event('input'));

    expect(a.get()).toBe('bar');
    expect(b.get()).toBe('bar');
  });

  it('keeps grouped checkboxes in sync by value, not by element', async () => {
    const group = `${uniqueGroup('check')}[]`;
    const root = await render(`
      <input id="a1" type="checkbox" value="a" data-component="DataModel" data-option-group="${group}">
      <input id="a2" type="checkbox" value="a" data-component="DataModel" data-option-group="${group}">
      <input id="b1" type="checkbox" value="b" data-component="DataModel" data-option-group="${group}">
    `);

    const a1 = at<DataModel>(root, '#a1', 'DataModel');
    const a2 = at<DataModel>(root, '#a2', 'DataModel');
    const b1 = at<DataModel>(root, '#b1', 'DataModel');
    expect(a1.multiple).toBe(true);

    const check = (selector: string, checked: boolean) => {
      const input = el<HTMLInputElement>(root, selector);
      input.checked = checked;
      input.dispatchEvent(new Event('input'));
    };

    check('#a1', true);
    expect(a1.value).toEqual(['a']);
    expect(a2.value).toEqual(['a']);
    expect(b1.value).toEqual(['a']);

    check('#a1', false);
    expect(a1.value).toEqual([]);
    expect(b1.value).toEqual([]);
  });
});

describe('DataComputed', () => {
  it('sets the value returned by the compute expression', async () => {
    const root = await render(`
      <div id="c" data-component="DataComputed" data-option-group="${uniqueGroup('c')}"
           data-option-compute="value.length"></div>
    `);

    at<DataComputed>(root, '#c', 'DataComputed').set('foo');
    expect(el(root, '#c').textContent).toBe('3');
  });

  it('fails quietly and keeps the incoming value when the expression throws', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const root = await render(`
      <div id="c" data-component="DataComputed" data-option-group="${uniqueGroup('c')}"
           data-option-compute="valuee.length"></div>
    `);

    const computed = at<DataComputed>(root, '#c', 'DataComputed');
    expect(() => computed.set('foo')).not.toThrow();
    expect(computed.get()).toBe('foo');
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});

describe('DataEffect', () => {
  it('runs the expression and writes nothing back', async () => {
    const root = await render(`
      <div id="e" data-component="DataEffect" data-option-group="${uniqueGroup('e')}"
           data-option-effect="target.setAttribute('title', value)"></div>
    `);

    at<DataEffect>(root, '#e', 'DataEffect').set('foo');
    expect(el(root, '#e').title).toBe('foo');
    expect(el(root, '#e').textContent).toBe('');
  });

  it('fails quietly when the expression throws', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const root = await render(`
      <div id="e" data-component="DataEffect" data-option-group="${uniqueGroup('e')}"
           data-option-effect="targett.setAttribute('id', value)"></div>
    `);

    const effect = at<DataEffect>(root, '#e', 'DataEffect');
    expect(() => effect.set('foo')).not.toThrow();
    expect(effect.get()).toBe('');
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});
