import { jest } from '@jest/globals';
import { Base, withResponsiveOptions } from '@studiometa/js-toolkit';
import ResponsiveOptionsManager from '@studiometa/js-toolkit/Base/Managers/ResponsiveOptionsManager.js';

describe('The `withResponsiveOptions` decorator', () => {
  it('should use the `ResponsiveOptionsManager', () => {
    class Foo extends withResponsiveOptions(Base) {
      static config = {
        name: 'Foo',
      };
    }

    expect(new Foo(document.createElement('div')).$options).toBeInstanceOf(
      ResponsiveOptionsManager
    );
  });
});
