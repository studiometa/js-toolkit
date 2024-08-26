import { describe, it, expect, vi } from 'vitest';
import { Base, withName, getInstances } from '@studiometa/js-toolkit';
import { nextTick } from '@studiometa/js-toolkit/utils';
import { getComponentElements, addToQueue, getSelector } from '#private/Base/utils.js';
import { h, mockFeatures } from '#test-utils';

describe('The `getSelector` function', () => {
  it('should return a list of selectors', () => {
    expect(getSelector('Foo')).toMatchInlineSnapshot(
      `"tk-foo,[data-component="Foo"],[data-component*=" Foo "],[data-component$=" Foo"],[data-component^="Foo "]"`,
    );
    expect(getSelector('FooBar')).toMatchInlineSnapshot(
      `"tk-foo-bar,[data-component="FooBar"],[data-component*=" FooBar "],[data-component$=" FooBar"],[data-component^="FooBar "]"`,
    );
  });
});

describe('The `getComponentElements` function', () => {
  it('should find components with multiple declarations', () => {
    const div = h('div');
    div.innerHTML = `
      <div data-component="Foo"></div>
      <div data-component="Foo Bar"></div>
      <div data-component="Bar Foo"></div>
      <div data-component="Bar Foo Baz"></div>
      <div data-component="Baz"></div>
      <!-- The following should not be found -->
      <div data-component="FooBaz"></div>
      <div data-component="FooBaz BarFoo"></div>
    `;

    expect(getComponentElements('Foo', div)).toHaveLength(4);
    expect(getComponentElements('Bar', div)).toHaveLength(3);
    expect(getComponentElements('Baz', div)).toHaveLength(2);
  });

  it('should not find DOM elements with the same name as a defined component', () => {
    const div = h('div', [h('figure'), h('button')]);

    expect(getComponentElements('Figure', div)).toHaveLength(0);
    expect(getComponentElements('Button', div)).toHaveLength(0);
  });
});

describe('The `addToQueue` function', () => {
  it('should delay given tasks if the `blocking` feature is disabled', async () => {
    const { unmock } = mockFeatures({ blocking: false });
    const fn = vi.fn();

    addToQueue(fn);
    expect(fn).not.toHaveBeenCalled();
    await nextTick();
    expect(fn).toHaveBeenCalledTimes(1);
    unmock();
  });
});

describe('The instance helpers', () => {
  it('should save and get instances for a given constructor', () => {
    const Foo = withName(Base, 'Foo');
    const Bar = withName(Base, 'Bar');

    expect(getInstances(Foo)).toHaveLength(0);
    expect(getInstances(Bar)).toHaveLength(0);

    const foo = new Foo(h('div'));
    new Bar(h('div'));
    foo.$emit(new CustomEvent('mounted'));

    expect(getInstances(Foo)).toHaveLength(1);
    expect(getInstances(Bar)).toHaveLength(0);
    expect(getInstances(Foo).has(foo)).toBe(true);
  });

  it('should return a set with all instances if no constructor given', () => {
    const Foo = withName(Base, 'Foo');
    const foo = new Foo(h('div'));
    const instances = getInstances();
    expect(instances).toBeInstanceOf(Set);
    expect(getInstances().has(foo)).toBe(false);
    foo.$emit(new CustomEvent('mounted'));
    expect(getInstances().has(foo)).toBe(true);
  });
});
