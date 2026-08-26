import { Base, type BaseConfig, type ChildrenCollection } from '../../src/index.js';
import { ScrollAnimationTarget } from './ScrollAnimationTarget.js';
import {
  withScrolledInView,
  type ScrollInViewProps,
  type ScrolledInViewRender,
} from './withScrolledInView.js';

/** Drives a live group of scroll animation targets in one read/write pass. */
export class ScrollAnimationTimeline extends withScrolledInView(Base) {
  static config: BaseConfig = {
    name: 'ScrollAnimationTimeline',
    components: { ScrollAnimationTarget },
  };

  targets: ChildrenCollection<ScrollAnimationTarget> =
    this.$watchChildren<ScrollAnimationTarget>('ScrollAnimationTarget');

  scrolledInView(props: ScrollInViewProps): ScrolledInViewRender {
    const renders: ScrolledInViewRender[] = [];
    for (const target of this.targets) {
      const render = target.scrolledInView(props);
      if (typeof render === 'function') {
        renders.push(render);
      }
    }
    return () => {
      for (const render of renders) {
        render();
      }
    };
  }
}
