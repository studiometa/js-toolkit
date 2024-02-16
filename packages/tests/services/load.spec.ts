import { describe, it, expect } from 'bun:test';
import { useLoad } from '@studiometa/js-toolkit';

describe('The `useLoad` service', () => {
  it('sould return its props', () => {
    const load = useLoad();
    expect(Object.keys(load.props())).toEqual(['time']);
  });
});
