import { jest } from '@jest/globals';
import Cursor from '@studiometa/js-toolkit/components/Cursor';

/**
 * @typedef {import('@studiometa/js-toolkit/components/Cursor.js').CursorInterface} CursorInterface
 */

const root = document.createElement('div');
/** @type {Cursor & CursorInterface} */
const cursor = new Cursor(root);
cursor.$options.translateDampFactor = 1;
cursor.$options.growDampFactor = 1;
cursor.$options.shrinkDampFactor = 1;

/**
 * @param {Object} options
 * @param {Object} [options.event]
 * @param {Number} options.x
 * @param {Number} options.y
 */
function moveMouse({ event = { target: document }, x, y }) {
  cursor.moved({ event, x, y });
  return new Promise((resolve) => setTimeout(resolve));
}

jest.useFakeTimers();

describe('The Cursor component', () => {
  let renderSpy;

  beforeEach(() => {
    renderSpy = jest.spyOn(cursor, 'render');
  });

  afterEach(() => {
    renderSpy.mockReset();
  });

  it('should render on mount', () => {
    cursor.$mount();
    expect(renderSpy).toHaveBeenLastCalledWith({ x: 0, y: 0, scale: 0 });
  });

  it('should render on mousemove', () => {
    moveMouse({ x: 100, y: 100 });
    jest.runAllTimers();
    expect(renderSpy).toHaveBeenLastCalledWith({
      x: 100,
      y: 100,
      scale: 1,
    });
  });

  it('should disable the `ticked` service when not moving', () => {
    const serviceSpy = jest.spyOn(cursor.$services, 'disable');
    moveMouse({ x: 100, y: 100 });
    jest.runAllTimers();
    expect(serviceSpy).toHaveBeenNthCalledWith(1, 'ticked');
  });

  it('should grow when hovering on grow selectors', () => {
    const div = document.createElement('div');
    div.setAttribute('data-cursor-grow', '');
    moveMouse({ x: 100, y: 100, event: { target: div } });
    jest.runAllTimers();
    expect(renderSpy).toHaveBeenCalledWith({
      x: 100,
      y: 100,
      scale: 2,
    });
  });

  it('should shrink when hovering on shrink selectors', () => {
    const div = document.createElement('div');
    div.setAttribute('data-cursor-shrink', '');
    moveMouse({ x: 100, y: 100, event: { target: div } });
    jest.runAllTimers();

    expect(renderSpy).toHaveBeenCalledWith({
      x: 100,
      y: 100,
      scale: 0.5,
    });
  });

  it('should scale back to the original size when hovering on nothing', () => {
    moveMouse({ event: null, x: 100, y: 100 });
    jest.runAllTimers();

    expect(renderSpy).toHaveBeenCalledWith({
      x: 100,
      y: 100,
      scale: 1,
    });
  });
});
