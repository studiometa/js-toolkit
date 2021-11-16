import autoBind from '@studiometa/js-toolkit/utils/object/autoBind';

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

  it('should bind methods and handle the include options', () => {
    class Foo {
      constructor() {
        autoBind(this, { include: ['bar', /^bar/] });
      }

      foo() {
        return this;
      }
    }

    class Bar extends Foo {
      bar() {
        return this;
      }

      baz() {
        return this;
      }
    }

    const bar = new Bar();
    expect(bar.bar.call(undefined)).toBe(bar);
    expect(bar.bar).not.toBe(Object.getPrototypeOf(bar).bar);
    expect(bar.baz).toBe(Object.getPrototypeOf(bar).baz);
  });

  it('should bind methods and handle the exclude options', () => {
    class Foo {
      constructor() {
        autoBind(this, { exclude: [/^baz/] });
      }

      foo() {
        return this;
      }
    }

    class Bar extends Foo {
      bar() {
        return this;
      }

      baz() {
        return this;
      }
    }

    const bar = new Bar();
    expect(bar.bar.call(undefined)).toBe(bar);
    expect(bar.bar).not.toBe(Object.getPrototypeOf(bar).bar);
    expect(bar.baz).toBe(Object.getPrototypeOf(bar).baz);
  });
});
