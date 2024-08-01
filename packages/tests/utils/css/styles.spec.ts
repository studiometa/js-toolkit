import { describe, it, expect } from '@jest/globals';
import { addStyle as add, removeStyle as remove } from '@studiometa/js-toolkit/utils';

describe('styles methods', () => {
  const element = document.createElement('div');

  it('should add styles to an element', () => {
    add(element, { display: 'block', width: '100px' });
    expect(element.style.cssText).toBe('display: block; width: 100px;');
  });

  it('should remove styles from an element', () => {
    remove(element, { display: 'block' });
    expect(element.style.cssText).toBe('width: 100px;');
    remove(element, { width: '100px' });
    expect(element.style.cssText).toBe('');
  });

  it('should fail silently', () => {
    expect(add(element, 'foo')).toBeUndefined();
    expect(add(element)).toBeUndefined();
    expect(add()).toBeUndefined();
  });
});
