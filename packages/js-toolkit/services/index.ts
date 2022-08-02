import type { DragServiceProps } from './drag.js';
import type { KeyServiceProps } from './key.js';
import type { LoadServiceProps } from './load.js';
import type { PointerServiceProps } from './pointer.js';
import type { RafServiceProps } from './raf.js';
import type { ResizeServiceProps } from './resize.js';
import type { ScrollServiceProps } from './scroll.js';

export interface ServiceInterface<T> {
  /**
   * Remove a function from the resize service by its key.
   */
  remove(key: string): void;
  /**
   * Add a callback to the service. The callback will receive the current service props as parameter.
   */
  add(key: string, callback: (props: T) => void): void;
  /**
   * Test if the service has alreaydy a callback for the given key.
   */
  has(key: string): boolean;
  /**
   * Get the service's props.
   */
  props(): T;
}

export type DragServiceInterface = ServiceInterface<DragServiceProps>;
export type KeyServiceInterface = ServiceInterface<KeyServiceProps>;
export type LoadServiceInterface = ServiceInterface<LoadServiceProps>;
export type PointerServiceInterface = ServiceInterface<PointerServiceProps>;
export type RafServiceInterface = ServiceInterface<RafServiceProps>;
export type ResizeServiceInterface<T extends Record<string, string>> = ServiceInterface<ResizeServiceProps<T>>;
export type ScrollServiceInterface = ServiceInterface<ScrollServiceProps>;

export type {
  DragServiceProps,
  KeyServiceProps,
  LoadServiceProps,
  PointerServiceProps,
  RafServiceProps,
  ResizeServiceProps,
  ScrollServiceProps,
};

export { default as useDrag } from './drag.js';
export { default as useKey } from './key.js';
export { default as useLoad } from './load.js';
export { default as usePointer } from './pointer.js';
export { default as useRaf } from './raf.js';
export { default as useResize } from './resize.js';
export { default as useScroll } from './scroll.js';
export { useService } from './service.js';
