import { describe, expect, it } from 'vitest';
import { createElement } from './dom.js';

describe('createElement', () => {
  it('creates a div by default', () => {
    expect(createElement().outerHTML).toBe('<div></div>');
  });

  it('creates the given tag, custom elements included', () => {
    expect(createElement('a').outerHTML).toBe('<a></a>');
    expect(createElement('custom-element').outerHTML).toBe('<custom-element></custom-element>');
  });

  it('sets attributes, with their names in kebab-case', () => {
    expect(createElement('a', { href: '#', dataOptionFoo: 'foo' }).outerHTML).toBe(
      '<a href="#" data-option-foo="foo"></a>',
    );
  });

  it('sets a data object as data- attributes', () => {
    expect(createElement('div', { data: { optionFoo: 'foo', option_bar: 'bar' } }).outerHTML).toBe(
      '<div data-option-foo="foo" data-option-bar="bar"></div>',
    );
  });

  it('reads a string, a node or an array as content', () => {
    expect(createElement('a', 'hello world').outerHTML).toBe('<a>hello world</a>');
    expect(createElement('a', createElement('span')).outerHTML).toBe('<a><span></span></a>');
    expect(createElement('a', ['hello world', createElement('span')]).outerHTML).toBe(
      '<a>hello world<span></span></a>',
    );
  });

  it('takes attributes and content together', () => {
    expect(createElement('a', { href: '#' }, [createElement('span')]).outerHTML).toBe(
      '<a href="#"><span></span></a>',
    );
    expect(createElement('a', { href: '#' }, 'hello world').outerHTML).toBe(
      '<a href="#">hello world</a>',
    );
  });

  it('escapes the content it is given', () => {
    expect(createElement('div', '<script>alert(1)</script>').innerHTML).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    );
  });
});
