import { describe, it, expect } from 'vitest';
import { Base, BaseConfig } from '@studiometa/js-toolkit';
import { h } from '#test-utils';

describe('The component resolution', () => {
  it('should convert refs name to camelCase', async () => {
    class App extends Base {
      static config: BaseConfig = {
        name: 'App',
        refs: ['my-long-ref-name', 'myOtherRefName'],
      };
    }

    const ref = h('div', { dataRef: 'my-long-ref-name' });
    const ref2 = h('div', { dataRef: 'myOtherRefName' });
    const root = h('div', [ref, ref2]);
    const app = new App(root);
    await app.$mount();
    expect(app.$refs.myLongRefName).toBe(ref);
    expect(app.$refs.myOtherRefName).toBe(ref2);
  });
});
