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
let divRectSpy;
let offsetTopSpy;
let offsetLeftSpy;
let offsetWidthSpy;
let offsetHeightSpy;
const fn = jest.fn();

beforeEach(() => {
  fn.mockClear();
  window.pageYOffset = 0;
  window.pageXOffset = 0;
  div = document.createElement('div');
  offsetTopSpy = jest.spyOn(div, 'offsetTop', 'get').mockImplementation(() =>  500);
  offsetLeftSpy = jest.spyOn(div, 'offsetLeft', 'get').mockImplementation(() =>  500);
  offsetWidthSpy = jest.spyOn(div, 'offsetWidth', 'get').mockImplementation(() =>  100);
  offsetHeightSpy = jest.spyOn(div, 'offsetHeight', 'get').mockImplementation(() =>  100);
  divRectSpy = jest.spyOn(div, 'getBoundingClientRect');
  divRectSpy.mockImplementation(() => ({
    height: 100,
    width: 100,
    top: 500,
    y: 500,
    left: 500,
    x: 500,
  }));
});

afterEach(() => {
  afterEachCallback();
  divRectSpy.mockRestore();
  offsetTopSpy.mockRestore();
  offsetLeftSpy.mockRestore();
  offsetWidthSpy.mockRestore();
  offsetHeightSpy.mockRestore();
});

describe('The withScrolledInView decorator', () => {
  it('should trigger the `scrolledInView` hook when in view', async () => {
    class Foo extends withScrolledInView(Base) {
      static config = {
        name: 'Foo',
      };

      scrolledInView(props) {
        fn(props);
      }
    }
    new Foo(div);

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
    const [last] = fn.mock.calls.pop();
    delete last.dampedProgress;
    expect(last).toMatchSnapshot();
    scrollHeightSpy.mockRestore();
    scrollWidthSpy.mockRestore();
  });

  it('should trigger the `scrolledInView` hook when in view with the `useOffsetSizes` option' , async () => {
    class Foo extends withScrolledInView(Base, { useOffsetSizes: true }) {
      static config = {
        name: 'Foo',
      };

      scrolledInView(props) {
        fn(props);
      }
    }
    new Foo(div);

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
    const [last] = fn.mock.calls.pop();
    delete last.dampedProgress;
    expect(last).toMatchSnapshot();
    scrollHeightSpy.mockRestore();
    scrollWidthSpy.mockRestore();
  });
});
