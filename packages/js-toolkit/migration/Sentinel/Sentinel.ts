import { Base, component, withInView, type BaseProps, type InViewProps } from '../../src/index.js';

export type SentinelProps = BaseProps & {
  $emits: { intersected: InViewProps };
};

/**
 * A minimal marker element that reports its own viewport intersection: the
 * raw `IntersectionObserverEntry`, not `InView`'s collapsed in/out boolean.
 * `Sticky` needs `entry.boundingClientRect.y` to tell "scrolled above the
 * viewport" apart from "scrolled below it", which the collapsed boolean
 * cannot express.
 *
 * @link https://ui.studiometa.dev/reference/items/Sentinel/
 */
@component({ name: 'Sentinel' })
export class Sentinel<T extends BaseProps = BaseProps> extends withInView(Base, {
  threshold: [0, 1],
})<SentinelProps & T> {
  intersected(props: InViewProps): void {
    this.$emit('intersected', props);
  }
}
