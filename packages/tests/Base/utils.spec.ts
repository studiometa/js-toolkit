import { describe, it, expect, jest } from 'bun:test';
import { nextTick } from '@studiometa/js-toolkit/utils';
import { getComponentElements, addToQueue } from '../../js-toolkit/Base/utils.js';
import { features } from '../../js-toolkit/Base/features.js';
import { h } from '../__utils__/h.js';

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
  it('should delay given tasks if the `asyncChildren` feature is enabled', async () => {
    features.set('asyncChildren', true);
    const fn = jest.fn();

    addToQueue(fn);
    expect(fn).not.toHaveBeenCalled();
    await nextTick();
    expect(fn).toHaveBeenCalledTimes(1);
    features.set('asyncChildren', false);
  });
});
