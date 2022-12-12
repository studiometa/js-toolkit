import { getComponentElements } from '@studiometa/js-toolkit/Base/utils.js';

describe('The `getComponentElements` function', () => {
  it('should find components with multiple declarations', () => {
    const div = document.createElement('div');
    div.innerHTML = `
      <div data-component="Foo"></div>
      <div data-component="Foo,Bar"></div>
      <div data-component="Bar,Foo"></div>
      <div data-component="Bar,Foo,Baz"></div>
      <div data-component="Baz"></div>
    `;

    const foo = getComponentElements('Foo', div);
    const bar = getComponentElements('Bar', div);
    const baz = getComponentElements('Baz', div);
    expect(foo).toHaveLength(4);
    expect(bar).toHaveLength(3);
    expect(baz).toHaveLength(2);
  });
})
