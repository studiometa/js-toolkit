import { jest } from '@jest/globals';
import Draggable from '@studiometa/js-toolkit/components/Draggable.js';

describe('The Draggable component', () => {
  it('should move its root element', () => {
    const div = document.createElement('div');
    const draggable = new Draggable(div);
    draggable.$mount();
    jest.useFakeTimers();
    div.dispatchEvent(new MouseEvent('mousedown'));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }));
    jest.runAllTimers();
    expect(div.style.transform).toBe('translateX(10px) translateY(10px) translateZ(0)');
  });

  it('should remove the styler when destroyed', () => {
    const div = document.createElement('div');
    const draggable = new Draggable(div);
    draggable.$mount();
    draggable.$destroy();
    expect(draggable.styler).toBeUndefined();
  });
});
