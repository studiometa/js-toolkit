import { defaultScheduler, type TickProps } from '../scheduler.js';
import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { createServiceMixin, type ServiceHandles, type ServiceMixinOptions } from './mixin.js';
import { createService, type Service } from './service.js';

/** Scheduler tick props. */
export type RafProps = TickProps;

/** A function run in the same frame's write phase. */
export type RafRender = (props: RafProps) => void;

/** The frame service. Callbacks can return a write-phase function. */
export type RafService = Service<RafProps, void | RafRender>;

function createRafService(): RafService {
  // Keep the initial delta in the scheduler's documented range.
  let props: RafProps = { time: performance.now(), delta: 1000 / 60 };
  // Track subscription state so removal between read and write cancels its render.
  const renders: Array<() => void> = [];

  const service = createService<RafProps>({
    props: () => props,
    // Frame props are current only during a tick.
    hasProps: () => false,
    start(emit) {
      return defaultScheduler.tick((tickProps) => {
        props = tickProps;
        // Run all subscriber reads before their returned writes.
        defaultScheduler.read(() => {
          renders.length = 0;
          emit(tickProps);
          if (renders.length > 0) {
            const batch = [...renders];
            renders.length = 0;
            defaultScheduler.write(() => {
              for (const render of batch) {
                render();
              }
            });
          }
        });
      });
    },
  });

  return {
    props: service.props,
    subscribe(callback, options) {
      // Do not write after the subscription is released.
      let isSubscribed = true;
      const unsubscribe = service.subscribe((tickProps) => {
        const render = callback(tickProps);
        if (typeof render === 'function') {
          renders.push(() => {
            if (isSubscribed) {
              render(tickProps);
            }
          });
        }
      }, options);
      return () => {
        isSubscribed = false;
        unsubscribe();
      };
    },
  };
}

const rafState = /* @__PURE__ */ getSharedRuntimeSlot<{
  service: RafService | undefined;
}>('service:raf', 1, () => ({ service: undefined }));

/** Use the scheduler-backed frame service. Returned functions run in the write phase. */
export function useRaf(): RafService {
  rafState.service ??= createRafService();
  return rafState.service;
}

/** The method `withRaf()` subscribes for the component. */
export interface RafHook {
  ticked?(props: RafProps): void | RafRender;
}

export type RafMixinOptions = ServiceMixinOptions<void>;

/** Subscribe `ticked()` to the frame service for each mount cycle. */
export const withRaf = /* @__PURE__ */ createServiceMixin<RafHook & ServiceHandles<'ticked'>, void>(
  {
    hook: 'ticked',
    target: () => undefined,
    use: () => useRaf(),
  },
);
