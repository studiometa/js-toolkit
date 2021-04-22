import { add, remove, toggle } from '@studiometa/js-toolkit/utils/css/classes';

describe('classes methods', () => {
  const element = document.createElement('div');

  it('should add classes to an element', () => {
    add(element, 'foo bar');
    expect(Array.from(element.classList)).toEqual(['foo', 'bar']);
  });

  it('should remove classes from an element', () => {
    remove(element, 'foo bar');
    expect(Array.from(element.classList)).toEqual([]);
  });

  it('should toggle classes from an element', () => {
    toggle(element, 'foo bar');
    expect(Array.from(element.classList)).toEqual(['foo', 'bar']);
    toggle(element, 'foo bar');
    expect(Array.from(element.classList)).toEqual([]);
  });

  it('should fail silently', () => {
    expect(add(element)).toBeUndefined();
    expect(add()).toBeUndefined();
  });
});
