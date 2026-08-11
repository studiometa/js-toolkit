import { scheduler, type FrameProps } from '../scheduler.js';
import { createService, type Service } from './Service.js';

/**
 * The scheduler's frame props, verbatim: the raf service is a subscription
 * to the framework clock, not a source of its own.
 */
export type RafProps = FrameProps;

/**
 * What a `ticked()` callback may return: a function running in the same
 * frame's `write` phase, after every subscriber has measured.
 */
export type RafRender = (props: RafProps) => void;

function createRafService(): Service<RafProps> {
  let props: RafProps = { time: performance.now(), delta: 0 };

  return createService<RafProps>({
    props: () => props,
    start(emit) {
      return scheduler.frame((frameProps) => {
        props = frameProps;
        // The read → write split v3 established: every callback measures
        // together, then every returned render mutates together, so a page
        // full of animations costs one layout per frame instead of one per
        // component.
        scheduler.read(() => {
          const renders = emit(frameProps).filter(
            (result): result is RafRender => typeof result === 'function',
          );
          if (renders.length > 0) {
            scheduler.write(() => {
              for (const render of renders) {
                render(frameProps);
              }
            });
          }
        });
      });
    },
  });
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
 * scheduler's frame tick, so components ticking, scroll-driven animations
 * and lifecycle work share one flush per frame.
 */
export function useRaf(): Service<RafProps> {
  service ??= createRafService();
  return service;
}
