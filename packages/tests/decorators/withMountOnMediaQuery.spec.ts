import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Base, withMountOnMediaQuery } from '@studiometa/js-toolkit';
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
  class Foo extends withMountOnMediaQuery(Base, mediaQuery) {
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

describe('The withMountOnMediaQuery decorator', () => {
  it('should mount the component when user prefers motion', async () => {
    matchMedia.useMediaQuery(mediaQuery);
    const instance = await mountComponent();
    expect(instance.$isMounted).toBe(true);

    // @TODO: Test unmount on media query change
    // @see https://github.com/dyakovk/jest-matchmedia-mock/issues/3
    // matchMedia.useMediaQuery('(prefers-reduced-motion)');
    // await advanceTimersByTimeAsync(1);

    // expect(instance.$isMounted).toBe(false);
  });

  it('should not mount the component when user prefers reduced motion', async () => {
    matchMedia.useMediaQuery('(prefers-reduced-motion)');
    const instance = await mountComponent();
    expect(instance.$isMounted).toBe(false);

    matchMedia.useMediaQuery(mediaQuery);
    await advanceTimersByTimeAsync(1);
    expect(instance.$isMounted).toBe(true);
  });
});
