import { jest } from '@jest/globals';
import { push, replace } from '@studiometa/js-toolkit/utils/history';

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('The history `push` method', () => {
  it('should work', () => {
    expect(window.location.href).toBe('http://localhost/');
    push({ path: 'bar', search: { query: 'baz', baz: false }, hash: 'foo' });
    expect(window.location.href).toBe('http://localhost/bar?query=baz&baz=false#foo');
  });

  it('should remove search params when their value is null, undefined or an empty string', () => {
    window.history.replaceState({}, '', '/?query=foo&nullish=foo&notDefined=foo&false=true');
    expect(window.location.href).toBe('http://localhost/?query=foo&nullish=foo&notDefined=foo&false=true');
    push({ search: { query: '', notPresent: '', nullish: null, notDefined: undefined, false: false } });
    expect(window.location.href).toBe('http://localhost/?false=false');
  });

  it('should remove the hash when none given', () => {
    window.history.replaceState({}, '', '/#foo');
    expect(window.location.href).toBe('http://localhost/#foo');
    push({ hash: '' });
    expect(window.location.href).toBe('http://localhost/');
  });

  it('should convert arrays and objects to valid PHP $_GET params', () => {
    push({ search: { array: [1, 2, { obj: true }], object: { foo: 'foo', bar: { baz: 'bar' } } } });
    expect(decodeURI(window.location.href)).toBe('http://localhost/?array[0]=1&array[1]=2&array[2][obj]=true&object[foo]=foo&object[bar][baz]=bar');
  });

  it('should fail silently when the history API is not supported', () => {
    const historyMock = jest.spyOn(window, 'history', 'get');
    historyMock.mockImplementation(() => undefined);
    const { href } = window.location;
    push({ path: 'baz' });
    expect(href).toBe(window.location.href);
    historyMock.mockRestore();
  });

  it('should pass the data and title to the history API', () => {
    const pushMock = jest.spyOn(window.history, 'pushState');
    push({ path: '/foo' }, { data: 'foo' }, 'title');
    expect(pushMock).toHaveBeenCalledWith({ data: 'foo' }, 'title', '/foo');
    push({ path: '/bar' });
    expect(pushMock).toHaveBeenCalledWith({}, '', '/bar');
    pushMock.mockRestore();
  });

  it('should accept URLSearchParams instance as search', () => {
    const search = new URLSearchParams();
    search.set('foo', 'bar');
    push({ search });
    expect(window.location.href).toBe('http://localhost/?foo=bar');
  });
});

describe('The history `replace` method', () => {
  it('should work', () => {
    replace({ path: 'bar', search: { query: 'baz' }, hash: '#foo' });
    expect(window.location.href).toBe('http://localhost/bar?query=baz#foo');
  });
});
