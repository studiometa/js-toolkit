import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { Base, withMountOnMediaQuery } from '@studiometa/js-toolkit';
import {
  h,
  advanceTimersByTimeAsync,
  useMatchMedia,
  useFakeTimers,
  useRealTimers,
} from '#test-utils';

beforeEach(() => {
  useFakeTimers();
});

afterEach(() => {
  useRealTimers();
});

async function mountComponent(mediaQuery = 'not (prefers-reduced-motion)') {
  const matchMedia = useMatchMedia(mediaQuery);

  class Foo extends withMountOnMediaQuery(Base, 'not (prefers-reduced-motion)') {
    static config = {
      name: 'Foo',
    };
  }

  const div = h('div');
  const instance = new Foo(div);
  instance.$mount();
  await advanceTimersByTimeAsync(1);

  return { instance, matchMedia };
}

describe('The withMountOnMediaQuery decorator', () => {
  it('should mount the component when user prefers motion', async () => {
    const { instance } = await mountComponent();
    expect(instance.$isMounted).toBe(true);

    // @TODO: Test unmount on media query change
    // @see https://github.com/dyakovk/jest-matchmedia-mock/issues/3
    // matchMedia.useMediaQuery('(prefers-reduced-motion)');
    // await advanceTimersByTimeAsync(1);

    // expect(instance.$isMounted).toBe(false);
  });

  it('should not mount the component when user prefers reduced motion', async () => {
    const { instance, matchMedia } = await mountComponent('(prefers-reduced-motion)');
    expect(instance.$isMounted).toBe(false);

    matchMedia.useMediaQuery('not (prefers-reduced-motion)');
    await advanceTimersByTimeAsync(1);
    expect(instance.$isMounted).toBe(true);
  });
});
