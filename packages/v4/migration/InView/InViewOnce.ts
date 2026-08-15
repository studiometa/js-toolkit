import { type BaseConfig } from '../../src/index.js';
import { InView } from './InView.js';

/** One-shot variant of {@link InView}; emits only `in-view`. */
export class InViewOnce extends InView {
  static config: BaseConfig = {
    name: 'InViewOnce',
    mountStrategy: 'visible',
  };

  /** Suppress `out-of-view`, including when the element is removed. */
  destroyed(): void {
    // no-op
  }
}
