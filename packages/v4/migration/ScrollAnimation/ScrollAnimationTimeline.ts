import { Base, type BaseConfig, type ChildrenCollection } from '../../src/index.js';
import { ScrollAnimationTarget } from './ScrollAnimationTarget.js';
import {
  withScrolledInView,
  type ScrollInViewProps,
  type ScrolledInViewRender,
} from './withScrolledInView.js';

/**
 * ScrollAnimationTimeline — the scroll driver for a group of targets.
 *
 * Port of @studiometa/ui 1.10's `ScrollAnimationTimeline`. It is one of the
 * thirteen `$children` coordinators, and the change is the usual one:
 * `$children.ScrollAnimationTarget` becomes a `$watchChildren` collection, so
 * a target inserted after the timeline mounted is driven with no `$update()`.
 *
 * Forwarding also got cheaper. In v3 each child re-entered the scheduler on
 * its own (`domScheduler.read` + `domScheduler.write` per target, plus one
 * more pair inside `animate`). Here the timeline is already in the read
 * phase, every target computes its styles there, and the returned functions
 * are run together in one write — a timeline of N targets costs one
 * layout pass instead of N.
 */
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
