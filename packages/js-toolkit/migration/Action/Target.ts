import { Base, type BaseConfig } from '../../src/index.js';

/** Marker component that makes its element addressable by `Action`. */
export class Target extends Base {
  static config: BaseConfig = {
    name: 'Target',
  };
}
