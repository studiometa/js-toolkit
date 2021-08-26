import { jest } from '@jest/globals';
import Base from '@studiometa/js-toolkit/abstracts/Base';
import withExtraConfig from '@studiometa/js-toolkit/decorators/withExtraConfig';

describe('The `withExtraConfig` decorator', () => {
  it('should merge config of a given class', () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
        log: true,
        debug: true,
      }
    }

    const Bar = withExtraConfig(Foo, { log: false, debug: false });

    expect(Bar.config.log).toBe(false)
    expect(Bar.config.debug).toBe(false);
    expect(Bar.config.name).toBe('FooWithExtraConfig');
    expect(withExtraConfig(Foo, { name: 'OtherName' }).config.name).toBe('OtherName');
  })

  it('should use deepmerge options', () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
      }
    }

    const fn = jest.fn();
    const Bar = withExtraConfig(Foo, { refs: ['one'] }, { arrayMerge: fn })
    expect(fn).toHaveBeenCalledTimes(1);
  })
})
