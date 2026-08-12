import type { BaseConfig } from '../../src/index.js';
import { clamp01, damp } from '../utils/math.js';
import { AbstractScrollAnimation } from './AbstractScrollAnimation.js';
import type { ScrollInViewProps, ScrolledInViewRender } from './withScrolledInView.js';

/**
 * ScrollAnimationTarget — one animated element inside a
 * `ScrollAnimationTimeline`.
 *
 * Port of @studiometa/ui 1.10's `ScrollAnimationTarget`: it damps the
 * timeline's raw progress again with its own factor, so several targets on
 * one range each get their own inertia.
 *
 * v3 wrapped the damping in `domScheduler.read()` and the parent call in
 * `domScheduler.write()`, which is wrong twice over — the maths touches no
 * DOM at all, and running `super.scrolledInView()` in a write phase is what
 * made `animate` schedule a nested read. Here the whole thing is the read
 * pass and the returned function is the write pass.
 */
export class ScrollAnimationTarget extends AbstractScrollAnimation {
  static config: BaseConfig = {
    name: 'ScrollAnimationTarget',
    options: {
      dampFactor: { type: Number, default: 0.1 },
      dampPrecision: { type: Number, default: 0.001 },
    },
  };

  dampedCurrentX = 0;

  dampedCurrentY = 0;

  scrolledInView(props: ScrollInViewProps): ScrolledInViewRender {
    const { dampFactor, dampPrecision } = this.$options as unknown as {
      dampFactor: number;
      dampPrecision: number;
    };

    this.dampedCurrentX = damp(
      props.currentX,
      this.dampedCurrentX,
      dampFactor,
      props.delta,
      dampPrecision,
    );
    this.dampedCurrentY = damp(
      props.currentY,
      this.dampedCurrentY,
      dampFactor,
      props.delta,
      dampPrecision,
    );

    return super.scrolledInView({
      ...props,
      dampedCurrentX: this.dampedCurrentX,
      dampedCurrentY: this.dampedCurrentY,
      dampedProgressX: clamp01((this.dampedCurrentX - props.startX) / (props.endX - props.startX)),
      dampedProgressY: clamp01((this.dampedCurrentY - props.startY) / (props.endY - props.startY)),
    });
  }
}
