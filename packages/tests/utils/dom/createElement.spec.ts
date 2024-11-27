import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createElement } from '@studiometa/js-toolkit/utils';

describe('The createElement function', () => {
  it('should create a div by default', () => {
    expect(createElement().outerHTML).toMatchInlineSnapshot(`"<div></div>"`);
  });

  it('should create give elements', () => {
    expect(createElement('a').outerHTML).toMatchInlineSnapshot(`"<a></a>"`);
    expect(createElement('custom-element').outerHTML).toMatchInlineSnapshot(
      `"<custom-element></custom-element>"`,
    );
  });

  it('should accept attributes as second parameter', () => {
    expect(createElement('a', { href: '#' })).toMatchInlineSnapshot(`
      <a
        href="#"
      />
    `);
  });

  it('should convert attribute names from camelCase to dash-case', () => {
    expect(createElement('a', { dataOptionFoo: '#' })).toMatchInlineSnapshot(`
      <a
        data-option-foo="#"
      />
    `);
  });

  it('should accept child as second parameter', () => {
    expect(createElement('a', createElement('span'))).toMatchInlineSnapshot(`
      <a>
        <span />
      </a>
    `);
  });

  it('should accept string as child', () => {
    expect(createElement('a', 'hello world')).toMatchInlineSnapshot(`
      <a>
        hello world
      </a>
    `);
  });

  it('should accept an array of string or element as children', () => {
    expect(createElement('a', ['hello world', createElement('span')])).toMatchInlineSnapshot(`
      <a>
        hello world
        <span />
      </a>
    `);
  });

  it('should accept attributes as second parameter and children as third parameter', () => {
    expect(createElement('a', { href: '#' }, [createElement('span')])).toMatchInlineSnapshot(`
      <a
        href="#"
      >
        <span />
      </a>
    `);


    expect(createElement('a', { href: '#' }, ['hello world', createElement('span')])).toMatchInlineSnapshot(`
      <a
        href="#"
      >
        hello world
        <span />
      </a>
    `);
  });
});
