import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { createServiceMixin, type ServiceHandles, type ServiceMixinOptions } from './mixin.js';
import { createService, perTarget, type MutableProps, type Service } from './service.js';

export type ResizeOrientation = 'square' | 'landscape' | 'portrait';

export interface ResizeProps {
  readonly width: number;
  readonly height: number;
  /**
   * Width over height, `0` for an element with no height — a collapsed
   * element has no ratio, and `Infinity` or `NaN` propagate through every
   * calculation a subscriber does with it.
   */
  readonly ratio: number;
  readonly orientation: ResizeOrientation;
}

/**
 * Read from the two dimensions rather than from the ratio, so a collapsed
 * element is still described by the side it is wider on.
 */
function orientationFor(width: number, height: number): ResizeOrientation {
  if (width > height) return 'landscape';
  if (width < height) return 'portrait';
  return 'square';
}

function ratioFor(width: number, height: number): number {
  return height === 0 ? 0 : width / height;
}

function createResizeService(target: Element): Service<ResizeProps> {
  const props: MutableProps<ResizeProps> = {
    width: target.clientWidth,
    height: target.clientHeight,
    ratio: ratioFor(target.clientWidth, target.clientHeight),
    orientation: orientationFor(target.clientWidth, target.clientHeight),
  };

  function update(): ResizeProps {
    // `clientWidth` and `clientHeight` exclude classic scrollbars.
    props.width = target.clientWidth;
    props.height = target.clientHeight;
    props.ratio = ratioFor(props.width, props.height);
    props.orientation = orientationFor(props.width, props.height);
    return props;
  }

  return createService<ResizeProps>({
    props: () => props,
    start(emit) {
      // Refresh props before immediate delivery on each run.
      update();

      // ResizeObserver tracks element boxes. The window event also tracks viewport-only changes such as mobile toolbars and keyboards. Root observer updates publish only when reported viewport props change.
      const observer = new ResizeObserver(() => {
        const { width, height } = props;
        update();
        if (props.width === width && props.height === height) {
          return;
        }
        emit(props);
      });
      observer.observe(target);
      const isViewport = target === document.documentElement;
      const publish = () => {
        emit(update());
      };
      if (isViewport) {
        window.addEventListener('resize', publish, { passive: true });
      }

      return () => {
        observer.disconnect();
        if (isViewport) {
          window.removeEventListener('resize', publish);
        }
      };
    },
  });
}

const resizeServices = /* @__PURE__ */ getSharedRuntimeSlot('service:resize', 1, () =>
  perTarget(createResizeService),
);

/** Use one resize service per element. Defaults to the document element. */
export function useResize(target: Element = document.documentElement): Service<ResizeProps> {
  return resizeServices(target);
}

/**
 * Use the resize service for the viewport — `useResize()` named, the way
 * VueUse splits `useElementSize(el)` from `useWindowSize()`.
 */
export function useWindowSize(): Service<ResizeProps> {
  return resizeServices(document.documentElement);
}

/** The method `withResize()` subscribes for the component. */
export interface ResizeHook {
  resized?(props: ResizeProps): void;
}

export type ResizeMixinOptions = ServiceMixinOptions<Element>;

/** Subscribe `resized()` for each mount cycle. The document element is the default target. */
export const withResize = /* @__PURE__ */ createServiceMixin<
  ResizeHook & ServiceHandles<'resized'>,
  Element
>({
  hook: 'resized',
  target: () => document.documentElement,
  use: (target) => useResize(target),
});
