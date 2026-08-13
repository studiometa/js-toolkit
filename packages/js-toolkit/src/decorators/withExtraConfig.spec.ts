import { describe, it, expect, vi } from 'vitest';
import { Base, BaseConfig, withExtraConfig } from '@studiometa/js-toolkit';

describe('The `withExtraConfig` decorator', () => {
  it('should merge config of a given class', () => {
    class Foo extends Base {
      static config: BaseConfig = {
        name: 'Foo',
        log: true,
        debug: true,
      };
    }

    const Bar = withExtraConfig(Foo, { log: false, debug: false });

    expect(Bar.config.log).toBe(false);
    expect(Bar.config.debug).toBe(false);
    expect(Bar.config.name).toBe('FooWithExtraConfig');
    expect(withExtraConfig(Foo, { name: 'OtherName' }).config.name).toBe('OtherName');
  });

  it('should use deepmerge options', () => {
    class Foo extends Base {
      static config = {
        name: 'Foo',
      };
    }

    const fn = vi.fn();
    withExtraConfig(Foo, { refs: ['one'] }, { arrayMerge: fn });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
