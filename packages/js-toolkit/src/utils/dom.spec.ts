import { afterEach, describe, expect, it } from 'vitest';
import { createElement, getOffsetSizes } from './dom.js';

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

describe('getOffsetSizes', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.body.removeAttribute('style');
    window.scrollTo(0, 0);
  });

  /** Compare against the platform, which is right whenever no transform runs. */
  function expectToMatchBoundingClientRect(element: HTMLElement) {
    const { x, y, width, height, top, right, bottom, left } = element.getBoundingClientRect();
    const sizes = getOffsetSizes(element);

    for (const [key, value] of Object.entries({ x, y, width, height, top, right, bottom, left })) {
      expect(sizes[key as keyof typeof sizes], key).toBeCloseTo(value, 5);
    }
  }

  it('answers a detached element with zeroes', () => {
    expect(getOffsetSizes(createElement())).toEqual({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it('matches getBoundingClientRect on a plain element', () => {
    const element = createElement('div');
    element.style.cssText = 'width: 100px; height: 50px; margin: 20px 0 0 30px;';
    document.body.append(element);

    expectToMatchBoundingClientRect(element);
  });

  it('matches getBoundingClientRect through positioned and bordered ancestors', () => {
    const element = createElement('div');
    element.style.cssText =
      'width: 100px; height: 50px; position: absolute; top: 15px; left: 25px;';
    const parent = createElement('div', [element]);
    parent.style.cssText =
      'position: relative; top: 40px; left: 10px; border: 7px solid; padding: 11px;';
    document.body.append(parent);

    expectToMatchBoundingClientRect(element);
  });

  it('accounts for the page scroll', () => {
    const element = createElement('div');
    element.style.cssText = 'width: 100px; height: 50px; margin-top: 3000px;';
    document.body.append(element, createElement('div', ' '));
    document.body.style.height = '5000px';
    window.scrollTo(0, 800);

    expect(window.scrollY).toBeGreaterThan(0);
    expectToMatchBoundingClientRect(element);
  });

  it('accounts for the scroll of an ancestor with an overflow', () => {
    const element = createElement('div');
    element.style.cssText = 'width: 50px; height: 50px; margin: 400px 0 0 300px;';
    const scroller = createElement('div', [element]);
    scroller.style.cssText = 'width: 200px; height: 200px; overflow: auto; border: 4px solid;';
    document.body.append(scroller);
    scroller.scrollTo(120, 250);

    expect(scroller.scrollTop).toBe(250);
    expectToMatchBoundingClientRect(element);
  });

  it('ignores the transforms getBoundingClientRect applies', () => {
    const element = createElement('div');
    element.style.cssText = 'width: 100px; height: 50px; margin: 20px 0 0 30px;';
    document.body.append(element);

    const untransformed = getOffsetSizes(element);
    element.style.transform = 'translateX(10px) rotate(45deg) scale(0.5)';

    expect(getOffsetSizes(element)).toEqual(untransformed);
    expect(element.getBoundingClientRect().left).not.toBeCloseTo(untransformed.left, 5);
  });
});
