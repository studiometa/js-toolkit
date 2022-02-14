import { jest } from '@jest/globals';
import useDrag from '@studiometa/js-toolkit/services/drag';

describe('The drag service', () => {
  // This test fails when run along the othe one in `drag.spec.js`
  it('should prevent click on child elements while dragging', () => {
    const fn = jest.fn();
    const div = document.createElement('div');
    div.innerHTML = '<div></div>';
    const { add } = useDrag(div, { factor: 0.1 });

    add('key', () => ({}));
    div.firstElementChild.addEventListener('click', fn);
    jest.useFakeTimers();
    div.dispatchEvent(new MouseEvent('mousedown'));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 0, clientY: 0 }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 11, clientY: 11 }));
    jest.runAllTimers();
    div.firstElementChild.dispatchEvent(new Event('click'));
    expect(fn).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});
