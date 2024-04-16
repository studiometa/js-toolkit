import { describe, it, expect } from 'bun:test';
import { Base, withResponsiveOptions } from '@studiometa/js-toolkit';
import { ResponsiveOptionsManager } from '#private/Base/managers/ResponsiveOptionsManager.js';

describe('The `withResponsiveOptions` decorator', () => {
  it('should use the `ResponsiveOptionsManager', () => {
    class Foo extends withResponsiveOptions(Base) {
      static config = {
        name: 'Foo',
      };
    }

    expect(new Foo(document.createElement('div')).$options).toBeInstanceOf(
      ResponsiveOptionsManager,
    );
  });
});
