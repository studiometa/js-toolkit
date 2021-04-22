import { jest } from '@jest/globals';
import useKey from '@studiometa/js-toolkit/services/key';

describe('useKey', () => {
  const keydown = new KeyboardEvent('keydown', { keyCode: 27 });
  const keyup = new KeyboardEvent('keyup', { keyCode: 27 });
  const { add, remove, props } = useKey();
  let keyProps;
  const fn = jest.fn(p => {
    keyProps = p;
  });
  add('useKey', fn);

  test('exports the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  test('callbacks with the same key are not allowed', () => {
    expect(() => {
      add('useKey', () => {});
    }).toThrow('A callback with the key `useKey` has already been registered.');
  });

  test('callback should be triggered on keydown', () => {
    document.dispatchEvent(keydown);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(keyProps.direction).toBe('down');
    expect(keyProps.ESC).toBe(true);
    expect(keyProps.triggered).toBe(1);
    document.dispatchEvent(keydown);
    expect(keyProps.triggered).toBe(2);
  });

  test('callback should be triggered on keyup', () => {
    document.dispatchEvent(keyup);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(keyProps.direction).toBe('up');
    expect(keyProps.ESC).toBe(true);
    expect(keyProps.triggered).toBe(1);
    document.dispatchEvent(keyup);
    expect(keyProps.triggered).toBe(1);
  });

  test('callback should not be triggered after removal', () => {
    remove('useKey');
    document.dispatchEvent(keydown);
    expect(fn).toHaveBeenCalledTimes(4);
    expect(keyProps.direction).toBe('up');
  });
});
