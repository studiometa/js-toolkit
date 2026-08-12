import { scheduler, type TickProps } from '../scheduler.js';
import { createServiceMixin, type ServiceMixinOptions } from './mixin.js';
import { createService, type Service } from './service.js';

/**
 * The scheduler's tick props, verbatim: the raf service is a subscription
 * to the framework clock, not a source of its own.
 */
export type RafProps = TickProps;

/**
 * What a `ticked()` callback may return: a function running in the same
 * frame's `write` phase, after every subscriber has measured.
 */
export type RafRender = (props: RafProps) => void;

function createRafService(): Service<RafProps> {
  // Before the first tick there is nothing measured yet: report one 60 Hz
  // frame, the same value the scheduler gives its first tick, rather than a
  // zero outside the documented `[1, 40]` range.
  let props: RafProps = { time: performance.now(), delta: 1000 / 60 };
  // Collected here rather than through the fan-out: returning a value to the
  // service is this service's own convention, not something the shared
  // primitive knows about.
  const renders: RafRender[] = [];

  const service = createService<RafProps>({
    props: () => props,
    start(emit) {
      return scheduler.tick((tickProps) => {
        props = tickProps;
        // The read → write split v3 established: every callback measures
        // together, then every returned render mutates together, so a page
        // full of animations costs one layout per frame instead of one per
        // component.
        scheduler.read(() => {
          renders.length = 0;
          emit(tickProps);
          if (renders.length > 0) {
            const batch = [...renders];
            renders.length = 0;
            scheduler.write(() => {
              for (const render of batch) {
                render(tickProps);
              }
            });
          }
        });
      });
    },
  });

  return {
    props: service.props,
    add(callback) {
      return service.add((tickProps) => {
        const render = callback(tickProps);
        if (typeof render === 'function') {
          renders.push(render as RafRender);
        }
      });
    },
  };
}

let service: Service<RafProps> | undefined;

/**
 * Use the frame service.
 *
 * ```js
 * const unsubscribe = useRaf().add(({ time, delta }) => {
 *   const { width } = el.getBoundingClientRect(); // read phase
 *   return () => {                                // write phase
 *     el.style.setProperty('--width', `${width}px`);
 *   };
 * });
 * ```
 *
 * Unlike v3, this owns no `requestAnimationFrame` loop: it subscribes to the
 * scheduler's tick, so components ticking, scroll-driven animations
 * and lifecycle work share one flush per frame.
 */
export function useRaf(): Service<RafProps> {
  service ??= createRafService();
  return service;
}

/** The method `withRaf()` subscribes for the component. */
export interface RafHook {
  ticked?(props: RafProps): void | RafRender;
}

export type RafMixinOptions = ServiceMixinOptions<void>;

/**
 * Subscribe a component's `ticked()` method to the frame service, for its
 * whole mount cycle:
 *
 * ```js
 * class Marquee extends withRaf(Base) {
 *   ticked({ delta }) {
 *     const width = this.$el.offsetWidth; // read phase
 *     return () => {                      // write phase
 *       this.$el.style.setProperty('--x', `${(this.x += delta) % width}px`);
 *     };
 *   }
 * }
 * ```
 *
 * There is nothing to target: the frame is the framework's clock. The
 * decorator form `@withRaf()` is the same thing with a build step.
 */
export const withRaf = /* @__PURE__ */ createServiceMixin<RafHook, void>({
  hook: 'ticked',
  target: () => undefined,
  use: () => useRaf(),
});
