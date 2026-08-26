import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { historyPush, historyReplace, objectToURLSearchParams } from './history.js';

describe('objectToURLSearchParams', () => {
  it('writes flat values', () => {
    expect(objectToURLSearchParams({ a: 'foo', b: 1, c: true }, '').toString()).toBe(
      'a=foo&b=1&c=true',
    );
  });

  it('writes arrays and objects as bracketed names', () => {
    expect(objectToURLSearchParams({ a: ['foo', 'bar'] }, '').toString()).toBe(
      'a%5B0%5D=foo&a%5B1%5D=bar',
    );
    expect(objectToURLSearchParams({ a: { b: { c: 'foo' } } }, '').toString()).toBe(
      'a%5Bb%5D%5Bc%5D=foo',
    );
  });

  it('deletes a param set to an empty value', () => {
    expect(objectToURLSearchParams({ a: '' }, 'a=foo&b=bar').toString()).toBe('b=bar');
    expect(objectToURLSearchParams({ a: null }, 'a=foo').toString()).toBe('');
    expect(objectToURLSearchParams({ a: undefined }, 'a=foo').toString()).toBe('');
  });

  it('merges into the given search', () => {
    expect(objectToURLSearchParams({ b: 'two' }, 'a=one').toString()).toBe('a=one&b=two');
    expect(objectToURLSearchParams({ a: 'two' }, 'a=one').toString()).toBe('a=two');
  });

  it('merges into the current search by default', () => {
    history.replaceState({}, '', '?a=one');
    expect(objectToURLSearchParams({ b: 'two' }).toString()).toBe('a=one&b=two');
  });
});

describe('historyPush and historyReplace', () => {
  let initial: string;

  beforeEach(() => {
    initial = location.href;
    history.replaceState({}, '', '/base?a=one#section');
  });

  afterEach(() => {
    history.replaceState({}, '', initial);
  });

  it('keeps the parts the caller does not name', () => {
    historyReplace({ path: '/other' });
    expect(location.pathname).toBe('/other');
    expect(location.search).toBe('?a=one');
    expect(location.hash).toBe('#section');
  });

  it('merges an object into the current search', () => {
    historyReplace({ search: { b: 'two' } });
    expect(location.search).toBe('?a=one&b=two');
  });

  it('replaces the search when given a URLSearchParams', () => {
    historyReplace({ search: new URLSearchParams('c=three') });
    expect(location.search).toBe('?c=three');
  });

  it('accepts a hash with or without its number sign', () => {
    historyReplace({ hash: 'other' });
    expect(location.hash).toBe('#other');
    historyReplace({ hash: '#third' });
    expect(location.hash).toBe('#third');
  });

  it('drops the search when every param is emptied', () => {
    historyReplace({ search: { a: '' } });
    expect(location.search).toBe('');
    expect(location.hash).toBe('#section');
  });

  it('stores the state and adds an entry only when pushing', () => {
    const { length } = history;
    historyReplace({ path: '/replaced' }, { step: 1 });
    expect(history.state).toEqual({ step: 1 });
    expect(history.length).toBe(length);

    historyPush({ path: '/pushed' }, { step: 2 });
    expect(history.state).toEqual({ step: 2 });
    expect(location.pathname).toBe('/pushed');
    expect(history.length).toBe(length + 1);

    history.back();
  });
});
