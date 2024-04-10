import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Base, withMountWhenPrefersMotion } from '@studiometa/js-toolkit';
import { advanceTimersByTimeAsync, matchMedia, useFakeTimers, useRealTimers } from '#test-utils';

beforeEach(() => {
  useFakeTimers();
});

afterEach(() => {
  matchMedia.clear();
  useRealTimers();
});

const mediaQuery = 'not (prefers-reduced-motion)';

async function mountComponent() {
  class Foo extends withMountWhenPrefersMotion(Base) {
    static config = {
      name: 'Foo',
    };
  }

  const div = document.createElement('div');
  const instance = new Foo(div);
  instance.$mount();
  await advanceTimersByTimeAsync(1);

  return instance;
}

describe('The withMountWhenPrefersMotion decorator', () => {
  it('should mount the component when user prefers motion', async () => {
    matchMedia.useMediaQuery(mediaQuery);
    const instance = await mountComponent();
    expect(instance.$isMounted).toBe(true);
  });

  it('should not mount the component when user prefers reduced motion', async () => {
    matchMedia.useMediaQuery('(prefers-reduced-motion)');
    const instance = await mountComponent();
    expect(instance.$isMounted).toBe(false);
  });
});
