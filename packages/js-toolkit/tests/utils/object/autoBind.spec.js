import autoBind from '~/utils/object/autoBind';

describe('autoBind method', () => {
  it('should bind methods', () => {
    class Foo {
      constructor() {
        autoBind(this);
      }

      foo() {
        return this;
      }
    }

    class Bar extends Foo {
      bar() {
        return this;
      }

      baz() {}
    }

    const bar = new Bar();
    expect(bar.foo()).toBe(bar);
    expect(bar.bar()).toBe(bar);
    expect(bar.baz()).toBeUndefined();
  });

  it('should bind methods and handle the include and exclude options', () => {
    class Foo {
      constructor() {
        autoBind(this, { include: ['bar', /^bar/], exclude: [/^baz/] });
      }

      foo() {
        return this;
      }
    }

    class Bar extends Foo {
      bar() {
        return this;
      }

      baz() {}
    }

    const bar = new Bar();
    expect(bar.bar()).toBe(bar);
    expect(bar.baz()).toBeUndefined();
  });
});
