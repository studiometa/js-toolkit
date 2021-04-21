import Base from '~/abstracts/Base';

let consoleSpy;
beforeAll(() => {
  consoleSpy = jest.spyOn(console, 'warn');
  consoleSpy.mockImplementation(() => true);
});
afterAll(() => {
  consoleSpy.mockRestore();
});

describe('The `getOptions` function', () => {
  it('should merge old options with the new schema', () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
        oldOption: 'defaultValue',
        anotherOldOption: { foo: true },
        lastOne: new Map(),
      };
    }

    const foo = new Foo(document.createElement('div'));
    expect(foo.$options.oldOption).toBe('defaultValue');
    expect(foo.$options.anotherOldOption).toEqual({ foo: true });
    expect(foo.$options.lastOne).toEqual({});
  });
});
