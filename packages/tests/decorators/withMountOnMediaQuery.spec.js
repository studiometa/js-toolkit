import { Base, withMountOnMediaQuery } from '@studiometa/js-toolkit';
import { mockMatchMediaPositive, mockMatchMediaNegative } from '../__setup__/mockMediaQuery.js';

class Foo extends withMountOnMediaQuery(Base, 'not (prefers-reduced-motion)') {
  static config = {
    name: 'Foo',
  };
}

function mountComponent() {
  const div = document.createElement('div');
  const instance = new Foo(div);
  instance.$mount();

  return instance;
}

describe('The withMountOnMediaQuery decorator', () => {
  it('should mount the component when user prefers motion', () => {
    mockMatchMediaPositive();
    const instance = mountComponent();
    expect(instance.$isMounted).toBe(true);
  });

  it('should not mount the component when user prefers reduced motion', () => {
    mockMatchMediaNegative();
    const instance = mountComponent();
    expect(instance.$isMounted).toBe(false);
  });
});
