import { Base, type BaseConfig } from '../../src/index.js';

/**
 * Target — a marker component that makes its element addressable by `Action`.
 *
 * Port of @studiometa/ui 1.10's `Target` (8 code lines → 6 here). It defines
 * no behaviour; `data-component="Target"` is only there so `Action` can
 * resolve the element by name.
 *
 * It is worth naming what this component *is*, because v4 makes it slightly
 * odd: it exists purely to put an entry in a lookup that v4 no longer keeps
 * (see `instances.ts`). Under the port's DOM-based resolution, the entry it
 * creates is the `data-component="Target"` attribute itself — so `Target` is
 * now a component whose only job is to make the registry mount an instance
 * that a `querySelectorAll` can find. That still works, and it is still the
 * cheapest way to write "this element is addressable", but it is the one
 * place where the family's shape is an artefact of v3's registry rather than
 * of anything a user wanted.
 *
 * The empty `TargetProps` interface v3 declared is dropped: it was
 * `interface TargetProps extends BaseProps {}` and added nothing.
 */
export class Target extends Base {
  static config: BaseConfig = {
    name: 'Target',
  };
}
