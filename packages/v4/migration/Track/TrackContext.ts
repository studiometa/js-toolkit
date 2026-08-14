import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';
import { deepmerge } from '../utils/deepmerge.js';
import { warn } from './utils.js';

export type TrackContextProps = BaseProps & {
  $refs: {
    context?: HTMLScriptElement;
  };
  $options: {
    context: Record<string, unknown>;
  };
};

/**
 * TrackContext — hierarchical context merged into descendant `Track`s.
 *
 * Port of `@studiometa/ui` 1.10's `TrackContext`, essentially unchanged: the
 * two sources (`context` ref and `data-option-context`), the merge order
 * (attribute over ref), and the recursion up the ancestor chain (outermost
 * first, innermost wins).
 *
 * | change | forced by |
 * | --- | --- |
 * | `interface TrackContextProps extends BaseProps` → a type alias | REPORT.md gap 14. |
 * | `this.$warn(...)` → `warn(...)` | REPORT.md gap 10. |
 * | `deepmerge(a, b, { arrayMerge })` → `deepmerge(a, b)` | the copied merge has "arrays replace" as its only behaviour. |
 *
 * ## Why this is *not* provide/inject, which is the question v4 makes you ask
 *
 * Every instinct from the `Slider` and `Data*` ports says a hierarchical value
 * shared with descendants is `$provide`/`$inject`. It is the wrong primitive
 * here, for three reasons that are worth separating:
 *
 * 1. **A provider cannot inject from itself.** The chain is built by each
 *    `TrackContext` merging its parent's context into its own, and a context
 *    request dispatched from `this.$el` is answered by this component's own
 *    provider. v3 sidesteps it because `$closest()` starts at
 *    `parentElement`; provide/inject has no such "skip me" form.
 * 2. **The value is a pure function of the DOM.** A context is two static
 *    attributes. Nothing subscribes, nothing changes, and the whole apparatus
 *    of a replayed request buys nothing over a walk of `parentElement`.
 * 3. **`$closest()` reads what is there now.** A context resolved eagerly at
 *    provide time would have to be invalidated when an intermediate scope
 *    moved; a getter cannot be stale.
 *
 * What provide/inject *would* have bought is mount-order independence, since
 * `$closest()` only answers for a **mounted** ancestor. That is a real
 * exposure and the `mounted` pseudo-event is where it bites — see
 * `AbstractTrack`, which answers it with the scheduler's background lane
 * rather than with a context request.
 */
export class TrackContext<T extends BaseProps = BaseProps> extends Base<TrackContextProps & T> {
  static config: BaseConfig = {
    name: 'TrackContext',
    refs: ['context'],
    options: {
      context: {
        type: Object,
        default: () => ({}),
      },
    },
  };

  /**
   * The data from the optional `context` ref, a
   * `<script data-ref="context" type="application/json">` element.
   */
  get scriptData(): Record<string, unknown> {
    const script = this.$refs.context;

    if (!script) {
      return {};
    }

    try {
      return (JSON.parse(script.textContent || '{}') as Record<string, unknown> | null) ?? {};
    } catch (error) {
      warn('Invalid JSON in the `context` ref:', error);
      return {};
    }
  }

  /**
   * The data from the `data-option-context` attribute, which is parsed on
   * access and throws on invalid JSON.
   */
  get attrData(): Record<string, unknown> {
    try {
      return this.$options.context ?? {};
    } catch (error) {
      warn('Invalid JSON in the `data-option-context` attribute:', error);
      return {};
    }
  }

  /** This component's own context: the ref, with the attribute over it. */
  get ownData(): Record<string, unknown> {
    return deepmerge(this.scriptData, this.attrData);
  }

  /**
   * The full context: this component's own, over every ancestor's.
   *
   * `$closest()` starts at the parent element, so a `TrackContext` never
   * resolves to itself and the recursion terminates.
   */
  get context(): Record<string, unknown> {
    const parent = this.$closest<TrackContext>('TrackContext');
    const { ownData } = this;
    return parent ? deepmerge(parent.context, ownData) : ownData;
  }
}
