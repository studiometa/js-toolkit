import { Base, type BaseConfig } from '../../src/index.js';

/**
 * Marks a section `AnchorNav` tracks: mounts once scrolled into view and
 * unmounts once it leaves, so `AnchorNav` can toggle the matching link.
 *
 * @link https://ui.studiometa.dev/reference/items/AnchorNav/
 */
export class AnchorNavTarget extends Base {
  static config: BaseConfig = {
    name: 'AnchorNavTarget',
    mountStrategy: 'in-view',
  };
}
