import { jest } from '@jest/globals';
import { Base, withScrolledInView } from '@studiometa/js-toolkit';
import {
  beforeAllCallback,
  afterEachCallback,
  mockIsIntersecting,
} from '../__setup__/mockIntersectionObserver.js';
import wait from '../__utils__/wait.js';

beforeAll(() => beforeAllCallback());

let div;
let instance;
let divRectSpy;
const fn = jest.fn();

class Foo extends withScrolledInView(Base) {
  static config = {
    name: 'Foo',
  };

  scrolledInView(props) {
    fn(props);
  }
}

beforeEach(() => {
  fn.mockClear();
  div = document.createElement('div');
  divRectSpy = jest.spyOn(div, 'getBoundingClientRect');
  divRectSpy.mockImplementation(() => ({
    height: 100,
    width: 100,
    top: 500,
    left: 500,
  }));
  instance = new Foo(div);
});

afterEach(() => {
  afterEachCallback();
  divRectSpy.mockRestore();
});

describe('The withScrolledInView decorator', () => {
  it('should trigger the `scrolledInView` hook when in view', async () => {
    mockIsIntersecting(div, true);
    const scrollHeightSpy = jest.spyOn(document.body, 'scrollHeight', 'get');
    scrollHeightSpy.mockImplementation(() => window.innerHeight * 2);
    const scrollWidthSpy = jest.spyOn(document.body, 'scrollWidth', 'get');
    scrollWidthSpy.mockImplementation(() => window.innerWidth * 2);

    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset = 10;
    window.pageXOffset = 10;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;
    document.dispatchEvent(new Event('scroll'));
    window.pageYOffset *= 2;
    window.pageXOffset *= 2;

    await wait(50);
    expect(fn.mock.calls.pop()).toMatchSnapshot();
    scrollHeightSpy.mockRestore();
    scrollWidthSpy.mockRestore();
  });
});
