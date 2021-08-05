import { jest } from '@jest/globals';
import useDrag from '@studiometa/js-toolkit/services/drag';

describe('The drag service', () => {
  it('should start, drag and drop', () => {
    const fn = jest.fn();
    const div = document.createElement('div');
    const { add } = useDrag(div, { factor: 0.1 });

    add('key', fn);
    div.dispatchEvent(new MouseEvent('mousedown'));
    expect(fn).toHaveBeenCalledWith({
      target: div,
      mode: 'start',
      hasInertia: false,
      isGrabbing: true,
      x: 0,
      y: 0,
      delta: { x: 0, y: 0 },
      distance: { x: 0, y: 0 },
      final: { x: 0, y: 0 },
      origin: { x: 0, y: 0 },
    });

    const clientX = window.innerWidth / 2 + 10;
    const clientY = window.innerHeight / 2 + 10;
    document.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }));
    expect(fn.mock.calls).toMatchSnapshot();
  });

  it('should run with inertia and stop', () => {
    const fn = jest.fn();
    const div = document.createElement('div');
    const { add } = useDrag(div, { factor: 0.2 });
    jest.useFakeTimers();

    add('key', fn);
    div.dispatchEvent(new MouseEvent('mousedown'));
    const clientX = window.innerWidth / 2 + 10;
    const clientY = window.innerHeight / 2 + 10;
    document.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }));
    jest.runAllTimers();
    expect(fn.mock.calls).toMatchSnapshot();
    jest.useRealTimers();
  });


  it('should not trigger the callback when stopped', () => {
    const fn = jest.fn();
    const div = document.createElement('div');
    const { add, remove } = useDrag(div, { factor: 0.2 });

    add('key', fn);
    div.dispatchEvent(new MouseEvent('mousedown'));
    expect(fn).toHaveBeenCalledTimes(1);
    remove('key');
    div.dispatchEvent(new MouseEvent('mousedown'));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
