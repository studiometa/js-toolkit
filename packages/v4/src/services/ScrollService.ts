import { scheduler, type ScheduledTask } from '../scheduler.js';
import { createService, type Service } from './Service.js';

export type ScrollDirectionX = 'LEFT' | 'RIGHT' | 'NONE';
export type ScrollDirectionY = 'UP' | 'DOWN' | 'NONE';

export interface ScrollProps {
  x: number;
  y: number;
  /** Position at the previous update. */
  last: { x: number; y: number };
  delta: { x: number; y: number };
  /** Furthest scrollable position, `0` when the axis does not scroll. */
  max: { x: number; y: number };
  /** Position over `max`, from `0` to `1`. */
  progress: { x: number; y: number };
  direction: { x: ScrollDirectionX; y: ScrollDirectionY };
}

function directionX(delta: number): ScrollDirectionX {
  if (delta > 0) return 'RIGHT';
  if (delta < 0) return 'LEFT';
  return 'NONE';
}

function directionY(delta: number): ScrollDirectionY {
  if (delta > 0) return 'DOWN';
  if (delta < 0) return 'UP';
  return 'NONE';
}

function createScrollService(): Service<ScrollProps> {
  const props: ScrollProps = {
    x: window.scrollX,
    y: window.scrollY,
    last: { x: window.scrollX, y: window.scrollY },
    delta: { x: 0, y: 0 },
    max: { x: 0, y: 0 },
    progress: { x: 0, y: 0 },
    direction: { x: 'NONE', y: 'NONE' },
  };

  function update(): ScrollProps {
    const lastX = props.x;
    const lastY = props.y;
    const scrollingElement = document.scrollingElement ?? document.documentElement;

    props.x = window.scrollX;
    props.y = window.scrollY;
    props.last.x = lastX;
    props.last.y = lastY;
    props.delta.x = props.x - lastX;
    props.delta.y = props.y - lastY;
    props.max.x = scrollingElement.scrollWidth - window.innerWidth;
    props.max.y = scrollingElement.scrollHeight - window.innerHeight;
    props.progress.x = props.max.x === 0 ? 1 : props.x / props.max.x;
    props.progress.y = props.max.y === 0 ? 1 : props.y / props.max.y;
    props.direction.x = directionX(props.delta.x);
    props.direction.y = directionY(props.delta.y);

    return props;
  }

  return createService<ScrollProps>({
    props: () => props,
    start(emit) {
      let task: ScheduledTask<void> | null = null;
      const onScroll = () => {
        // One update per frame, in the phase where measuring is free.
        // v3 debounced instead, which cost 100 ms before the final position
        // was announced; a coalesced read always ends on the last event.
        task ??= scheduler.read(() => {
          task = null;
          emit(update());
        });
      };

      // Refresh before the first subscriber reads `props()`, and pick up the
      // scroll maximums of the document as it is now.
      update();
      // The window, not the document in the capture phase: the service
      // reports the document scroll, so an inner scroller triggering it
      // would only ever emit unchanged props.
      window.addEventListener('scroll', onScroll, { passive: true });
      // Resizing changes the maximums, and therefore the progress.
      window.addEventListener('resize', onScroll, { passive: true });

      return () => {
        task?.cancel();
        task = null;
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      };
    },
  });
}

let service: Service<ScrollProps> | undefined;

/**
 * Use the scroll service.
 *
 * ```js
 * const unsubscribe = useScroll().add(({ y, progress, direction }) => {
 *   el.classList.toggle('is-hidden', direction.y === 'DOWN');
 * });
 * ```
 */
export function useScroll(): Service<ScrollProps> {
  service ??= createScrollService();
  return service;
}
