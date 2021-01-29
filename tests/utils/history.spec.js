import { push, replace } from '~/utils/history';

beforeEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('The history `push` method', () => {
  it('should work', () => {
    expect(window.location.href).toBe('http://localhost/');
    push({ path: 'bar', search: { query: 'baz', baz: false }, hash: 'foo' });
    expect(window.location.href).toBe('http://localhost/bar?query=baz#foo');
  });

  it('should remove search params when evaluated as falsy values', () => {
    window.history.replaceState({}, '', '/?query=foo');
    expect(window.location.href).toBe('http://localhost/?query=foo');
    push({ search: { query: '' } });
    expect(window.location.href).toBe('http://localhost/');
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
});

describe('The history `replace` method', () => {
  it('should work', () => {
    replace({ path: 'bar', search: { query: 'baz' }, hash: '#foo' });
    expect(window.location.href).toBe('http://localhost/bar?query=baz#foo');
  });
});
