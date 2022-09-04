import { jest } from '@jest/globals';
import { Base, withMountWhenInView } from '@studiometa/js-toolkit';
import {
  beforeAllCallback,
  afterEachCallback,
  mockIsIntersecting,
  intersectionMockInstance,
} from '../__setup__/mockIntersectionObserver';
import wait from '../__utils__/wait.js';

beforeAll(() => beforeAllCallback());

let div;
let instance;

class Foo extends withMountWhenInView(Base) {
  static config = {
    name: 'Foo',
  };
}

beforeEach(() => {
  div = document.createElement('div');
  instance = new Foo(div);
  instance.$mount();
});

afterEach(() => afterEachCallback());

describe('The withMountWhenInView decorator', () => {
  it('should mount the component when in view', () => {
    mockIsIntersecting(div, true);
    expect(instance.$isMounted).toBe(true);
  });

  it('should not mount the component when not in view', () => {
    mockIsIntersecting(div, false);
    expect(instance.$isMounted).toBe(false);
  });

  it('should destroy the component when not in view', async () => {
    mockIsIntersecting(div, true);
    expect(instance.$isMounted).toBe(true);
    mockIsIntersecting(div, false);
    await wait(1);
    expect(instance.$isMounted).toBe(false);
  });

  it('should disconnect the observer when terminated', () => {
    const observer = intersectionMockInstance(div);
    const disconnect = jest.spyOn(observer, 'disconnect');
    instance.$terminate();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
