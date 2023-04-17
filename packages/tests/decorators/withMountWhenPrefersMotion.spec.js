import { Base, withMountWhenPrefersMotion } from '@studiometa/js-toolkit';
import MatchMediaMock from 'jest-matchmedia-mock';

const mediaQuery = 'not (prefers-reduced-motion)';

class Foo extends withMountWhenPrefersMotion(Base, mediaQuery) {
  static config = {
    name: 'Foo',
  };
}

let matchMedia;

function mountComponent() {
  const div = document.createElement('div');
  const instance = new Foo(div);
  instance.$mount();

  return instance;
}

describe('The withMountWhenPrefersMotion decorator', () => {
  beforeAll(() => {
    // eslint-disable-next-line new-cap
    matchMedia = new MatchMediaMock.default();
  });

  afterEach(() => {
    matchMedia.clear();
  });

  it('should mount the component when user prefers motion', () => {
    matchMedia.useMediaQuery(mediaQuery);
    const instance = mountComponent();
    expect(instance.$isMounted).toBe(true);
  });

  it('should not mount the component when user prefers reduced motion', () => {
    matchMedia.useMediaQuery('(prefers-reduced-motion)');
    const instance = mountComponent();
    expect(instance.$isMounted).toBe(false);
  });
});
