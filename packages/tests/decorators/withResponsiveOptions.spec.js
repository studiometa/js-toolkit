import { Base, withResponsiveOptions } from '@studiometa/js-toolkit';
import { ResponsiveOptionsManager } from '@studiometa/js-toolkit/Base/managers/ResponsiveOptionsManager.js';

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
