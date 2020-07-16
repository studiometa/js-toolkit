import { add, remove } from '~/utils/css/styles';

describe('styles methods', () => {
  const element = document.createElement('div');

  it('should add styles to an element', () => {
    add(element, { display: 'block', width: '100px' });
    expect(element.style.cssText).toEqual('display: block; width: 100px;');
  });

  it('should remove styles from an element', () => {
    remove(element, { display: 'block' }, 'remove');
    expect(element.style.cssText).toEqual('width: 100px;');
    remove(element, { width: '100px' }, 'remove');
    expect(element.style.cssText).toEqual('');
  });

  it('should fail silently', () => {
    expect(add(element, 'foo')).toBeUndefined();
    expect(add(element)).toBeUndefined();
    expect(add()).toBeUndefined();
  });
});
