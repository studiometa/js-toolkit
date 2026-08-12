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
    // The element's inner box, which for `document.documentElement` is the
    // viewport — minus the classic scrollbar `innerWidth` counts in.
    props.width = target.clientWidth;
    props.height = target.clientHeight;
    props.ratio = ratioFor(props.width, props.height);
    props.orientation = orientationFor(props.width, props.height);
    return props;
  }

  return createService<ResizeProps>({
    props: () => props,
    start(emit) {
      // Both mechanisms, because neither sees what the other does.
      //
      // The `ResizeObserver` reports the element's real box, so a zoom or a
      // scrollbar appearing — which changes the layout viewport with no
      // `resize` event at all — is caught; and it delivers the current size
      // on `observe()`, so a subscriber learns where it stands without
      // waiting for a resize. No debounce is needed either: the observer
      // already delivers at most once per frame.
      //
      // The `resize` event catches what the observer structurally cannot.
      // For the root element, `clientWidth`/`clientHeight` are the *viewport*
      // rather than the element's box, and on a page taller than the viewport
      // the box does not move when the viewport height does — a mobile
      // toolbar sliding away, the on-screen keyboard opening. Measured on a
      // 3000 px document: the observer reports height 3000 while
      // `clientHeight` is 896.
      // Neither is a debounced version of the other, and the two are gated
      // differently because they are trustworthy in different ways.
      //
      // A `resize` event is the browser stating that the viewport moved, so it
      // publishes unconditionally.
      //
      // The observer is not a statement about the viewport at all: it reports
      // changes to `documentElement`'s own box, which for the root element is
      // the *document* height while `clientWidth`/`clientHeight` are the
      // viewport. The two are decoupled in both directions. A lazy image, an
      // accordion opening, an infinite scroll page or a font swap moves the box
      // and moves nothing these props report — and that fired `resized()` on
      // every component on the page, with identical values, which is why the
      // observer publishes only on a change.
      //
      // The first publish of a run is the exception, and gating it away is the
      // trap here, because it looks like a no-op: `props` was measured when the
      // service was built, so the delivery `observe()` makes on subscribe
      // carries the same values it already holds — and that delivery is how a
      // new subscriber learns where it stands without waiting for a resize.
      let hasPublished = false;
      const observer = new ResizeObserver(() => {
        const { width, height } = props;
        update();
        // `ratio` and `orientation` are functions of these two.
        if (hasPublished && props.width === width && props.height === height) {
          return;
        }
        hasPublished = true;
        emit(props);
      });
      observer.observe(target);
      const isViewport = target === document.documentElement;
      const publish = () => {
        hasPublished = true;
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

const resizeServices = /* @__PURE__ */ perTarget(createResizeService);

/**
 * Use the resize service for an element, the document element by default.
 *
 * ```js
 * const unsubscribe = useResize().subscribe(({ width, orientation }) => {
 *   el.classList.toggle('is-narrow', width < 600);
 * });
 *
 * useResize(card).subscribe(({ width }) => { … });
 * ```
 *
 * One service per element: the props describe that element's box, and its
 * observer is disconnected when its own last subscriber leaves.
 */
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

/**
 * Subscribe a component's `resized()` method to the resize service, for its
 * whole mount cycle:
 *
 * ```js
 * class Grid extends withResize(Base) {
 *   resized({ orientation }) {
 *     this.$el.dataset.orientation = orientation;
 *   }
 * }
 *
 * // The component's own box instead of the viewport.
 * class Card extends withResize(Base, { target: (instance) => instance.$el }) {
 *   resized({ width }) { … }
 * }
 * ```
 *
 * The document element is the default target, as `useResize()` with no
 * argument. The decorator form `@withResize()` is the same thing with a
 * build step.
 */
export const withResize = /* @__PURE__ */ createServiceMixin<
  ResizeHook & ServiceHandles<'resized'>,
  Element
>({
  hook: 'resized',
  target: () => document.documentElement,
  use: (target) => useResize(target),
});
