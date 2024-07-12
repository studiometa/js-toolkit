import { describe, it, expect, mock } from 'bun:test';
import { Base, withName } from '@studiometa/js-toolkit';
import { nextTick } from '@studiometa/js-toolkit/utils';
import { getComponentElements, addToQueue, getInstances } from '#private/Base/utils.js';
import { h } from '#test-utils';

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
    const map = new Map([['blocking', false]]);
    mock.module('#private/Base/features.js', () => ({ features: map }));
    const fn = mock();

    addToQueue(fn);
    expect(fn).not.toHaveBeenCalled();
    await nextTick();
    expect(fn).toHaveBeenCalledTimes(1);
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
    foo.dispatchEvent(new CustomEvent('mounted'));

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
    foo.dispatchEvent(new CustomEvent('mounted'));
    expect(getInstances().has(foo)).toBe(true);
  });
});
