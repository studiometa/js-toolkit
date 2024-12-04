import { describe, it, expect, vi } from 'vitest';
import { useMutation } from '@studiometa/js-toolkit';
import { nextTick } from '@studiometa/js-toolkit/utils';
import { h } from '#test-utils';

describe('The `useMutation` service', () => {
  it('should trigger on attribute change by default', async () => {
    const div = h('div');
    const service = useMutation(div);
    const fn = vi.fn();

    service.add('key', fn);
    div.classList.add('foo');
    await nextTick();

    expect(fn).toHaveBeenLastCalledWith(service.props());
    fn.mockRestore();

    service.remove('key');
    div.classList.add('foo');

    expect(fn).not.toHaveBeenCalled();
  });

  it('should accept mutation observer options as second parameter', async () => {
    const em = h('em');
    const span = h('span', em);
    const div = h('div', span);
    const service = useMutation(div, { childList: true, subtree: true });
    const fn = vi.fn();

    service.add('key', fn);
    em.remove();
    await nextTick();

    expect(fn).toHaveBeenLastCalledWith(service.props());
    expect(service.props().mutations[0].removedNodes[0]).toBe(em);

    service.remove('key');
  });

  it('should use documentElement as default target', async () => {
    const service = useMutation();
    const fn = vi.fn();

    service.add('key', fn);
    document.documentElement.classList.add('foo');

    await nextTick();

    expect(fn).toHaveBeenLastCalledWith(service.props());
    service.remove('key');
  });
});
