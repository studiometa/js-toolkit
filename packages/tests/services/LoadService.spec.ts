import { describe, it, expect, vi } from 'vitest';
import { useLoad } from '@studiometa/js-toolkit';
import { dispatch } from '#test-utils';

describe('The `useLoad` service', () => {
  it('should trigger on load', () => {
    const service = useLoad();
    const fn = vi.fn();
    service.add('key', fn);
    dispatch(window, 'load');
    expect(fn).toHaveBeenLastCalledWith(service.props());
    fn.mockRestore();
    service.remove('key');
    dispatch(window, 'load');
    expect(fn).not.toHaveBeenCalled();
  });
});
