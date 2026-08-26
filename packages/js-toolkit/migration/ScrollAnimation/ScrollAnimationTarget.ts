import type { BaseConfig } from '../../src/index.js';
import { clamp01, damp } from '../../src/utils/maths.js';
import { AbstractScrollAnimation } from './AbstractScrollAnimation.js';
import type { ScrollInViewProps, ScrolledInViewRender } from './withScrolledInView.js';

/** Timeline target with independent progress damping. */
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
