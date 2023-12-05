import { Base, withMountOnMediaQuery } from '@studiometa/js-toolkit';
import { wait } from '@studiometa/js-toolkit/utils';
import { matchMedia } from '../__utils__/matchMedia.js';

const mediaQuery = 'not (prefers-reduced-motion)';

class Foo extends withMountOnMediaQuery(Base, mediaQuery) {
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
  afterEach(() => {
    matchMedia.clear();
  });

  it('should mount the component when user prefers motion', async () => {
    matchMedia.useMediaQuery(mediaQuery);
    const instance = mountComponent();
    expect(instance.$isMounted).toBe(true);

    // @TODO: Test unmount on media query change
    // @see https://github.com/dyakovk/jest-matchmedia-mock/issues/3
    // matchMedia.useMediaQuery('(prefers-reduced-motion)');
    // await wait(0);
    // expect(instance.$isMounted).toBe(false);
  });

  it('should not mount the component when user prefers reduced motion', async () => {
    matchMedia.useMediaQuery('(prefers-reduced-motion)');
    const instance = mountComponent();
    expect(instance.$isMounted).toBe(false);

    matchMedia.useMediaQuery(mediaQuery);
    await wait(0);
    expect(instance.$isMounted).toBe(true);
  });
});
