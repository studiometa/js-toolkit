import { jest } from '@jest/globals';
import { useKey } from '@studiometa/js-toolkit';

describe('useKey', () => {
  const keydown = new KeyboardEvent('keydown', { keyCode: 27 });
  const keyup = new KeyboardEvent('keyup', { keyCode: 27 });
  const { add, remove, props } = useKey();
  let keyProps;
  let fn;

  beforeEach(() => {
    remove('useKey');
    fn = jest.fn((p) => {
      keyProps = p;
    });
    add('useKey', fn);
  });

  test('exports the `add`, `remove` and `props` methods', () => {
    expect(typeof add).toBe('function');
    expect(typeof remove).toBe('function');
    expect(typeof props).toBe('function');
  });

  test('callbacks with the same key are not allowed', () => {
    const warnMock = jest.spyOn(console, 'warn');
    warnMock.mockImplementation(() => null);
    add('useKey', () => {});
    expect(warnMock).toHaveBeenCalledWith(
      'The key `useKey` has already been added.'
    );
    warnMock.mockRestore();
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
    expect(fn).toHaveBeenCalledTimes(1);
    expect(keyProps.direction).toBe('up');
    expect(keyProps.ESC).toBe(true);
    expect(keyProps.triggered).toBe(1);
    document.dispatchEvent(keyup);
    expect(keyProps.triggered).toBe(1);
  });

  test('callback should not be triggered after removal', () => {
    remove('useKey');
    document.dispatchEvent(keydown);
    expect(fn).not.toHaveBeenCalled();
    expect(keyProps.direction).toBe('up');
  });
});
