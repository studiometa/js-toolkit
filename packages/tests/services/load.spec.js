import { useLoad } from '@studiometa/js-toolkit';

describe('The `useLoad` service', () => {
  it('sould return its props', () => {
    const load = useLoad();
    expect(load.props()).toEqual({});
  });
});
