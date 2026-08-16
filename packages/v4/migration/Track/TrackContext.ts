import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';
import { deepmerge } from '../../src/utils/deepmerge.js';
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
 * Hierarchical context for descendant trackers. Inner contexts override outer
 * contexts, and attributes override script-ref data.
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

  /** Full ancestor context with this component's data applied last. */
  get context(): Record<string, unknown> {
    const parent = this.$closest<TrackContext>('TrackContext');
    const { ownData } = this;
    return parent ? deepmerge(parent.context, ownData) : ownData;
  }
}
