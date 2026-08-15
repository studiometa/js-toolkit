import { describe, expect, it } from 'vitest';
import { Base, type ComponentImporter } from './Base.js';
import { isBaseConstructor } from './component-brand.js';

describe('Base constructor brand', () => {
  it('recognises Base and every inherited level', () => {
    class Direct extends Base {
      static config = { name: 'DirectBrand' };
    }
    class Subclass extends Direct {
      static config = { name: 'SubclassBrand' };
    }

    expect(isBaseConstructor(Base)).toBe(true);
    expect(isBaseConstructor(Direct)).toBe(true);
    expect(isBaseConstructor(Subclass)).toBe(true);
  });

  it('rejects unrelated classes, functions, and import thunks', () => {
    class WrongWithConfig {
      static config = { name: 'WrongWithConfig' };
    }
    function wrongFunction() {}
    const importer: ComponentImporter = async () => ({ default: Base });

    expect(isBaseConstructor(WrongWithConfig)).toBe(false);
    expect(isBaseConstructor(wrongFunction)).toBe(false);
    expect(isBaseConstructor(importer)).toBe(false);
    expect(isBaseConstructor(undefined)).toBe(false);
  });
});
